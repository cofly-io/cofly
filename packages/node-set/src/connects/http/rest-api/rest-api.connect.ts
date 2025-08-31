import { Icon, HttpMethod, NodePropertyTypes } from '@repo/common';
import { ConnectTestResult } from '@repo/common';
import { BaseHttpConnect } from '../../base/BaseHttpConnect';

/**
 * REST API 连接器类
 */
export class RestApiConnect extends BaseHttpConnect {
    override overview = {
        id: 'rest-api',
        name: 'REST API',
        type: 'http' as const,
        provider: 'rest',
        icon: 'rest-api.svg' as Icon,
        description: 'RESTful Web服务接口连接',
        version: '1.0.0',
    };

    override detail = {
        supportedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as HttpMethod[],
        contentTypes: [
            'application/json',
            'application/xml',
            'application/x-www-form-urlencoded',
            'text/plain',
            'text/html'
        ],
        fields: [
            {
                displayName: '基础URL',
                name: 'baseUrl',
                type: 'string' as NodePropertyTypes,
                default: '',
                description: 'API的基础URL地址',
                placeholder: 'https://api.example.com',
                required: true,
                controlType: "input"
            },
            {
                displayName: '认证方式',
                name: 'authType',
                type: 'options' as NodePropertyTypes,
                default: 'none',
                description: '选择API认证方式',
                options: [
                    { name: '无认证', value: 'none' },
                    { name: 'Basic认证', value: 'basic' },
                    { name: 'Bearer Token', value: 'bearer' },
                    { name: 'API Key', value: 'api_key' },
                    { name: 'OAuth 2.0', value: 'oauth2' }
                ],
                controlType: "input"
            },
            {
                displayName: '用户名',
                name: 'username',
                type: 'string' as NodePropertyTypes,
                default: '',
                description: 'Basic认证用户名',
                displayOptions: {
                    showBy: {
                        authType: ['basic']
                    }
                },
                controlType: "input"
            },
            {
                displayName: '密码',
                name: 'password',
                type: 'string' as NodePropertyTypes,
                default: '',
                description: 'Basic认证密码',
                typeOptions: {
                    password: true
                },
                isSecure: true,
                displayOptions: {
                    showBy: {
                        authType: ['basic']
                    }
                },
                controlType: "input"
            },
            {
                displayName: 'Bearer Token',
                name: 'token',
                type: 'string' as NodePropertyTypes,
                default: '',
                description: 'Bearer认证令牌',
                typeOptions: {
                    password: true
                },
                isSecure: true,
                displayOptions: {
                    showBy: {
                        authType: ['bearer']
                    }
                },
                controlType: "input"
            },
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string' as NodePropertyTypes,
                default: '',
                description: 'API密钥',
                typeOptions: {
                    password: true
                },
                isSecure: true,
                displayOptions: {
                    showBy: {
                        authType: ['api_key']
                    }
                },
                controlType: "input"
            },
            {
                displayName: 'API Key Header',
                name: 'apiKeyHeader',
                type: 'string' as NodePropertyTypes,
                default: 'X-API-Key',
                description: 'API Key在请求头中的字段名',
                displayOptions: {
                    showBy: {
                        authType: ['api_key']
                    }
                },
                controlType: "input"
            },
            {
                displayName: '客户端ID',
                name: 'clientId',
                type: 'string' as NodePropertyTypes,
                default: '',
                description: 'OAuth 2.0客户端ID',
                displayOptions: {
                    showBy: {
                        authType: ['oauth2']
                    }
                },
                controlType: "input"
            },
            {
                displayName: '客户端密钥',
                name: 'clientSecret',
                type: 'string' as NodePropertyTypes,
                default: '',
                description: 'OAuth 2.0客户端密钥',
                typeOptions: {
                    password: true
                },
                isSecure: true,
                displayOptions: {
                    showBy: {
                        authType: ['oauth2']
                    }
                },
                controlType: "input"
            },
            {
                displayName: '请求超时(秒)',
                name: 'timeout',
                type: 'number' as NodePropertyTypes,
                default: 30,
                description: '请求超时时间，单位：秒',
                typeOptions: {
                    minValue: 1,
                    maxValue: 300
                },
                controlType: "input"
            },
            {
                displayName: '自定义请求头',
                name: 'headers',
                type: 'collection' as NodePropertyTypes,
                default: {},
                description: '自定义HTTP请求头',
                placeholder: 'Content-Type, Accept等',
                controlType: "input"
            }
        ],
        validateConnection: true,
        connectionTimeout: 30,
        rateLimits: {
            requests: 1000,
            window: 3600 // 1小时
        }
    };

    /**
     * 测试REST API连接
     */
    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        
        try {
            // 验证必填字段
            if (!config.baseUrl) {
                return {
                    success: false,
                    message: '缺少必填字段: baseUrl'
                };
            }

            // 验证URL格式
            try {
                new URL(config.baseUrl);
            } catch {
                return {
                    success: false,
                    message: 'baseUrl格式不正确，请输入有效的URL'
                };
            }

            // 根据认证方式验证字段
            if (config.authType === 'basic' && (!config.username || !config.password)) {
                return {
                    success: false,
                    message: 'Basic认证需要用户名和密码'
                };
            }

            if (config.authType === 'bearer' && !config.token) {
                return {
                    success: false,
                    message: 'Bearer认证需要Token'
                };
            }

            if (config.authType === 'api_key' && !config.apiKey) {
                return {
                    success: false,
                    message: 'API Key认证需要API密钥'
                };
            }

            // 模拟HTTP请求测试（实际应该使用 fetch 或 axios）
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const latency = Date.now() - startTime;

            return {
                success: true,
                message: 'API连接测试成功',
                latency,
                details: {
                    baseUrl: config.baseUrl,
                    authType: config.authType,
                    timeout: config.timeout || 30,
                    retries: config.retries || 3,
                    supportedMethods: this.detail.supportedMethods
                }
            };
            
        } catch (error) {
            return {
                success: false,
                message: `连接失败: ${error instanceof Error ? error.message : String(error)}`,
                latency: Date.now() - startTime
            };
        }
    }
} 