import { Icon, ConnectTestResult } from '@repo/common';
import { BaseSocialConnect } from '../../base/BaseSocialConnect';

/**
 * 飞书多维表格连接配置类
 * 用于配置飞书多维表格API的基础凭证信息
 */
export class FeishuBitableConnect extends BaseSocialConnect {
    /**
     * 连接概览信息
     */
    overview = {
        id: 'feishu-bitable',
        name: '飞书多维表格',
        icon: 'feishu-bitable.svg' as Icon,
        type: 'social' as const,
        provider: 'bytedance' as const,
        description: '飞书多维表格API连接，支持对多维表格进行增删改查操作',
        version: '1.0.0'
    };

    /**
     * 连接详细配置
     */
    detail = {
        displayName: '飞书多维表格连接',
        description: '配置飞书多维表格API的基础凭证信息，用于调用飞书多维表格接口',
        fields: [
            {
                label: 'App ID',
                fieldName: 'appId',
                description: '飞书应用的App ID，在飞书开发者后台获取',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '请输入飞书应用的App ID'
                }
            },
            {
                label: 'App Secret',
                fieldName: 'appSecret',
                description: '飞书应用的App Secret，在飞书开发者后台获取',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '请输入飞书应用的App Secret',
                    attributes: [{
                        type: 'password'
                    }]
                }
            },
            {
                label: 'API基础URL',
                fieldName: 'baseUrl',
                description: '飞书API的基础URL地址',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: 'https://open.feishu.cn',
                    validation: {
                        required: false
                    },
                    placeholder: 'https://open.feishu.cn'
                }
            },
            {
                label: '连接超时时间(秒)',
                fieldName: 'timeout',
                description: 'API请求的超时时间，单位为秒',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 30,
                    validation: {
                        required: false,
                        min: 5,
                        max: 120
                    },
                    placeholder: '30'
                }
            },
            {
                label: '用户ID类型',
                fieldName: 'userIdType',
                description: '用户ID的类型，用于人员字段操作',
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'open_id',
                    validation: {
                        required: false
                    },
                    options: [
                        {
                            name: 'Open ID',
                            value: 'open_id'
                        },
                        {
                            name: 'Union ID',
                            value: 'union_id'
                        },
                        {
                            name: 'User ID',
                            value: 'user_id'
                        }
                    ]
                }
            }
        ],
        validateConnection: true,
        connectionTimeout: 30000,
        defaultPort: 443
    };

    /**
     * 测试飞书多维表格连接
     * 通过获取tenant_access_token来验证App ID和App Secret的有效性
     */
    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        try {
            // 验证必填字段
            const requiredFields = ['appId', 'appSecret'];
            for (const field of requiredFields) {
                if (!config[field]) {
                    return {
                        success: false,
                        message: `缺少必填字段: ${field}`
                    };
                }
            }

            // 测试获取tenant_access_token
            const tokenResult = await this.getTenantAccessToken(config);
            
            if (!tokenResult.success) {
                return {
                    success: false,
                    message: `飞书多维表格连接测试失败: ${tokenResult.message}`,
                    latency: Date.now() - startTime
                };
            }

            const latency = Date.now() - startTime;

            return {
                success: true,
                message: '飞书多维表格连接测试成功',
                latency,
                details: {
                    appId: config.appId,
                    baseUrl: config.baseUrl || 'https://open.feishu.cn',
                    timeout: config.timeout || 30,
                    userIdType: config.userIdType || 'open_id',
                    tokenExpires: tokenResult.expiresIn ? `${tokenResult.expiresIn}秒` : '未知'
                }
            };

        } catch (error) {
            return {
                success: false,
                message: `飞书多维表格连接失败: ${error instanceof Error ? error.message : String(error)}`,
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * 获取飞书tenant_access_token
     * @param config 连接配置
     * @returns 包含access_token和过期时间的结果
     */
    private async getTenantAccessToken(config: Record<string, any>): Promise<{
        success: boolean;
        message: string;
        accessToken?: string;
        expiresIn?: number;
    }> {
        try {
            const baseUrl = config.baseUrl || 'https://open.feishu.cn';
            const timeout = (config.timeout || 30) * 1000;
            
            const url = `${baseUrl}/open-apis/auth/v3/tenant_access_token/internal`;
            
            const requestBody = {
                app_id: config.appId,
                app_secret: config.appSecret
            };
            
            // 使用fetch发送请求
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                return {
                    success: false,
                    message: `HTTP请求失败: ${response.status} ${response.statusText}`
                };
            }
            
            const result = await response.json();
            
            if (result.code !== 0) {
                return {
                    success: false,
                    message: `飞书API错误: ${result.msg || '未知错误'} (错误码: ${result.code})`
                };
            }
            
            return {
                success: true,
                message: '获取tenant_access_token成功',
                accessToken: result.tenant_access_token,
                expiresIn: result.expire
            };
            
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    success: false,
                    message: '请求超时'
                };
            }
            
            return {
                success: false,
                message: `请求失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}