import { AgenticData } from "@repo/common";
import { inngest } from "./client";
import config from "./AgentTrigger.json";
import { agentManager } from "./AgentManager";
import { AgentInvokeOptions } from "./AgentInterfaces";

export const agentTrigger = inngest.createFunction(
    { id: config.id },
    { event: config.event },
    async ({ event, publish, step }) => {

        const opts = event.data as AgentInvokeOptions;
        let config: AgenticData | undefined;
        if(opts.agentId) {
            config = await agentManager.get(opts.agentId, true);

            if(!config) {
                throw new Error(`Agent ${opts.agentId} not found.`)
            }
        } else if(opts.agentConfig) {
            config = opts.agentConfig
        }

        if(!config) {
            throw new Error(`Agent can not be triggered.`)
        }

        const agent = await agentManager.build(config);
        return await agent.run(opts, publish, step);
    });