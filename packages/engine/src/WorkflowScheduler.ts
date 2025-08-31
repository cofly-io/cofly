import { inngest } from "./client"
import { functionManager } from "./FunctionManager";
import config from "./WorkflowScheduler.json"

export const workflowScheduler = inngest.createFunction(
    { id: config.id },
    { event: config.event },
    async ({ event, step }) => {
        const action = event.data.action;
        const workflowId = event.data.workflowId;
        const funcId = `${config.id}-${workflowId}`

        if(action === "add") {
            if(functionManager.contains(funcId)) {
                functionManager.delete(funcId);
            }

            const cron = event.data.cron;

            const func = inngest.createFunction(
                { id: funcId },
                { cron: cron },
                async ({ step }) => {
                    return step.sendEvent("callback", {
                        name : event.data.callback.event,
                        data: {
                            ...event.data.callback.data
                        }
                    })
                }
            );
            functionManager.set(funcId, func);;
        } else {
            functionManager.delete(funcId);
        }
    });