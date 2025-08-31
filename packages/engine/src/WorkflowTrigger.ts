import { inngest } from "./client"
import { JSONPath } from "@astronautlabs/jsonpath";
import { Engine, Workflow, WorkflowAction, WorkflowEdge } from "./workflow";
import { actionManager } from "./ActionManager";
import { workflowConfigManager } from "@repo/common";
import config from "./WorkflowTrigger.json"
import { WorkflowActionEvent, WorkflowEvent, WorkflowMediator } from "./WorkflowMediator";

async function workflowProcessor(opts: any) : Promise<Workflow | null | undefined> {

    let workflow: Workflow | undefined | null = undefined;
    if(typeof opts.data === "string") {
        const data = await workflowConfigManager.mediator?.get(opts.data);
        if(data) {
            workflow = data.config as Workflow;
        }
    } else {
        workflow = opts.data as unknown as Workflow;
    }

    if(!workflow) {
        return null;
    }

    const subEdges = JSONPath.query(workflow.edges, '$[?(@.subflow)]');

    if (subEdges == null || subEdges.length === 0) {
        return workflow;
    }

    const edges = JSONPath.query(workflow.edges, '$[?(!@.subflow)]');
    const subflows = new Map<string, Workflow>();

    const actionMap = new Map<string, WorkflowAction>();
    workflow.actions.forEach(action => { actionMap.set(action.id, action); });

    const edgeMap = new Map<string, WorkflowEdge>();
    edges.forEach(edge => { edgeMap.set(edge.from ,edge) });

    subEdges.forEach((edge) => {
        const node = edge.from as string;
        if (!subflows.has(node)) {
            subflows.set(node, {
                actions: new Array<WorkflowAction>(),
                edges: new Array<WorkflowEdge>()
            } as unknown as Workflow);
        }

        const findAction = function(id: string) {
            const subActions = JSONPath.query(workflow.actions, `$[?(@.id === '${id}')]`);
            if(subActions && subActions.length > 0) {
                return subActions[0];
            }

            return null;
        }

        const findEdge = function(id: string) {
            const subEdges = JSONPath.query(edges, `$[?(@.from === '${id}')]`)
            if(subEdges && subEdges.length > 0) {
                return subEdges[0];
            }

            return null;
        }

        edge.from = "$source";

        subflows.get(node)?.edges.push(edge);

        // find sub nodes
        let action : WorkflowAction = findAction(edge.to);
        while(action != null) {
            subflows.get(node)?.actions.push(action);
            actionMap.delete(action.id);

            const subEdge = findEdge(action.id);
            if(subEdge == null) {
                break;
            }

            action = findAction(subEdge.to);
            edgeMap.delete(subEdge.from);
            subflows.get(node)?.edges.push(subEdge);
        }
    })

    const convert = function<K extends string, V>(map : Map<K, V>) {
        const record : Record<string, V> = {};

        map.forEach((value, key) => {
            record[key] = value;
        })

        return record;
    }

    const result = {
        name: workflow.name,
        description: workflow.description,
        metadata: workflow.metadata,
        actions: Array.from(actionMap.values()),
        edges: Array.from(edgeMap.values()),
        subflows: convert<string, Workflow>(subflows)
    }  as Workflow;

    return result;
}

export const workflowTrigger = inngest.createFunction(
    { id: config.id },
    { event: config.event },
    async ({ event, step, publish }) => {

        const useStream = event.data?.stream === true;

        const workflowEvent : WorkflowEvent | undefined = useStream && publish !== undefined ? {
            type: 'workflow',
            status: 'RUNNING',
            startedAt: Date.now(),
        } : undefined;

        if(useStream && publish !== undefined) {
            await WorkflowMediator.publish(publish, event.id, workflowEvent);
        }

        await actionManager.initialize();

        const engine = new Engine({
            actions: [],
            loader: workflowProcessor,
        })

        engine.actions = actionManager.actions;

        const opts = { event: { ...event, event: event.data }, step, publish: useStream ? publish : undefined };

        try {
            const state = await engine.run(opts);

            if (useStream && publish !== undefined && workflowEvent !== undefined) {
                workflowEvent.status = 'COMPLETED'
                workflowEvent.endedAt = Date.now();
                await WorkflowMediator.publish(publish, event.id, workflowEvent);
            }

            return Object.fromEntries(state.state);
        } catch(error) {
            if (useStream && publish !== undefined && workflowEvent !== undefined) {
                workflowEvent.status = 'FAILED'
                workflowEvent.endedAt = Date.now();
                await WorkflowMediator.publish(publish, event.id, workflowEvent);
            }

            throw error;
        }
    });