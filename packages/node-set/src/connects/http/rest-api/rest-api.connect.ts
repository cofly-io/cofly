import { Icon, HttpMethod, IHttpConnectConfig, IConnectDetail } from '@repo/common';
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
                label: '基础URL',
                fieldName: 'baseUrl',
                description: 'API的基础URL地址',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: 'http://192.168.1.100 或 https://api.example.com'
                }
            },
            {
                label: '健康检查端点',
                fieldName: 'testEndpoint',
                description: '用于测试连接的API端点路径',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '/health',
                    placeholder: '/api/health 或 /api/status 或具体的测试接口如 /api/test'
                }
            },
            {
                label: '认证方式',
                fieldName: 'authType',
                description: '选择API认证方式',
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'basic',
                    options: [
                        { name: 'Basic认证', value: 'basic' },
                        { name: 'Bearer Token', value: 'bearer' },
                        { name: 'Digest认证', value: 'digest' },
                        { name: 'Header认证', value: 'header' },
                        { name: 'OAuth 2.0', value: 'oauth2' },
                        { name: '自定义认证', value: 'custom' }
                    ]
                }
            },
            // Basic认证字段
            {
                label: '用户名',
                fieldName: 'username',
                description: '认证用户名',
                conditionRules: {
                    showBy: {
                        authType: ['basic','digest']
                    }
                },
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: { required: true }
                }
            },
            {
                label: '密码',
                fieldName: 'password',
                description: '认证密码',
                conditionRules: {
                    showBy: {
                         authType: ['basic','digest']
                    }
                },
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    attributes: [{ type: 'password' }],
                    validation: { required: true }
                }
            },
            // Bearer Token字段
            {
                label: 'Bearer Token',
                fieldName: 'token',
                description: 'Bearer认证令牌',
                conditionRules: {
                    showBy: {
                        authType: ['bearer']
                    }
                },
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    attributes: [{ type: 'password' }],
                    validation: { required: true }
                }
            },
            // JSON认证字段
            // {
            //     label: 'Digest认证',
            //     fieldName: 'digestAuth',
            //     description: '密码传输方式哈希值（如MD5）',
            //     conditionRules: {
            //         showBy: {
            //             authType: ['json']
            //         }
            //     },
            //     control: {
            //         name: 'textarea' as const,
            //         dataType: 'string' as const,
            //         defaultValue: '',
            //         placeholder: '{"username": "your_username", "password": "your_password"}',
            //         validation: { required: true }
            //     }
            // },
            // Header认证字段
            {
                label: '认证Header名称',
                fieldName: 'headerName',
                description: '认证Header的名称',
                conditionRules: {
                    showBy: {
                        authType: ['header']
                    }
                },
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: 'X-API-Key',
                    validation: { required: true }
                }
            },
            {
                label: '认证Header值',
                fieldName: 'headerValue',
                description: '认证Header的值',
                conditionRules: {
                    showBy: {
                        authType: ['header']
                    }
                },
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    attributes: [{ type: 'password' }],
                    validation: { required: true }
                }
            },
            // OAuth 2.0字段
            {
                label: '客户端ID',
                fieldName: 'clientId',
                description: 'OAuth 2.0客户端ID',
                conditionRules: {
                    showBy: {
                        authType: ['oauth2']
                    }
                },
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: { required: true }
                }
            },
            {
                label: '客户端密钥',
                fieldName: 'clientSecret',
                description: 'OAuth 2.0客户端密钥',
                conditionRules: {
                    showBy: {
                        authType: ['oauth2']
                    }
                },
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    attributes: [{ type: 'password' }],
                    validation: { required: true }
                }
            },
            {
                label: 'Token URL',
                fieldName: 'tokenUrl',
                description: 'OAuth 2.0令牌URL',
                conditionRules: {
                    showBy: {
                        authType: ['oauth2']
                    }
                },
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    placeholder: 'https://api.example.com/oauth/token',
                    validation: { required: true }
                }
            },
            {
                label: '授权范围',
                fieldName: 'scope',
                description: 'OAuth 2.0授权范围',
                conditionRules: {
                    showBy: {
                        authType: ['oauth2']
                    }
                },
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: 'read write',
                    placeholder: '例如: read write'
                }
            },
            {
                label: '授权类型',
                fieldName: 'grantType',
                description: 'OAuth 2.0授权类型',
                conditionRules: {
                    showBy: {
                        authType: ['oauth2']
                    }
                },
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'client_credentials',
                    options: [
                        { name: '客户端凭证', value: 'client_credentials' },
                        { name: '密码凭证', value: 'password' },
                        { name: '授权码', value: 'authorization_code' },
                        { name: '刷新令牌', value: 'refresh_token' }
                    ]
                }
            },
            // 自定义认证字段
            {
                label: '自定义认证配置',
                fieldName: 'customAuth',
                description: '自定义认证的配置信息',
                conditionRules: {
                    showBy: {
                        authType: ['custom']
                    }
                },
                control: {
                    name: 'textarea' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    placeholder: '请输入自定义认证的配置信息（JSON格式）',
                    validation: { required: true }
                }
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
    async test(config: IHttpConnectConfig & IConnectDetail): Promise<ConnectTestResult> {
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
            let url: URL;
            try {
                url = new URL(config.baseUrl);
            } catch {
                return {
                    success: false,
                    message: 'baseUrl格式不正确，请输入有效的URL'
                };
            }

            // 根据认证方式验证字段
            if (config.authType === 'basic') {
                if (!config.username || !config.password) {
                    return {
                        success: false,
                        message: 'Basic认证需要用户名和密码'
                    };
                }
            }

            if (config.authType === 'bearer') {
                if (!config.token) {
                    return {
                        success: false,
                        message: 'Bearer认证需要Token'
                    };
                }
            }

            if (config.authType === 'json') {
                if (!config.jsonAuth) {
                    return {
                        success: false,
                        message: 'JSON认证需要JSON配置'
                    };
                }
            }

            if (config.authType === 'header') {
                if (!config.headerName || !config.headerValue) {
                    return {
                        success: false,
                        message: 'Header认证需要Header名称和值'
                    };
                }
            }

            if (config.authType === 'oauth2') {
                if (!config.clientId || !config.clientSecret) {
                    return {
                        success: false,
                        message: 'OAuth 2.0认证需要客户端ID和客户端密钥'
                    };
                }
                if (!config.tokenUrl) {
                    return {
                        success: false,
                        message: 'OAuth 2.0认证需要Token URL'
                    };
                }
            }

            if (config.authType === 'custom') {
                if (!config.customAuth) {
                    return {
                        success: false,
                        message: '自定义认证需要配置信息'
                    };
                }
            }

            // 创建测试请求配置
            const testConfig: RequestInit = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            // 添加认证信息
            if (config.authType === 'basic' && config.username && config.password) {
                testConfig.headers = {
                    ...testConfig.headers,
                    'Authorization': `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`
                };
            } else if (config.authType === 'bearer' && config.token) {
                testConfig.headers = {
                    ...testConfig.headers,
                    'Authorization': `Bearer ${config.token}`
                };
            } else if (config.authType === 'header' && config.headerName && config.headerValue) {
                testConfig.headers = {
                    ...testConfig.headers,
                    [config.headerName]: config.headerValue
                };
            } else if (config.authType === 'json' && config.jsonAuth) {
                try {
                    const jsonAuthData = JSON.parse(config.jsonAuth);
                    // 将JSON配置添加到请求体中
                    testConfig.method = 'POST';
                    testConfig.body = JSON.stringify(jsonAuthData);
                } catch (error) {
                    return {
                        success: false,
                        message: 'JSON认证配置格式错误'
                    };
                }
            } else if (config.authType === 'oauth2' && config.clientId && config.clientSecret && config.tokenUrl && config.grantType) {
                // 对于OAuth2需要先获取令牌
                const tokenResponse = await fetch(config.tokenUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    body: new URLSearchParams({
                        client_id: config.clientId,
                        client_secret: config.clientSecret,
                        grant_type: config.grantType,
                        ...(config.scope ? { scope: config.scope } : {})
                    })
                });

                if (!tokenResponse.ok) {
                    const errorData = await tokenResponse.json().catch(() => ({}));
                    return {
                        success: false,
                        message: `OAuth2令牌获取失败: ${tokenResponse.statusText}`,
                        details: errorData
                    };
                }

                const tokenData = await tokenResponse.json();
                const accessToken = tokenData.access_token;

                if (!accessToken) {
                    return {
                        success: false,
                        message: 'OAuth2响应中缺少access_token'
                    };
                }

                // 使用获取到的token进行测试请求
                testConfig.headers = {
                    ...testConfig.headers,
                    'Authorization': `Bearer ${accessToken}`
                };
            } else if (config.authType === 'custom' && config.customAuth) {
                try {
                    const customAuthData = JSON.parse(config.customAuth);
                    // 将自定义认证配置添加到headers中
                    testConfig.headers = {
                        ...testConfig.headers,
                        ...customAuthData
                    };
                } catch (error) {
                    return {
                        success: false,
                        message: '自定义认证配置格式错误，请使用JSON格式'
                    };
                }
            }

            // 使用testEndpoint属性，向后兼容处理
            const testEndpoint = config.testEndpoint || '/health';
            const testUrl = `${config.baseUrl}${testEndpoint}`;
            const response = await fetch(testUrl, testConfig);
            const latency = Date.now() - startTime;

            // 尝试解析响应内容
            let responseData = {};
            try {
                responseData = await response.json();
            } catch (e) {
                try {
                    responseData = {
                        text: await response.text()
                    };
                } catch (e) {
                    responseData = {
                        text: '无法解析响应内容'
                    };
                }
            }

            return {
                success: response.ok,
                message: `API连接测试${response.ok ? '成功' : '失败'}: ${response.status} ${response.statusText} (${testUrl})`,
                latency,
                details: {
                    baseUrl: config.baseUrl,
                    testEndpoint: testEndpoint,
                    fullTestUrl: testUrl,
                    authType: config.authType,
                    timeout: config.timeout || 30,
                    retries: config.retries || 3,
                    statusCode: response.status,
                    statusText: response.statusText,
                    response: responseData,
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