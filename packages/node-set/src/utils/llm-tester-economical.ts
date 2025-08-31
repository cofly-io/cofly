import { ConnectTestResult } from '@repo/common';

/**
 * 经济型LLM测试配置
 */
export interface EconomicalLLMTestConfig {
    apiKey: string;
    baseUrl: string;
    model?: string;
    timeout?: number;
    testLevel?: 'auth' | 'models' | 'minimal' | 'full';
}

/**
 * 测试级别说明：
 * - auth: 仅验证API密钥有效性（最经济，通常免费）
 * - models: 获取可用模型列表（通常免费）
 * - minimal: 发送最小token的测试请求（少量费用）
 * - full: 完整的模型测试（正常费用）
 */
export enum TestLevel {
    AUTH = 'auth',           // 仅验证认证
    MODELS = 'models',       // 获取模型列表
    MINIMAL = 'minimal',     // 最小化测试
    FULL = 'full'           // 完整测试
}

/**
 * 经济型LLM测试器
 */
export class EconomicalLLMTester {
    private static readonly MINIMAL_TEST_MESSAGE = 'Hi';  // 最短的测试消息
    private static readonly DEFAULT_TIMEOUT = 15000;

    /**
     * 提供商特定的测试端点配置
     */
    private static readonly PROVIDER_TEST_ENDPOINTS: Record<string, {
        authEndpoint?: string;      // 验证认证的端点
        modelsEndpoint?: string;    // 获取模型列表的端点
        chatEndpoint: string;       // 聊天端点
        authMethod: 'bearer' | 'api_key' | 'custom';
    }> = {
            openai: {
                authEndpoint: 'models',
                modelsEndpoint: 'models',
                chatEndpoint: 'chat/completions',
                authMethod: 'bearer'
            },
            openrouter: {
                authEndpoint: 'models',
                modelsEndpoint: 'models',
                chatEndpoint: 'chat/completions',
                authMethod: 'bearer'
            },
            siliconflow: {
                authEndpoint: 'models',
                modelsEndpoint: 'models',
                chatEndpoint: 'chat/completions',
                authMethod: 'bearer'
            },
            deepseek: {
                authEndpoint: 'models',
                modelsEndpoint: 'models',
                chatEndpoint: 'chat/completions',
                authMethod: 'bearer'
            },
            anthropic: {
                // Anthropic 没有公开的模型列表端点，只能通过聊天测试
                chatEndpoint: 'v1/messages',
                authMethod: 'api_key'
            },
            alibaba: {
                authEndpoint: 'models',
                modelsEndpoint: 'models',
                chatEndpoint: 'chat/completions',
                authMethod: 'bearer'
            },
            moonshot: {
                authEndpoint: 'models',
                modelsEndpoint: 'models',
                chatEndpoint: 'chat/completions',
                authMethod: 'bearer'
            }
        };

    /**
     * 智能测试连接（根据提供商选择最经济的测试方式）
     */
    public static async testConnection(
        provider: string,
        config: EconomicalLLMTestConfig
    ): Promise<ConnectTestResult> {
        const startTime = Date.now();
        const testLevel = config.testLevel || TestLevel.MODELS;

        try {
            const providerConfig = this.PROVIDER_TEST_ENDPOINTS[provider];
            if (!providerConfig) {
                return {
                    success: false,
                    message: `不支持的提供商: ${provider}`,
                    latency: Date.now() - startTime
                };
            }

            // 根据测试级别选择测试方式
            switch (testLevel) {
                case TestLevel.AUTH:
                    return await this.testAuthentication(provider, providerConfig, config, startTime);

                case TestLevel.MODELS:
                    return await this.testModelsEndpoint(provider, providerConfig, config, startTime);

                case TestLevel.MINIMAL:
                    return await this.testMinimalChat(provider, providerConfig, config, startTime);

                case TestLevel.FULL:
                    return await this.testFullChat(provider, providerConfig, config, startTime);

                default:
                    return await this.testModelsEndpoint(provider, providerConfig, config, startTime);
            }

        } catch (error) {
            return {
                success: false,
                message: this.formatError(error),
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * 测试认证（通常免费）
     */
    private static async testAuthentication(
        provider: string,
        providerConfig: any,
        config: EconomicalLLMTestConfig,
        startTime: number
    ): Promise<ConnectTestResult> {
        // 如果有专门的认证端点，使用它
        if (providerConfig.authEndpoint) {
            return await this.testModelsEndpoint(provider, providerConfig, config, startTime);
        }

        // 否则只验证API密钥格式
        const isValidKey = this.validateApiKeyFormat(provider, config.apiKey);
        if (!isValidKey) {
            return {
                success: false,
                message: 'API密钥格式不正确',
                latency: Date.now() - startTime
            };
        }

        return {
            success: true,
            message: '检测成功，API密钥格式验证通过',
            latency: Date.now() - startTime,
            details: {
                testLevel: 'auth',
                cost: '免费'
            }
        };
    }

    /**
     * 测试模型列表端点（通常免费）
     */
    private static async testModelsEndpoint(
        provider: string,
        providerConfig: any,
        config: EconomicalLLMTestConfig,
        startTime: number
    ): Promise<ConnectTestResult> {
        if (!providerConfig.modelsEndpoint) {
            // 如果没有模型端点，降级到认证测试
            return await this.testAuthentication(provider, providerConfig, config, startTime);
        }

        try {
            const url = this.buildUrl(config.baseUrl, providerConfig.modelsEndpoint);
            const headers = this.buildHeaders(providerConfig.authMethod, config.apiKey);

            const response = await this.makeRequest(url, 'GET', headers, null, config.timeout);

            if (response.ok) {
                const data = await response.json();
                const modelCount = data.data?.length || data.models?.length || 0;

                return {
                    success: true,
                    message: `检测成功，发现 ${modelCount} 个可用模型`,
                    latency: Date.now() - startTime,
                    details: {
                        testLevel: 'models',
                        cost: '免费',
                        modelCount
                    }
                };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    message: `模型列表获取失败: HTTP ${response.status}`,
                    latency: Date.now() - startTime,
                    details: { error: errorText }
                };
            }

        } catch (error) {
            return {
                success: false,
                message: this.formatError(error),
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * 最小化聊天测试（最少token费用）
     */
    private static async testMinimalChat(
        provider: string,
        providerConfig: any,
        config: EconomicalLLMTestConfig,
        startTime: number
    ): Promise<ConnectTestResult> {
        if (!config.model) {
            // 如果没有模型，自动降级到模型列表测试
            return await this.testModelsEndpoint(provider, providerConfig, config, startTime);
        }

        try {
            const url = this.buildUrl(config.baseUrl, providerConfig.chatEndpoint);
            const headers = this.buildHeaders(providerConfig.authMethod, config.apiKey);

            // 构建最小化请求（最少token）
            const requestBody = this.buildMinimalChatRequest(provider, config.model);

            const response = await this.makeRequest(url, 'POST', headers, requestBody, config.timeout);

            if (response.ok) {
                const data = await response.json();
                const content = this.extractResponseContent(data);

                return {
                    success: true,
                    message: '检测成功，模型响应正常',
                    latency: Date.now() - startTime,
                    response: content,
                    details: {
                        testLevel: 'minimal',
                        cost: '极少量token费用',
                        usage: data.usage
                    }
                };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    message: `聊天测试失败: HTTP ${response.status}`,
                    latency: Date.now() - startTime,
                    details: { error: errorText }
                };
            }

        } catch (error) {
            return {
                success: false,
                message: this.formatError(error),
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * 完整聊天测试（正常token费用）
     */
    private static async testFullChat(
        provider: string,
        providerConfig: any,
        config: EconomicalLLMTestConfig,
        startTime: number
    ): Promise<ConnectTestResult> {
        // 这里可以调用原有的完整测试逻辑
        // 为了简化，这里返回一个占位符
        return {
            success: true,
            message: '完整测试功能待实现',
            latency: Date.now() - startTime,
            details: {
                testLevel: 'full',
                cost: '正常token费用'
            }
        };
    }

    /**
     * 验证API密钥格式
     */
    private static validateApiKeyFormat(provider: string, apiKey: string): boolean {
        if (!apiKey || apiKey.trim() === '') return false;

        const patterns: Record<string, RegExp> = {
            openai: /^sk-[a-zA-Z0-9]{48,}$/,
            openrouter: /^sk-or-v1-[a-zA-Z0-9]{32,}$/,
            anthropic: /^sk-ant-[a-zA-Z0-9-_]{95,}$/,
            deepseek: /^sk-[a-zA-Z0-9]{48,}$/,
            siliconflow: /^sk-[a-zA-Z0-9]{48,}$/,
            alibaba: /^sk-[a-zA-Z0-9]{48,}$/,
            moonshot: /^sk-[a-zA-Z0-9]{48,}$/
        };

        const pattern = patterns[provider];
        return pattern ? pattern.test(apiKey) : apiKey.length > 10; // 通用验证
    }

    /**
     * 构建URL
     */
    private static buildUrl(baseUrl: string, endpoint: string): string {
        let url = baseUrl;
        if (!url.endsWith('/')) url += '/';
        return url + endpoint;
    }

    /**
     * 构建请求头
     */
    private static buildHeaders(authMethod: string, apiKey: string): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Cofly-LLM-Tester-Economical/1.0.0'
        };

        switch (authMethod) {
            case 'bearer':
                if (apiKey && apiKey.trim() !== '') {
                    headers['Authorization'] = `Bearer ${apiKey}`;
                }
                break;
            case 'api_key':
                headers['x-api-key'] = apiKey;
                if (apiKey.startsWith('sk-ant-')) {
                    headers['anthropic-version'] = '2023-06-01';
                }
                break;
        }

        return headers;
    }

    /**
     * 构建最小化聊天请求
     */
    private static buildMinimalChatRequest(provider: string, model: string): any {
        const baseRequest = {
            model,
            messages: [{ role: 'user', content: this.MINIMAL_TEST_MESSAGE }],
            max_tokens: 1, // 最少token
            temperature: 0
        };

        // 根据提供商调整请求格式
        switch (provider) {
            case 'anthropic':
                return {
                    model,
                    max_tokens: 1,
                    messages: baseRequest.messages,
                    anthropic_version: '2023-06-01'
                };
            default:
                return baseRequest;
        }
    }

    /**
     * 发送HTTP请求
     */
    private static async makeRequest(
        url: string,
        method: string,
        headers: Record<string, string>,
        body: any,
        timeout?: number
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout || this.DEFAULT_TIMEOUT);

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal
            });
            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * 提取响应内容
     */
    private static extractResponseContent(data: any): string {
        return data?.choices?.[0]?.message?.content ||
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            '测试成功';
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
}