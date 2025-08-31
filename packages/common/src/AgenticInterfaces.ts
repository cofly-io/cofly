import { MapServerType } from "@/McpInterfaces";
import { ModelSeries } from "@cofly-ai/interfaces";

export enum ToolMode {
    Function = "function",
    Prompt = "prompt",
}

export interface ChatModel {
    series?: ModelSeries | null;
    model?: string | null;
    apiKey?: string | null;
    baseUrl?: string | null;
    toolMode?: ToolMode | null;
    stream?: boolean | false;
}

export interface McpReference {
    id: string;
    name?: string;
    description?: string;
}

export interface WorkflowReference {
    id: string;
    name?: string;
    description?: string;
}

export interface ConnectReference {
    id: string;
    name: string;
    provider: string;
    kind: string;
    description?: string;
}

export interface AgenticData {
    id?: string;
    name: string;
    description?: string | null | undefined;
    systemMessage?: string | null | undefined;
    chatModel?: ChatModel | null | undefined;
    mcpServers?: McpReference[] | null | undefined;
    workflows?: WorkflowReference[] | null | undefined;
    connects?: ConnectReference[] | null | undefined;
    abilities?: AgentAbilities | null | undefined;
}

export interface AgentAbilities {
    useInternet?: boolean | false;          // 是否联网
    maxTokens?: number | 512;               // 最大token
    enableThinking?: boolean | true;        // 深度思考
    thinkingBudget?: number | 4096;         // 思想链输出的最大标记数
    minP?: number | 0.05;                   // 根据 Token 概率进行调整的动态筛选阈值
    topP?: number | 0.7;                    // 根据累积概率动态调整每个预测标记的选择数
    topK?: number | 50;                     //
    temperature?: number | 0.7;             // 确定响应中的随机程度
    frequencyPenalty?: number | 1;          // 要返回的代数
    maxIter?: number | 5;                   // 最大迭代次数
    toolMode?: ToolMode | ToolMode.Function;
}

// Agentic列表选项
export interface AgenticListOptions {
    limit?: number;
    includeRelation?: boolean | false;
}

// Agentic加载器接口
export interface IAgenticLoader {
    get(id: string, includeRelation?: boolean | false): Promise<AgenticData | undefined>;
    list(opts?: AgenticListOptions): Promise<AgenticData[] | undefined>;
}

// Agentic 相关定义
export const AgenticDef = {
    identifier: "IAgenticLoader"
};

// Agentic Thread 数据接口
export interface AgenticThreadData {
    id?: string
    agentId: string
    userId: string
    metadata: string
    createdAt?: Date,
    updatedAt?: Date
    messages?: AgenticThreadMessageData[]
}

export interface AgenticThreadMessageData {
    id?: number,
    threadId: string,
    messageType: string,
    agentName?: string | null,
    content?: string | null,
    data?: string | null,
    raw?: string | null,
    checksum: string,
    createdAt?: Date
}

// Agentic Thread 列表选项
export interface AgenticThreadListOptions {
    limit?: number;
}

// Agentic Thread Message 列表选项
export interface AgenticThreadMessageListOptions {
    threadId: string,
    limit?: number
}

export interface AgenticThreadMessageAppendOptions {
    threadId: string;
    messages: AgenticThreadMessageData[];
}

// Agentic Thread 加载器接口
export interface IAgenticThreadLoader {
    createThread(thread: AgenticThreadData) : Promise<string>;
    getThread(id: string): Promise<AgenticThreadData | undefined>;
    listThread(opts: AgenticThreadListOptions): Promise<AgenticThreadData[]>;
    appendMessages(opts: AgenticThreadMessageAppendOptions) : Promise<boolean>;
    listMessages(opts: AgenticThreadMessageListOptions) : Promise<AgenticThreadMessageData[]>;
}

// Agentic Thread 相关定义
export const AgenticThreadDef = {
    identifier: "IAgenticThreadLoader"
};