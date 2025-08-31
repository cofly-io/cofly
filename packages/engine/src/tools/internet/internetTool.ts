import { z } from "zod";
import { createTool } from "../../agentic";
import { exa } from "./exa";

export const internetTool = createTool({
    name: "internet-tool",
    description: `internet web search tool for agent;这是一个可以为智能体/大模型提供互联网搜索的工具`,
    parameters: z.object({
        query: z.string(),
    }),
    handler: async (input) => {
        return await exa(input.query)
    },
});