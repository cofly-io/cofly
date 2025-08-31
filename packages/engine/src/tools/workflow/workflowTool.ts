import { z } from "zod";
import { createTool } from "../../agentic"
import { workflowConfigManager } from "@repo/common";
import { agentManager } from "../../AgentManager";
import { EventMediator } from "../../EventMediator";
import trigger from "../../WorkflowTrigger.json"

export const workflowListTool = createTool({
    name: "workflow-list-tool",
    description: "workflow search tool for agent;这是一个为智能体/大模型查询当前工作环境中的工作流列表的工具",
    parameters: z.object({
        limit: z.optional(z.number()),
    }),
    handler: async (input, opts) => {
        const agent = agentManager.getByName(opts.agent.name);
        if(!agent) {
            return [];
        }
        return agent.workflows;
    },
});

export const workflowRunTool = createTool({
    name: "workflow-run-tool",
    description: "workflow run tool for agent;这是一个为智能体/大模型执行当前工作环境中的工作流的工具，使用这个工具之前，需要先使用workflow-list-tool查询出需要使用的工作流",
    parameters: z.object({
        workflowId: z.string(),
    }),
    handler: async (input, opts) => {
        const config = await workflowConfigManager.mediator.get(input.workflowId);
        if(config) {
            return EventMediator.sendEvent(trigger.event, config, true);
        }

        throw new Error("Workflow not found");
    },
});