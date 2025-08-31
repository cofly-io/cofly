import {
    Icon,
    NodePropertyTypes,
    IDisplayOptions,
    NodeParameterValueType,
    INodePropertyModeTypeOptions
} from './NodeInterfaces';

// 临时的ModelInfo类型定义，实际定义已迁移到@repo/common
export interface ModelInfo {
  id: string;
  name: string;
  group?: string;
  provider?: string;
  description?: string;
  maxTokens?: number;
  supportedFeatures?: string[];
  tags?: string[];
}

export type ConnectType =
    | 'db'
    | 'nosql-db'
    | 'vector-db'
    | 'http'
    | 'llm'
    | 'llm-embedding'
    | 'file'
    | 'api'
    | 'mq'
    | 'social'
    | 'other';

// 连接分类常量定义
 export const ConnectCategory= {
    llm: {
        name: '通用大模型',
        desc: 'deepseek、Qwen、ChatGPT、Claude、Gemini等对话式AI模型或嵌入模型'
    },
    db: {
        name: '关系数据库',
        desc: 'MySQL、PostgreSQL、Oracle、SQL Server等关系型数据库'
    },
    "nosql-db": {
        name: 'NoSQL数据库',
        desc: 'MongoDB、Redis、ClickHouse、Elasticsearch等非关系型数据库'
    },
    "vector-db": {
        name: '向量数据库',
        desc: 'Milvus、Weaviate、Qdrant、Chroma等非关系型数据库'
    },
    http: {
        name: 'HTTP',
        desc: 'RESTful Web服务接口'
    },
    social: {
        name: '社交应用',
        desc: '社交平台的OpenAPI对接方式'
    },
    other: {
        name: '消息队列',
        desc: '消息队列服务，如RabbitMQ、Kafka等'
    }
} as const;

export type ConnectCategoryType =
    (typeof ConnectCategory)[keyof typeof ConnectCategory];
    
// ============== 基础接口 ==============
/**
 * 连接状态
 */
export type ConnectStatus = 'connected' | 'disconnected' | 'testing' | 'error';

/**
 * 连接字段定义（类似于 INodeFields）
 */
export interface IConnectField {
    displayName: string;
    name: string;
    type: NodePropertyTypes;
    //typeOptions?: INodePropertyTypeOptions;
    default?: NodeParameterValueType;
    description?: string;
    hint?: string;
    placeholder?: string;
    required?: boolean;
    displayOptions?: IDisplayOptions;
    options?: Array<{ name?: string; value: string }>;// | number | boolean
    // 连接特有的属性
    isSecure?: boolean;  // 是否为敏感信息（如密码）
    testConnection?: boolean;  // 是否参与连接测试
    controlType?: string;  // UI控件类型
    typeOptions?: INodePropertyModeTypeOptions;

}

/**
 * 连接基础信息
 */
export interface IConnectBasic {
    id: string;
    name: string;
    icon: Icon;
    type: ConnectType;
    provider?: string;  // 具体的提供商，如 'mysql', 'postgresql', 'openai' 等
    description: string;
    version: string;
}

/**
 * 连接详细配置
 */
export interface IConnectDetail {
    fields: IConnectField[];
    testEndpoint?: string;  // 测试连接的端点
    validateConnection?: boolean;  // 是否支持连接验证
    connectionTimeout?: number;  // 连接超时时间（秒）
}

interface ILLMConnectDetail extends IConnectDetail {
    //supportedModels?: LLMModel[];
    supportedModels?: ModelInfo[];
    fields: [
        // 强制要求的基础字段
        // IConnectField & { name: 'apiKey'; required: true },
        // IConnectField & { name: 'baseUrl' },
        // IConnectField & { name: 'model'; required: true },
        // 允许额外的字段
        ...IConnectField[]
    ];
}

/**
 * 完整的连接定义接口
 */
export interface IConnect {
    overview: IConnectBasic;
    detail: IConnectDetail;
    test?(config: Record<string, any>): Promise<ConnectTestResult>;
}

/**
 * 连接测试结果
 */
export interface ConnectTestResult {
    success: boolean;
    message: string;
    latency?: number;  // 延迟时间（毫秒）
    response?: string; // 对话响应内容（LLM专用）
    details?: Record<string, any>;  // 额外的测试信息
}

/**
 * 数据库连接配置
 */
export interface IDatabaseConnectConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl?: boolean;
    connectionLimit?: number;
    timeout?: number;
    // 数据库特有配置
    charset?: string;  // MySQL
    schema?: string;   // PostgreSQL
    sid?: string;      // Oracle
    instance?: string; // SQL Server
}

export interface IDatabaseMetadataOptions {
    type: 'tables' | 'columns' | 'schemas' | 'models';
    datasourceId?: string;
    tableName?: string;
    search?: string;
}

export interface IDatabaseMetadataResult {
    success: boolean;
    data?: Array<{
        value: string;
        label: string;
        description?: string;
    }>;
    error?: string;
}

export interface IDatabaseExecutionOptions {
    datasourceId: string;
    sql: string;
    prams?: Record<string, any>;
}

export interface IDatabaseExecutionResult {
    success: boolean;
    data?: Array<any>;
    error?: string;
}

/**
 * 数据库连接接口
 */
export interface IDatabaseConnect extends IConnect {
    overview: IConnectBasic & {
        type: ConnectType;
        provider: string;
    };
    detail: IConnectDetail & {
        defaultPort: number;
        supportedFeatures: DatabaseFeature[];
    };
    test(config: Record<string, any>): Promise<ConnectTestResult>;
    metadata?(opts: IDatabaseMetadataOptions): Promise<IDatabaseMetadataResult>;
    execute?(opts: IDatabaseExecutionOptions): Promise<IDatabaseExecutionResult>;
}

export interface ISocialConnect extends IConnect {
    overview: IConnectBasic & {
        type: 'social';
        provider?: string;
    };
    detail: IConnectDetail & {
        defaultPort: number;
        //supportedFeatures: DatabaseFeature[];
    };
    test?(config: Record<string, any>): Promise<ConnectTestResult>;
}

/**
 * 其他连接接口
 */
export interface IOtherConnect extends IConnect {
    overview: IConnectBasic & {
        type: 'other';
        provider?: string;
    };
    detail: IConnectDetail & {
        defaultPort: number;
        supportedFeatures: DatabaseFeature[];
    };
    test?(config: Record<string, any>): Promise<ConnectTestResult>;
}

/**
 * 数据库功能特性
 */
export type DatabaseFeature =
    | 'transactions'
    | 'stored_procedures'
    | 'views'
    | 'triggers'
    | 'full_text_search'
    | 'json_support'
    | 'array_support';

// ============== HTTP 连接接口 ==============

/**
 * HTTP 认证类型
 */
export type HttpAuthType =
    | 'none'
    | 'basic'
    | 'bearer'
    | 'api_key'
    | 'oauth2'
    | 'oauth1'
    | 'digest'
    | 'custom';

/**
 * HTTP 连接配置
 */
export interface IHttpConnectConfig {
    baseUrl: string;
    authType: HttpAuthType;
    // 根据认证类型的不同配置
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    apiKeyHeader?: string;
    // OAuth 配置
    clientId?: string;
    clientSecret?: string;
    authUrl?: string;
    tokenUrl?: string;
    scope?: string;
    // 请求配置
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
    proxy?: {
        host: string;
        port: number;
        username?: string;
        password?: string;
    };
}

/**
 * HTTP 连接接口
 */
export interface IHttpConnect extends IConnect {
    overview: IConnectBasic & {
        type: 'http';
        provider: string;  // 'rest', 'graphql', 'soap', 'webhook' 等
    };
    detail: IConnectDetail & {
        supportedMethods: HttpMethod[];
        contentTypes: string[];
        rateLimits?: {
            requests: number;
            window: number;  // 时间窗口（秒）
        };
    };
}

/**
 * HTTP 方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// ============== LLM 连接接口 ==============

/**
 * LLM 提供商类型
 */
export type LLMProvider =
    | 'openai'
    | 'anthropic'
    | 'google'
    | 'azure_openai'
    | 'huggingface'
    | 'ollama'
    | 'local'
    | 'siliconflow'
    | 'meta'
    | 'mistral'
    | 'deepseek'
    | 'xai'
    | 'alibaba'
    | 'together'
    | 'baidu'
    | 'xfyun'
    | 'zhipu'
    | 'qihoo360'
    | 'moonshot'
    | 'tencent'
    | 'baichuan'
    | 'minimax'
    | 'groq'
    | 'lingyiwanwu'
    | 'stepfun'
    | 'custom'
    | 'other';

/**
 * LLM 模型类型
 */
export type LLMModelType = 'chat' | 'completion' | 'embedding' | 'image' | 'audio';

/**
 * LLM 连接配置
 */
export interface ILLMConnectConfig {
    provider: LLMProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
    modelType: LLMModelType;
    // 模型参数
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    // 连接参数
    timeout?: number;
    retries?: number;
    // 自定义配置
    customHeaders?: Record<string, string>;
    customParams?: Record<string, any>;
}

type ConnectTags = 'domestic' | 'international' | 'free' | 'paid';

/**
 * LLM 连接接口
 */
type LLMDriver = 'openai' | 'gemini' | 'grok' | 'anthropic';

export interface ILLMOverview extends IConnectBasic {
    type: 'llm';
    provider: LLMProvider;
    api: { url: string, suffix?: string };//对话地址
    driver?: LLMDriver;//驱动类型
    tags?: ConnectTags[];
    about?: {
        apiHost?: string;//api地址
        getKeyUrl?: string;//apiKey申请地址
        docUrl?: string;//文档帮助地址
        modelUrl?: string;//模型市场地址
    };
}

export interface ILLMMetadataOptions {
    // 新增：LLM模型相关的配置信息
    connectInfo?: {
        modelUrl?: string;
        supportedModels?: Array<{
            id: string;
            name: string;
            group?: string;
            description?: string;
        }>;
        apiKey?: string;
        baseUrl?: string;
    };
}

export interface ILLMMetadataResult {
    success: boolean;
    data?: Array<{
        value: string;
        label: string;
        description?: string;
    }>;
    error?: string;
}

export interface ILLMConnect extends IConnect {
    overview: ILLMOverview & {
    };
    detail: ILLMConnectDetail & {
    };
    test(config: Record<string, any>, message?: string): Promise<ConnectTestResult>;
    metadata?(opts: ILLMMetadataOptions): Promise<ILLMMetadataResult>;
    //chat?(config: Record<string, any>, message: string): Promise<ConnectTestResult>;
    //streamChat?(config: Record<string, any>, message: string, onChunk?: (chunk: string) => void): Promise<ConnectTestResult>;
}

/**
 * LLM 模型信息
 */
export interface LLMModel {
    id: string;
    name: string;
    type: LLMModelType[];
    contextLength: number;
    pricing?: {
        input: number;   // 每1K tokens价格
        output: number;  // 每1K tokens价格
    };
}

/**
 * LLM 功能特性
 */
export type LLMFeature =
    | 'streaming'
    | 'function_calling'
    | 'vision'
    | 'json_mode'
    | 'system_message'
    | 'fine_tuning';

// ============== 连接实例接口 ==============

/**
 * 连接实例（用户创建的连接配置）
 */
export interface IConnectInstance {
    id: string;
    name: string;
    connectId: string;  // 引用的连接定义ID
    config: Record<string, any>;  // 具体的配置值
    status: ConnectStatus;
    createdAt: Date;
    updatedAt: Date;
    lastTestedAt?: Date;
    tags?: string[];
    description?: string;
}

// ============== 连接注册表接口 ==============

/**
 * 连接注册表接口
 */
export interface IConnectRegistry {
    registerConnect(connect: IConnect): void;
    getConnectById(id: string): IConnect | undefined;
    getConnectsByType(type: ConnectType): IConnect[];
    getConnectsByProvider(provider: string): IConnect[];
    getAllConnects(): IConnect[];
    testConnection(connectId: string, config: Record<string, any>): Promise<ConnectTestResult>;
    getStatistics?(): {
        total: number;
        byType: Record<ConnectType, number>;
        byProvider: Record<string, number>;
    };
}

// ============== 工厂接口 ==============

/**
 * 连接工厂接口
 */
export interface IConnectFactory {
    createConnect(type: ConnectType, provider: string): IConnect;
    createInstance(connectId: string, config: Record<string, any>): IConnectInstance;
}

// ============== 连接加载器接口 ==============

/**
 * 连接加载器配置
 */
export interface IConnectLoaderConfig {
    connectsPaths: string[];
    filePattern?: string;
    ignorePatterns?: string[];
}

/**
 * 抽象连接加载器
 */
export abstract class AbstractConnectLoader {
    protected connectRegistry: IConnectRegistry;

    constructor(connectRegistry: IConnectRegistry) {
        this.connectRegistry = connectRegistry;
    }

    abstract loadConnects(): Promise<void>;

    protected registerConnect(connectInstance: IConnect): void {
        this.connectRegistry.registerConnect(connectInstance);
    }

    protected registerConnects(connects: IConnect[]): void {
        connects.forEach(connect => this.registerConnect(connect));
    }

    getConnectRegistry(): IConnectRegistry {
        return this.connectRegistry;
    }
}