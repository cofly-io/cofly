import { AgenticData } from "@repo/common";
import { AgentResult, StateData, Message, TextMessage, ToolCallMessage, type MaybePromise } from "./agentic";

export interface MCPToolInputSchema {
    type: string
    title: string
    description?: string
    required?: string[]
    properties: Record<string, object>
}

export interface MCPTool {
    id: string
    serverId: string
    serverName: string
    name: string
    description?: string
    inputSchema: MCPToolInputSchema
}

export interface AgentRunOptions {
    input: string;
    threadId: string;
    userId: string;
    extSystemMessage?: string;
    state?: Record<string, any>;
    waitOutput: boolean
    stream: boolean;
    persistentHistory: boolean;
    usingDefaultSystemMessage: boolean;
}

export interface AgentInvokeOptions extends AgentRunOptions {
    agentId?: string;
    agentConfig?: AgenticData;
}

export interface StreamMessage {
    type: StreamType,
    result?: AgentResult | null,
    message?: Message | TextMessage | ToolCallMessage | null,
    threadId: string,
    isCompleted: boolean,
}

export enum StreamType {
    chunk = "chunk",
    result = "result"
}

declare module "./agentic/types" {
    interface TextMessage {
        reasoning_content?: string;
        streamEnd?: boolean;
    }

    interface ToolCallMessage {
        content?: string;
        reasoning_content?: string;
    }

    interface ToolResultMessage {
        reasoning_content?: string;
    }
}

declare module "./agentic/agent" {

    namespace Agent {
        interface Lifecycle<T extends StateData> {
            onStream?: (
                args: Agent.LifecycleArgs.Stream<T>
            ) => MaybePromise<void>
        }

        namespace LifecycleArgs {
            interface Stream<T extends StateData> {
                message: TextMessage;
            }
        }
    }
}