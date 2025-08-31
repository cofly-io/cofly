import { ConnectTestResult } from '@repo/common';

/**
 * LLM测试配置接口
 */
export interface LLMTestConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
    timeout?: number;
    headers?: Record<string, string>;
    // 通用模型参数
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    // Ollama特定参数
    repeatPenalty?: number;
    systemPrompt?: string;
    // 特殊认证字段
    secretKey?: string; // 百度
    secretId?: string; // 腾讯
    region?: string; // 腾讯
    appId?: string; // 讯飞
    apiSecret?: string; // 讯飞
    groupId?: string; // MiniMax
}

/**
 * 标准化的聊天请求格式
 */
export interface StandardChatRequest {
    model: string;
    messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
    }>;
    max_tokens?: number;
    temperature?: number;
    stream?: boolean;
}

/**
 * 标准化的聊天响应格式
 */
export interface StandardChatResponse {
    id?: string;
    object?: string;
    created?: number;
    model?: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason?: string;
    }>;
    usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
    };
}

/**
 * LLM提供商类型
 */
export enum LLMProviderType {
    OPENAI_COMPATIBLE = 'openai_compatible', // OpenAI兼容格式
    CUSTOM = 'custom' // 自定义格式
}

/**
 * 提供商配置
 */
export interface ProviderConfig {
    type: LLMProviderType;
    authMethod: 'bearer' | 'api_key' | 'custom';
    endpoint: string;
    requestTransformer?: (request: StandardChatRequest, config: LLMTestConfig) => any;
    responseTransformer?: (response: any) => StandardChatResponse;
    errorHandler?: (error: any) => string;
}

/**
 * 通用LLM测试器
 */
export class LLMTester {
    private static readonly DEFAULT_TEST_MESSAGE = 'Hello, this is a connection test. Please respond with "Connection successful".';
    private static readonly DEFAULT_TIMEOUT = 30000; // 30秒

    /**
     * 提供商配置映射
     */
    private static readonly PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
        // OpenAI兼容提供商
        openai: {
            type: LLMProviderType.OPENAI_COMPATIBLE,
            authMethod: 'bearer',
            endpoint: 'chat/completions'
        },
        siliconflow: {
            type: LLMProviderType.OPENAI_COMPATIBLE,
            authMethod: 'bearer',
            endpoint: 'chat/completions'
        },
        deepseek: {
            type: LLMProviderType.OPENAI_COMPATIBLE,
            authMethod: 'bearer',
            endpoint: 'chat/completions'
        },
        anthropic: {
            type: LLMProviderType.CUSTOM,
            authMethod: 'api_key',
            endpoint: 'v1/messages',
            requestTransformer: (request, config) => ({
                model: request.model,
                max_tokens: request.max_tokens || 1000,
                messages: request.messages,
                anthropic_version: '2023-06-01'
            })
        },
        google: {
            type: LLMProviderType.CUSTOM,
            authMethod: 'api_key',
            endpoint: 'v1beta/models/{model}:generateContent',
            requestTransformer: (request, config) => ({
                contents: request.messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                })),
                generationConfig: {
                    maxOutputTokens: request.max_tokens || 1000,
                    temperature: request.temperature || 0.7
                }
            }),
            responseTransformer: (response) => ({
                choices: [{
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: response?.candidates?.[0]?.content?.parts?.[0]?.text || ''
                    },
                    finish_reason: 'stop'
                }],
                usage: {
                    prompt_tokens: response?.usageMetadata?.promptTokenCount || 0,
                    completion_tokens: response?.usageMetadata?.candidatesTokenCount || 0,
                    total_tokens: response?.usageMetadata?.totalTokenCount || 0
                }
            })
        },
        baidu: {
            type: LLMProviderType.CUSTOM,
            authMethod: 'custom',
            endpoint: 'rpc/2.0/ai_custom/v1/wenxinworkshop/chat/{model}',
            requestTransformer: (request, config) => ({
                messages: request.messages,
                max_output_tokens: request.max_tokens || 1000,
                temperature: request.temperature || 0.7
            })
        },
        ollama: {
            type: LLMProviderType.CUSTOM,
            authMethod: 'bearer', // Ollama通常不需要认证，但保持一致性
            endpoint: 'api/chat',
            requestTransformer: (request, config) => ({
                model: request.model,
                messages: request.messages,
                stream: false,
                options: {
                    temperature: config.temperature || request.temperature || 0.7,
                    top_p: config.topP || 0.9,
                    repeat_penalty: config.repeatPenalty || 1.1,
                    num_predict: config.maxTokens || request.max_tokens || 2048
                }
            }),
            responseTransformer: (response) => ({
                choices: [{
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: response?.message?.content || ''
                    },
                    finish_reason: response?.done ? 'stop' : 'length'
                }],
                usage: {
                    prompt_tokens: response?.prompt_eval_count || 0,
                    completion_tokens: response?.eval_count || 0,
                    total_tokens: (response?.prompt_eval_count || 0) + (response?.eval_count || 0)
                }
            })
        }
    };

    /**
     * 测试LLM连接
     */
    public static async testConnection(
        provider: string,
        config: LLMTestConfig,
        message?: string
    ): Promise<ConnectTestResult> {
        const startTime = Date.now();
        
        try {
            // 获取提供商配置
            const providerConfig = this.PROVIDER_CONFIGS[provider];
            if (!providerConfig) {
                return {
                    success: false,
                    message: `不支持的提供商: ${provider}`,
                    latency: Date.now() - startTime
                };
            }

            // 构建请求
            const testMessage = message || this.DEFAULT_TEST_MESSAGE;
            const request: StandardChatRequest = {
                model: config.model,
                messages: [
                    { role: 'user', content: testMessage }
                ],
                max_tokens: 100,
                temperature: 0.7,
                stream: false
            };

            // 发送请求
            const response = await this.sendRequest(provider, providerConfig, config, request);
            
            // 验证响应
            const isValid = this.validateResponse(response);
            if (!isValid) {
                return {
                    success: false,
                    message: '响应格式不正确或为空',
                    latency: Date.now() - startTime
                };
            }

            // 由于已经通过validateResponse验证，可以安全地访问这些属性
            const responseContent = response.choices[0]!.message!.content || '测试成功，但未返回内容';
            
            return {
                success: true,
                message: `${provider}连接测试成功`,
                latency: Date.now() - startTime,
                response: responseContent,
                details: {
                    model: config.model,
                    usage: response.usage
                }
            };

        } catch (error) {
            return {
                success: false,
                message: this.formatError(error),
                latency: Date.now() - startTime,
                details: {
                    error: error instanceof Error ? error.message : String(error)
                }
            };
        }
    }

    /**
     * 发送HTTP请求
     */
    private static async sendRequest(
        provider: string,
        providerConfig: ProviderConfig,
        config: LLMTestConfig,
        request: StandardChatRequest
    ): Promise<StandardChatResponse> {
        // 构建URL
        let url = config.baseUrl;
        if (!url.endsWith('/')) url += '/';
        
        let endpoint = providerConfig.endpoint;
        if (endpoint.includes('{model}')) {
            endpoint = endpoint.replace('{model}', config.model);
        }
        url += endpoint;

        // 转换请求格式
        const requestBody = providerConfig.requestTransformer 
            ? providerConfig.requestTransformer(request, config)
            : request;

        // 构建请求头
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Cofly-LLM-Tester/1.0.0',
            ...config.headers
        };

        // 添加认证头
        this.addAuthHeaders(headers, providerConfig, config);

        // 发送请求
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.DEFAULT_TIMEOUT);
        
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();

        // 转换响应格式
        return providerConfig.responseTransformer 
            ? providerConfig.responseTransformer(responseData)
            : responseData;
    }

    /**
     * 添加认证头
     */
    private static addAuthHeaders(
        headers: Record<string, string>,
        providerConfig: ProviderConfig,
        config: LLMTestConfig
    ): void {
        switch (providerConfig.authMethod) {
            case 'bearer':
                // Ollama通常不需要API密钥，跳过认证
                if (config.apiKey && config.apiKey.trim() !== '') {
                    headers['Authorization'] = `Bearer ${config.apiKey}`;
                }
                break;
            case 'api_key':
                if (config.apiKey.startsWith('sk-ant-')) {
                    // Anthropic
                    headers['x-api-key'] = config.apiKey;
                    headers['anthropic-version'] = '2023-06-01';
                } else {
                    // Google等
                    headers['x-api-key'] = config.apiKey;
                }
                break;
            case 'custom':
                this.addCustomAuthHeaders(headers, config);
                break;
        }
    }

    /**
     * 添加自定义认证头
     */
    private static addCustomAuthHeaders(
        headers: Record<string, string>,
        config: LLMTestConfig
    ): void {
        if (config.secretKey) {
            // 百度文心千帆 - 需要获取access_token
            headers['Authorization'] = `Bearer ${config.apiKey}`;
        }
        if (config.secretId && config.secretKey) {
            // 腾讯云 - 需要实现TC3签名
            headers['Authorization'] = `TC3-HMAC-SHA256 ${config.secretId}`;
        }
        if (config.appId && config.apiSecret) {
            // 讯飞星火 - 需要实现WebSocket或HTTP签名
            headers['Authorization'] = `Bearer ${config.apiKey}`;
        }
    }

    /**
     * 验证响应格式
     */
    private static validateResponse(response: StandardChatResponse): boolean {
        return !!(
            response &&
            response.choices &&
            response.choices.length > 0 &&
            response?.choices[0]?.message &&
            response?.choices[0]?.message?.content &&
            response?.choices[0]?.message?.content?.trim().length > 0
        );
    }

    /**
     * 格式化错误信息
     */
    private static formatError(error: any): string {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return '请求超时';
            }
            if (error.message.includes('fetch')) {
                return '网络连接失败';
            }
            return error.message;
        }
        return String(error);
    }

    /**
     * 获取支持的提供商列表
     */
    public static getSupportedProviders(): string[] {
        return Object.keys(this.PROVIDER_CONFIGS);
    }

    /**
     * 检查提供商是否支持
     */
    public static isProviderSupported(provider: string): boolean {
        return provider in this.PROVIDER_CONFIGS;
    }
} 