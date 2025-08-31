import { Icon, ConnectTestResult } from '@repo/common';
import { BaseSocialConnect } from '../../base/BaseSocialConnect';

/**
 * 钉钉机器人连接定义
 */
export class DingdingRobotConnect extends BaseSocialConnect {
    override overview = {
        id: 'dingding-robot',
        name: '钉钉机器人',
        type: 'social' as const,
        provider: 'ali' as const,
        icon: 'dingding.svg' as Icon,
        description: '钉钉自定义机器人连接器，支持向钉钉群发送消息通知',
        version: '1.0.0'
    };

    override detail = {
        defaultPort: 443,
        supportedFeatures: [
            'text_message' as const,
            'link_message' as const,
            'markdown_message' as const,
            'action_card' as const,
            'at_members' as const
        ],
        fields: [
            {
                displayName: 'Webhook地址',
                name: 'webhook',
                type: 'string' as const,
                default: '',
                description: '钉钉机器人的Webhook地址',
                placeholder: 'https://oapi.dingtalk.com/robot/send?access_token=your_token',
                required: true,
                controlType: "input"
            },
            {
                displayName: '加签密钥',
                name: 'secret',
                type: 'string' as const,
                default: '',
                description: '钉钉机器人的加签密钥（可选）',
                placeholder: 'SEC开头的密钥字符串',
                typeOptions: {
                    password: true
                },
                isSecure: true,
                controlType: "input"
            },
            {
                displayName: '关键词',
                name: 'keywords',
                type: 'string' as const,
                default: '',
                description: '安全设置关键词，多个用逗号分隔（可选）',
                placeholder: '告警,通知,提醒',
                controlType: "input"
            },
            {
                displayName: '超时时间(秒)',
                name: 'timeout',
                type: 'number' as const,
                default: 30,
                description: '请求超时时间，单位：秒',
                typeOptions: {
                    minValue: 1,
                    maxValue: 300
                },
                controlType: "input"
            }
        ],
        validateConnection: true,
        connectionTimeout: 30000
    };

    /**
     * 测试钉钉机器人连接
     */
    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        try {
            // 验证必填字段
            if (!config.webhook) {
                return {
                    success: false,
                    message: 'Webhook地址不能为空'
                };
            }
            
            if (!config.webhook.includes('oapi.dingtalk.com/robot/send')) {
                return {
                    success: false,
                    message: 'Webhook地址格式不正确'
                };
            }
            
            // 构建测试消息
            const testMessage = {
                msgtype: 'text',
                text: {
                    content: '钉钉机器人连接测试成功！'
                }
            };
            
            let url = config.webhook;
            
            // 如果设置了加签，需要计算签名
            if (config.secret) {
                const timestamp = Date.now();
                const stringToSign = `${timestamp}\n${config.secret}`;
                
                // 使用HmacSHA256计算签名
                const crypto = require('crypto');
                const sign = crypto
                    .createHmac('sha256', config.secret)
                    .update(stringToSign)
                    .digest('base64');
                
                const encodedSign = encodeURIComponent(sign);
                url = `${config.webhook}&timestamp=${timestamp}&sign=${encodedSign}`;
            }
            
            // 发送测试请求
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testMessage),
                signal: AbortSignal.timeout((config.timeout || 30) * 1000)
            });
            
            const result = await response.json();
            
            if (result.errcode === 0) {
                return {
                    success: true,
                    message: '钉钉机器人连接测试成功',
                    latency: Date.now() - startTime
                };
            } else {
                return {
                    success: false,
                    message: `钉钉机器人返回错误: ${result.errmsg || '未知错误'}`,
                    latency: Date.now() - startTime
                };
            }
            
        } catch (error) {
            return {
                success: false,
                message: `连接测试失败: ${error instanceof Error ? error.message : String(error)}`,
                latency: Date.now() - startTime
            };
        }
    }
}