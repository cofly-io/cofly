import { inngest, Workflow, WorkflowAction } from "./index";

export interface EventResult {
    eventId: string;
    runData: any[];
}

function resolveUrl() {
    const url = inngest.apiBaseUrl;
    if(!url) {
        return 'http://localhost:8288';
    }

    if(url.endsWith('/')) {
        return url.substring(0, url.length - 1);
    }

    return url;
}

const baseUrl = resolveUrl();

export class EventMediator {

    static url(api: string) {

        return `${baseUrl}${api.startsWith('/') ? api : '/' + api}`;
    }

    static async gql(body: string) {

        const apiUrl = this.url('/v0/gql');
        const inputs = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        };

        const response = await fetch(apiUrl, inputs);
        const json = await response.json();
        return json;
    }

    static async getEventRuns(eventId: string) {

        const apiUrl = this.url(`/v1/events/${eventId}/runs?date=${Date.now()}`);
        const inputs = {
            headers: {
                //Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
                'Content-Type': 'application/json'
            },
        };
        const response = await fetch(apiUrl, inputs);
        const json = await response.json();
        return json.data;
    }

    static async getEventOutput(eventId: string) {

        let timeout = 0;
        let runs = null;
        while (true) {
            runs = await EventMediator.getEventRuns(eventId);

            if (runs.length == 0) {
                timeout++;
                if (timeout > 200) {
                    console.log(`Function run error: ${eventId}`);
                    break;
                }
            } else {
                if (runs[0].status === "Completed") {
                    break;
                } else if (runs[0].status === "Failed" || runs[0].status === "Cancelled") {
                    console.log(`Function run stoped: ${eventId}`);
                    break;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return runs[0]?.output || [];
    }

    static async sendEvent(triggerId: string, data?: any, waitOutput: boolean = false) {

        const result = await inngest.send({
            name: triggerId,
            data: data
        });

        const json = {
            eventId: result?.ids?.length > 0 ? result.ids[0] as string : undefined,
            runData: [] as any[]
        } as EventResult;

        if (json.eventId !== undefined && waitOutput) {
            try {
                const runData = await EventMediator.getEventOutput(json.eventId);
                json.runData.push(runData);
            } catch (outputError) {
                throw outputError;
            }
        }

        return json;
    }

    static async stopEvent(eventId: string) {

        const runs = await this.getEventRuns(eventId) || [];
        if(!runs || runs.length === 0) {
            return false;
        }

        for (const run of runs) {
            if (run.status === "Running") {
                const apiUrl = this.url(`/v1/runs/${run.run_id}`);
                await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
            }
        }

        return true;
    }

    static async getEventTraceOutput(tranceId: string) {

        const body = `
        {
          "query":"\\n    query GetTraceResult($traceID: String!) {\\n  runTraceSpanOutputByID(outputID: $traceID) {\\n    input\\n    data\\n    error {\\n      message\\n      name\\n      stack\\n      cause\\n    }\\n  }\\n}\\n    ",
          "variables":{
            "traceID":"${tranceId}"
          },
          "operationName":"GetTraceResult"
        }
        `

        const json = await this.gql(body);
        return json.data.runTraceSpanOutputByID
    }

    static async getEventTrace(eventId: string, includeOutput: boolean = true, waitOutput = false) {
        const runs = await this.getEventRuns(eventId) || [];
        if(!runs || runs.length === 0) {
            return undefined;
        }

        const runId = runs.at(-1).run_id;
        const body = `
        {
            "query":"\\n    query GetRun($runID: String!, $preview: Boolean) {\\n  run(runID: $runID) {\\n    function {\\n      app {\\n        name\\n      }\\n      id\\n      name\\n      slug\\n    }\\n    trace(preview: $preview) {\\n      ...TraceDetails\\n      childrenSpans {\\n        ...TraceDetails\\n        childrenSpans {\\n          ...TraceDetails\\n          childrenSpans {\\n            ...TraceDetails\\n            childrenSpans {\\n              ...TraceDetails\\n            }\\n          }\\n        }\\n      }\\n    }\\n    hasAI\\n  }\\n}\\n    \\n    fragment TraceDetails on RunTraceSpan {\\n  name\\n  status\\n  attempts\\n  queuedAt\\n  startedAt\\n  endedAt\\n  isRoot\\n  isUserland\\n  userlandSpan {\\n    spanName\\n    spanKind\\n    serviceName\\n    scopeName\\n    scopeVersion\\n    spanAttrs\\n    resourceAttrs\\n  }\\n  outputID\\n  spanID\\n  stepID\\n  stepOp\\n  stepInfo {\\n    __typename\\n    ... on InvokeStepInfo {\\n      triggeringEventID\\n      functionID\\n      timeout\\n      returnEventID\\n      runID\\n      timedOut\\n    }\\n    ... on SleepStepInfo {\\n      sleepUntil\\n    }\\n    ... on WaitForEventStepInfo {\\n      eventName\\n      expression\\n      timeout\\n      foundEventID\\n      timedOut\\n    }\\n    ... on RunStepInfo {\\n      type\\n    }\\n    ... on WaitForSignalStepInfo {\\n      signal\\n      timeout\\n      timedOut\\n    }\\n  }\\n}\\n    ",
            "variables":{
            "runID":"${runId}",
            "preview":false
          },
          "operationName":"GetRun"
        }
        `;

        const json = await this.gql(body);
        const trace = json?.data?.run?.trace ?? null;

        // If trace is null/undefined, return null to indicate not ready yet
        if (!trace) {
            return null;
        }

        // Safely extract children spans
        const childrenSpans = Array.isArray(trace.childrenSpans) ? trace.childrenSpans as any[] : [];

        if(includeOutput && childrenSpans.length > 0) {
            for (const span of childrenSpans) {
                if (span.outputID) {
                    span.output = await this.getEventTraceOutput(span.outputID);
                }
            }

            const loadStep = childrenSpans.filter((item) => item.name === "Load workflow configuration").pop() || undefined;

            if(loadStep && loadStep.output && loadStep.output.data) {

                const workflow = JSON.parse(loadStep.output.data) as Workflow;
                const actionMap = workflow.actions.reduce((acc, action) => {
                    acc.set(action.id, action);
                    return acc;
                }, new Map<string, WorkflowAction>);
                const stepMap = childrenSpans.reduce((acc, step) => {
                    acc.set(step.name, step);
                    return acc;
                }, new Map<string, any>)

                const childs = [];
                for(const span of childrenSpans) {
                    const realName = span.name.split(":")[0];
                    if(actionMap.has(span.name)) {
                        const newStep = {
                            ...span,
                            output: JSON.parse(span.output?.data || '{}'),
                            input: JSON.parse(stepMap.get(span.name + ":start")?.output?.data || '{}')
                        };

                        if(newStep.output.status && newStep.output.data) {
                            newStep.output = newStep.output.data;
                        }

                        childs.push(newStep);
                    } else if(!stepMap.has(realName) && actionMap.has(realName)) {
                        childs.push({
                            ...span,
                            name: realName,
                            status: trace.status,
                            output: undefined,
                            input: JSON.parse(span.output?.data || '{}'),
                        });
                    }
                }

                trace.childrenSpans = childs;

                return trace;
            }
        }

        return trace;
    }

    static async getEventStepTrace(eventId: string, step: string, includeOutput: boolean = true, waitOutput = false) {

        let timeout = 0;
        while (true) {
            const runs = await EventMediator.getEventTrace(eventId, includeOutput);
            try {
                const stepData = runs?.childrenSpans?.filter((item : any) => item.name === step).pop() || undefined;
                if(stepData !== undefined && stepData.status === "COMPLETED") {
                    return stepData;
                }
                timeout++;
            } catch {
                timeout++;
            }

            if (timeout > 200) {
                console.log(`Get step log timeout: ${eventId}:${step}`);
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return undefined;
    }
}