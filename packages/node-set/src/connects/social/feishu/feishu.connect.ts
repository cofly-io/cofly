import { Icon, ConnectTestResult } from '@repo/common';
import { BaseSocialConnect } from '../../base/BaseSocialConnect';

/**
 * 飞书连接配置类
 * 用于配置飞书API的基础凭证信息
 */
export class FeishuConnect extends BaseSocialConnect {
    override overview = {
        id: 'feishu',
        name: '飞书',
        icon: 'feishu.svg' as Icon,
        type: 'social' as const,
        provider: 'bytedance' as const,
        description: '飞书开放平台API连接，支持发送应用消息、获取用户信息等功能',
        version: '1.0.0'
    };

    /**
     * 连接详细配置
     */
    override detail = {
        defaultPort: 443,
        displayName: '飞书连接',
        description: '配置飞书开放平台API的基础凭证信息，用于调用飞书API接口',
        fields: [
            {
                displayName: '企业ID (CorpId)',
                name: 'corpId',
                type: 'string' as const,
                required: true,
                description: '飞书的企业ID，在飞书管理后台获取',
                placeholder: '请输入飞书的企业ID',
                controlType: "input"
            },
            {
                displayName: '应用Secret (CorpSecret)',
                name: 'secret',
                type: 'string' as const,
                required: true,
                description: '飞书应用的Secret，在飞书管理后台获取',
                placeholder: '请输入飞书应用的Secret',
                controlType: "input",
                typeOptions: {
                    password: true
                },
            },
            {
                displayName: '应用ID (AgentId)',
                name: 'agentId',
                type: 'string' as const,
                required: true,
                description: '飞书应用的AgentId，用于发送应用消息',
                placeholder: '请输入飞书应用的AgentId',
                controlType: "input"
            },
            {
                displayName: '应用Token',
                name: 'token',
                type: 'string' as const,
                required: true,
                description: '飞书应用的Token，在飞书管理后台获取',
                placeholder: '请输入飞书应用的Token',
                controlType: "input",
                typeOptions: {
                    password: true
                },
            },
            {
                displayName: '应用EncodingAESKey',
                name: 'aesKey',
                type: 'string' as const,
                required: true,
                description: '飞书应用的EncodingAESKey，在飞书管理后台获取',
                placeholder: '请输入飞书应用的EncodingAESKey',
                controlType: "input",
                typeOptions: {
                    password: true
                },
            },
            {
                displayName: '服务器出口IP',
                name: 'serverIp',
                type: 'string' as const,
                required: false,
                description: '服务器出口IP地址，需要在飞书管理后台配置IP白名单',
                placeholder: '请输入服务器出口IP地址（可选）',
                controlType: "input"
            },
            {
                displayName: 'API基础URL',
                name: 'baseUrl',
                type: 'string' as const,
                required: false,
                default: 'https://qyapi.weixin.qq.com',
                description: '飞书API的基础URL地址',
                controlType: "input"
            },
            {
                displayName: '连接超时时间(秒)',
                name: 'timeout',
                type: 'number' as const,
                required: false,
                default: 30,
                description: 'API请求的超时时间，单位为秒',
                typeOptions: {
                    minValue: 5,
                    maxValue: 120
                },
                controlType: "input"
            }
        ],
        validateConnection: true,
        connectionTimeout: 30000
    };

    /**
     * 测试飞书连接
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
                    message: `飞书连接测试失败: ${tokenResult.message}`,
                    latency: Date.now() - startTime
                };
            }

            const latency = Date.now() - startTime;

            return {
                success: true,
                message: '飞书连接测试成功',
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
                message: `飞书连接失败: ${error instanceof Error ? error.message : String(error)}`,
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * 获取飞书access_token
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
                    message: `飞书API错误: ${result.errmsg || '未知错误'} (错误码: ${result.errcode})`
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