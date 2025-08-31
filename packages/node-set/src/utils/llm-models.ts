/**
 * LLM模型相关的公共工具函数
 * 用于处理各种LLM提供商的模型获取、解析和标准化
 */

import { IDatabaseMetadataResult } from '@repo/common';

/**
 * 连接信息接口
 */
export interface LLMConnectInfo {
    ctype: string;
    baseUrl: string;
    apiKey: string;
    supportedModels: any[];
}

/**
 * 模型数据接口
 */
export interface ModelData {
    id: string;
    name: string;
    description?: string;
    contextLength?: number;
    pricing?: any;
    group?: string;
    tags?: string[];
}

/**
 * 获取LLM模型列表的通用方法
 */
export async function getLLMModels(
    datasourceId: string | undefined,
    search: string | undefined,
    providerName: string,
    apiUrl: string,
    supportedModels: any[],
    options: {
        buildApiUrl?: (baseUrl: string, ctype: string) => string;
        parseResponse?: (data: any, ctype: string) => any[];
        isValidModel?: (model: any, ctype: string) => boolean;
        transformModel?: (model: any, ctype: string) => any;
        extractGroup?: (modelId: string) => string;
    } = {}
): Promise<IDatabaseMetadataResult> {
    if (!datasourceId) {
        return {
            success: false,
            error: '数据源ID不能为空'
        };
    }

    try {
        // 获取连接配置
        const { credentialManager } = await import('@repo/common');
        const connectConfig = await credentialManager.mediator?.get(datasourceId);
        if (!connectConfig) {
            return {
                success: false,
                error: `连接配置不存在: ${datasourceId}`
            };
        }

        const configData = connectConfig.config;

        const connectInfo: LLMConnectInfo = {
            ctype: providerName.toLowerCase(),
            baseUrl: configData.baseUrl || apiUrl,
            apiKey: configData.apiKey,
            supportedModels: supportedModels
        };

        // 1. 尝试从API动态获取模型列表
        let models = [];

        if (connectInfo.baseUrl && connectInfo.apiKey) {
            try {
                models = await fetchModelsFromProvider(connectInfo, options);
            } catch (error) {
                console.error(`❌ [${providerName} Connect] API获取模型失败，错误详情:`, {
                    message: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined
                });
            }
        }

        // 2. 如果API获取失败或无结果，使用静态模型列表
        if (models.length === 0 && connectInfo.supportedModels) {
            models = connectInfo.supportedModels;
        }

        // 3. 标准化模型数据格式
        const standardizedModels = standardizeModels(models, connectInfo.ctype, options.extractGroup);

        // 4. 应用搜索过滤
        let filteredModels = standardizedModels;
        if (search) {
            filteredModels = filterModelsBySearch(standardizedModels, search);
        }

        // 5. 转换为UI选项格式
        const modelOptions = filteredModels.map((model: any) => ({
            value: model.id, // 使用实际的模型ID作为值，如 "deepseek/deepseek-r1-0528:free"
            label: model.name || model.id // 使用友好的显示名称作为标签，如 "DeepSeek: R1 0528 (free)"
        }));

        return {
            success: true,
            data: modelOptions
        };

    } catch (error: any) {
        console.error(`❌ [${providerName} Connect] 获取模型失败:`, error.message);
        return {
            success: false,
            error: `获取模型失败: ${error.message}`
        };
    }
}

/**
 * 从提供商API获取模型列表
 */
export async function fetchModelsFromProvider(
    connectInfo: LLMConnectInfo,
    options: {
        buildApiUrl?: (baseUrl: string, ctype: string) => string;
        parseResponse?: (data: any, ctype: string) => any[];
        isValidModel?: (model: any, ctype: string) => boolean;
        transformModel?: (model: any, ctype: string) => any;
    } = {}
): Promise<any[]> {
    const { ctype, baseUrl, apiKey } = connectInfo;

    // 构建API端点
    const apiUrl = options.buildApiUrl ? 
        options.buildApiUrl(baseUrl, ctype) : 
        buildDefaultModelsApiUrl(baseUrl);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    // 添加认证头
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
        console.warn(`⚠️ [${ctype} Connect] 缺少API Key`);
    }

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(15000) // 15秒超时
    });

    if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return options.parseResponse ? 
        options.parseResponse(data, ctype) : 
        parseDefaultModelResponse(data, ctype, options);
}

/**
 * 构建默认的模型API端点
 */
export function buildDefaultModelsApiUrl(baseUrl: string): string {
    // 确保baseUrl不以/结尾
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    // 默认使用OpenAI标准的/v1/models端点
    if (cleanBaseUrl.endsWith('/v1')) {
        return `${cleanBaseUrl}/models`;
    } else {
        return `${cleanBaseUrl}/v1/models`;
    }
}

/**
 * 解析默认的模型响应数据
 */
export function parseDefaultModelResponse(
    data: any, 
    ctype: string,
    options: {
        isValidModel?: (model: any, ctype: string) => boolean;
        transformModel?: (model: any, ctype: string) => any;
    } = {}
): any[] {
    let models: any[] = [];

    // 1. OpenAI 标准格式：{ "object": "list", "data": [...] }
    if (data.object === "list" && Array.isArray(data.data)) {
        models = data.data;
    }
    // 2. 简化格式：{ "data": [...] }
    else if (data.data && Array.isArray(data.data)) {
        models = data.data;
    }
    // 3. 直接数组格式：[...]
    else if (Array.isArray(data)) {
        models = data;
    }
    // 4. 其他格式
    else {
        console.warn(`⚠️ [${ctype} Connect] 未知的响应格式:`, {
            type: typeof data,
            sample: JSON.stringify(data).substring(0, 200)
        });
        return [];
    }

    // 过滤和转换模型数据
    const filteredModels = models
        .filter((model: any) => {
            return options.isValidModel ? 
                options.isValidModel(model, ctype) : 
                isDefaultValidModel(model);
        })
        .map((model: any) => {
            return options.transformModel ? 
                options.transformModel(model, ctype) : 
                transformDefaultModelData(model);
        });

    return filteredModels;
}

/**
 * 默认的模型验证函数
 */
export function isDefaultValidModel(model: any): boolean {
    return !!(model && model.id);
}

/**
 * 默认的模型数据转换函数
 */
export function transformDefaultModelData(model: any): ModelData {
    return {
        id: model.id,
        name: model.name || model.id,
        description: model.description || undefined,
        contextLength: model.context_length || model.max_tokens || undefined,
        pricing: model.pricing || undefined
    };
}

/**
 * 标准化模型数据
 */
export function standardizeModels(
    models: any[], 
    ctype: string,
    extractGroup?: (modelId: string) => string
): ModelData[] {
    return models.map(model => {
        // 如果已经是标准化格式，直接返回
        if (model.group && model.tags) {
            return model;
        }

        // 标准化处理
        return {
            id: model.id,
            name: model.name || model.id,
            group: model.group || (extractGroup ? extractGroup(model.id) : 'Other'),
            description: model.description,
            contextLength: model.contextLength,
            pricing: model.pricing,
            tags: model.tags || []
        };
    });
}

/**
 * 根据搜索关键词过滤模型
 */
export function filterModelsBySearch(models: ModelData[], search: string): ModelData[] {
    const searchLower = search.toLowerCase();
    return models.filter((model: ModelData) =>
        model.name?.toLowerCase().includes(searchLower) ||
        model.id?.toLowerCase().includes(searchLower) ||
        model.description?.toLowerCase().includes(searchLower) ||
        model.group?.toLowerCase().includes(searchLower)
    );
}

/**
 * OpenRouter特定的分组提取函数
 */
export function extractOpenRouterGroup(modelId: string): string {
    if (modelId.includes('openai/')) return 'OpenAI';
    if (modelId.includes('anthropic/')) return 'Anthropic';
    if (modelId.includes('meta-llama/')) return 'Meta';
    if (modelId.includes('deepseek/')) return 'DeepSeek';
    if (modelId.includes('google/')) return 'Google';
    if (modelId.includes('mistralai/')) return 'Mistral AI';
    if (modelId.includes('cohere/')) return 'Cohere';
    if (modelId.includes('perplexity/')) return 'Perplexity';
    
    return 'Other';
}

/**
 * SiliconFlow特定的模型验证函数
 */
export function isSiliconFlowValidModel(model: any, ctype: string): boolean {
    if (!model || !model.id) {
        return false;
    }
    // SiliconFlow的模型ID通常包含 '/'
    return model.id.includes('/');
}

/**
 * SiliconFlow特定的API URL构建函数
 */
export function buildSiliconFlowApiUrl(baseUrl: string, ctype: string): string {
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    
    // SiliconFlow的baseUrl已经包含/v1，直接添加/models即可
    if (cleanBaseUrl.endsWith('/v1')) {
        return `${cleanBaseUrl}/models`;
    } else {
        return `${cleanBaseUrl}/v1/models`;
    }
}

/**
 * SiliconFlow特定的模型数据转换函数
 */
export function transformSiliconFlowModelData(model: any, ctype: string): ModelData {
    const modelId = model.id;
    // SiliconFlow的模型名称保持完整格式
    const modelName = modelId;

    return {
        id: modelId,
        name: modelName,
        description: model.description || undefined,
        contextLength: model.context_length || undefined,
        pricing: model.pricing || undefined
    };
}