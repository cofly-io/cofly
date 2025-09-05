import { Icon, ConnectTestResult } from '@repo/common';
import { BaseSocialConnect } from '../../base/BaseSocialConnect';

/**
 * 企业微信连接配置类
 * 用于配置企业微信API的基础凭证信息
 */
export class WecomConnect extends BaseSocialConnect {
    override overview = {
        id: 'wecom',
        name: '企业微信',
        icon: 'wecom.svg' as Icon,
        type: 'social' as const,
        provider: 'tecent' as const,
        description: '企业微信开放平台API连接，支持发送应用消息、获取用户信息等功能',
        version: '1.0.0'
    };

    /**
     * 连接详细配置
     */
    override detail = {
        defaultPort: 443,
        displayName: '企业微信连接',
        description: '配置企业微信开放平台API的基础凭证信息，用于调用企业微信API接口',
        fields: [
            {
                label: '企业ID (CorpId)',
                fieldName: 'corpId',
                description: '企业微信的企业ID，在企业微信管理后台获取',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '请输入企业微信的企业ID'
                }
            },
            {
                label: '应用Secret (CorpSecret)',
                fieldName: 'secret',
                description: '企业微信应用的Secret，在企业微信管理后台获取',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '请输入企业微信应用的Secret',
                    attributes: [{
                        type: 'password'
                    }]
                }
            },
            {
                label: '应用ID (AgentId)',
                fieldName: 'agentId',
                description: '企业微信应用的AgentId，用于发送应用消息',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '请输入企业微信应用的AgentId'
                }
            },
            {
                label: '应用Token',
                fieldName: 'token',
                description: '企业微信应用的Token，在企业微信管理后台获取',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '请输入企业微信应用的Token',
                    attributes: [{
                        type: 'password'
                    }]
                }
            },
            {
                label: '应用EncodingAESKey',
                fieldName: 'aesKey',
                description: '企业微信应用的EncodingAESKey，在企业微信管理后台获取',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '请输入企业微信应用的EncodingAESKey',
                    attributes: [{
                        type: 'password'
                    }]
                }
            },
            {
                label: '服务器出口IP',
                fieldName: 'serverIp',
                description: '服务器出口IP地址，需要在企业微信管理后台配置IP白名单',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: false
                    },
                    placeholder: '请输入服务器出口IP地址（可选）'
                }
            },
            {
                label: 'API基础URL',
                fieldName: 'baseUrl',
                description: '企业微信API的基础URL地址',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: 'https://qyapi.weixin.qq.com',
                    validation: {
                        required: false
                    },
                    placeholder: 'https://qyapi.weixin.qq.com'
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
            }
        ],
        validateConnection: true,
        connectionTimeout: 30000
    };

    /**
     * 测试企业微信连接
     * 通过获取access_token来验证CorpId和CorpSecret的有效性
     */
    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        try {
            // 验证必填字段
            const requiredFields = ['corpId', 'corpSecret', 'agentId'];
            for (const field of requiredFields) {
                if (!config[field]) {
                    return {
                        success: false,
                        message: `缺少必填字段: ${field}`
                    };
                }
            }

            // 测试获取access_token
            const tokenResult = await this.getAccessToken(config);
            
            if (!tokenResult.success) {
                return {
                    success: false,
                    message: `企业微信连接测试失败: ${tokenResult.message}`,
                    latency: Date.now() - startTime
                };
            }

            const latency = Date.now() - startTime;

            return {
                success: true,
                message: '企业微信连接测试成功',
                latency,
                details: {
                    corpId: config.corpId,
                    agentId: config.agentId,
                    baseUrl: config.baseUrl || 'https://qyapi.weixin.qq.com',
                    timeout: config.timeout || 30,
                    serverIp: config.serverIp || '未配置',
                    accessTokenExpires: tokenResult.expiresIn ? `${tokenResult.expiresIn}秒` : '未知'
                }
            };

        } catch (error) {
            return {
                success: false,
                message: `企业微信连接失败: ${error instanceof Error ? error.message : String(error)}`,
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * 获取企业微信access_token
     * @param config 连接配置
     * @returns 包含access_token和过期时间的结果
     */
    private async getAccessToken(config: Record<string, any>): Promise<{
        success: boolean;
        message: string;
        accessToken?: string;
        expiresIn?: number;
    }> {
        try {
            const baseUrl = config.baseUrl || 'https://qyapi.weixin.qq.com';
            const timeout = (config.timeout || 30) * 1000;
            
            const url = `${baseUrl}/cgi-bin/gettoken?corpid=${encodeURIComponent(config.corpId)}&corpsecret=${encodeURIComponent(config.corpSecret)}`;
            
            // 使用fetch发送请求
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
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
            
            if (result.errcode !== 0) {
                return {
                    success: false,
                    message: `企业微信API错误: ${result.errmsg || '未知错误'} (错误码: ${result.errcode})`
                };
            }
            
            return {
                success: true,
                message: '获取access_token成功',
                accessToken: result.access_token,
                expiresIn: result.expires_in
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