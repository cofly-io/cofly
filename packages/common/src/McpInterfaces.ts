// MCP相关接口定义
export enum MapServerType {
    STDIO = 'stdio',
    SSE = 'sse',
    Streamable = 'streamable',
}

export interface McpServerConfig {
    id: string;
    name: string;
    description: string;
    type: MapServerType;
    isActive: boolean;
    timeout?: number;
}

export interface StdioMcpServerConfig extends McpServerConfig {
    command: string;
    args?: string[];
    env?: Record<string, string>;
}

export interface HttpMcpServerConfig extends McpServerConfig {
    url: string;
    headers?: Record<string, string>;
}

// MCP数据接口
export interface McpData {
    id: string;
    name: string;
    type: string;
    config: McpServerConfig | StdioMcpServerConfig | HttpMcpServerConfig
}

// MCP列表选项
export interface McpListOptions {
    limit?: number;
}

// MCP加载器接口
export interface IMcpLoader {
    get(id: string): Promise<McpData | undefined>;
    list(opts?: McpListOptions): Promise<McpData[]>;
}

// MCP 相关定义
export const McpDef = {
    identifier: "IMcpLoader"
}