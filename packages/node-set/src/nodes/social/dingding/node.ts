import { IExecuteOptions, INode, INodeBasic, INodeDetail, NodeLink, credentialManager } from '@repo/common';
/**
 * 钉钉点对点消息发送节点
 * 通过钉钉API向指定手机号用户发送工作通知消息
 */
export class Dingding implements INode {
    /**
     * 节点基本信息
     */
    node: INodeBasic = {
        kind: 'dingding',
        name: '钉钉消息',
        event: "dingding",
        catalog: 'social',
        version: 1,
        description: '通过钉钉API向指定手机号用户发送点对点工作通知消息',
        icon: 'dingding.svg',
        nodeWidth: 600
    };

    /**
     * 节点详细配置
     */
    detail: INodeDetail = {
        fields: [
            {
                displayName: '钉钉连接',
                name: 'credential',
                type: 'string',
                required: true,
                description: '选择钉钉连接配置',
                connectType: 'dingding',
                controlType: 'selectconnect',
                default: ''
            },
            {
                displayName: '接收人手机号',
                name: 'mobile',
                type: 'string',
                required: true,
                description: '消息接收人的手机号码',
                placeholder: '请输入手机号码，如：13800138000',
                controlType: 'input',
                default: ''
            },
            {
                displayName: '消息类型',
                name: 'messageType',
                type: 'options',
                required: true,
                default: 'text',
                description: '发送的消息类型',
                options: [
                    {
                        name: '文本消息',
                        value: 'text'
                    },
                    {
                        name: 'Markdown消息',
                        value: 'markdown'
                    }
                ],
                controlType: 'select',
                placeholder: '选择消息类型'
            },
            {
                displayName: '消息标题',
                name: 'title',
                type: 'string',
                required: false,
                description: '消息标题（Markdown类型消息必填）',
                placeholder: '请输入消息标题',
                displayOptions: {
                    showBy: {
                        messageType: ['markdown']
                    }
                },
                controlType: 'input',
                default: ''
            },
            {
                displayName: '消息内容',
                name: 'content',
                type: 'string',
                required: true,
                description: '要发送的消息内容',
                placeholder: '请输入消息内容',
                controlType: 'textarea',
                default: ''
            },
            {
                displayName: '是否@所有人',
                name: 'isAtAll',
                type: 'boolean',
                required: false,
                default: false,
                description: '是否@所有人（仅在群聊中有效）',
                controlType: 'switch'
            }
        ]
    };

    /**
     * 执行钉钉消息发送
     */
    async execute(opts: IExecuteOptions): Promise<any> {
        const params = opts.inputs;
        
        if (!params) {
            return {
                success: false,
                message: '缺少输入参数'
            };
        }
        
        try {
            // 获取连接配置
            const config = await this.getConnectionConfig(params.credential);
            
            // 获取access_token
            const tokenResult = await this.getAccessToken(config);
            if (!tokenResult.success) {
                return {
                    success: false,
                    message: `获取access_token失败: ${tokenResult.message}`
                };
            }
            
            // 根据手机号获取用户ID
            const userResult = await this.getUserByMobile(config, tokenResult.accessToken!, params.mobile);
            if (!userResult.success) {
                return {
                    success: false,
                    message: `获取用户信息失败: ${userResult.message}`
                };
            }
            
            // 发送工作通知消息
            const sendResult = await this.sendWorkNotification(config, tokenResult.accessToken!, userResult.userid!, params);
            if (!sendResult.success) {
                return {
                    success: false,
                    message: `发送消息失败: ${sendResult.message}`
                };
            }
            
            return {
                success: true,
                message: '钉钉消息发送成功',
                data: {
                    mobile: params.mobile,
                    userid: userResult.userid,
                    messageType: params.messageType,
                    taskId: sendResult.taskId,
                    timestamp: new Date().toISOString()
                }
            };
            
        } catch (error) {
            return {
                success: false,
                message: `钉钉消息发送失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * 获取连接配置
     */
    private async getConnectionConfig(credentialId: string): Promise<Record<string, any>> {
        const connectConfig = await credentialManager.mediator?.get(credentialId);
        if (!connectConfig) {
            throw new Error('未找到钉钉连接配置');
        }
        return connectConfig.config;
    }

    /**
     * 获取钉钉access_token
     */
    private async getAccessToken(config: Record<string, any>): Promise<{
        success: boolean;
        message: string;
        accessToken?: string;
    }> {
        try {
            const baseUrl = config.baseUrl || 'https://oapi.dingtalk.com';
            const timeout = (config.timeout || 30) * 1000;
            
            const url = `${baseUrl}/gettoken?appkey=${encodeURIComponent(config.appKey)}&appsecret=${encodeURIComponent(config.appSecret)}`;
            
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
                    message: `钉钉API错误: ${result.errmsg || '未知错误'} (错误码: ${result.errcode})`
                };
            }
            
            return {
                success: true,
                message: '获取access_token成功',
                accessToken: result.access_token
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

    /**
     * 根据手机号获取用户ID
     */
    private async getUserByMobile(config: Record<string, any>, accessToken: string, mobile: string): Promise<{
        success: boolean;
        message: string;
        userid?: string;
    }> {
        try {
            const baseUrl = config.baseUrl || 'https://oapi.dingtalk.com';
            const timeout = (config.timeout || 30) * 1000;
            
            const url = `${baseUrl}/user/get_by_mobile?access_token=${encodeURIComponent(accessToken)}&mobile=${encodeURIComponent(mobile)}`;
            
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
                    message: `获取用户信息失败: ${result.errmsg || '未知错误'} (错误码: ${result.errcode})`
                };
            }
            
            return {
                success: true,
                message: '获取用户信息成功',
                userid: result.userid
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

    /**
     * 发送工作通知消息
     */
    private async sendWorkNotification(config: Record<string, any>, accessToken: string, userid: string, params: Record<string, any>): Promise<{
        success: boolean;
        message: string;
        taskId?: string;
    }> {
        try {
            const baseUrl = config.baseUrl || 'https://oapi.dingtalk.com';
            const timeout = (config.timeout || 30) * 1000;
            
            const url = `${baseUrl}/topapi/message/corpconversation/asyncsend_v2?access_token=${encodeURIComponent(accessToken)}`;
            
            // 构建消息体
            const messageBody = this.buildMessageBody(params);
            
            const requestBody = {
                agent_id: config.agentId,
                userid_list: userid,
                msg: messageBody,
                to_all_user: false
            };
            
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
            
            if (result.errcode !== 0) {
                return {
                    success: false,
                    message: `发送消息失败: ${result.errmsg || '未知错误'} (错误码: ${result.errcode})`
                };
            }
            
            return {
                success: true,
                message: '发送消息成功',
                taskId: result.task_id
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

    /**
     * 构建消息体
     */
    private buildMessageBody(params: Record<string, any>): Record<string, any> {
        const messageType = params.messageType || 'text';
        
        if (messageType === 'text') {
            return {
                msgtype: 'text',
                text: {
                    content: params.content
                },
                at: {
                    isAtAll: params.isAtAll || false
                }
            };
        } else if (messageType === 'markdown') {
            return {
                msgtype: 'markdown',
                markdown: {
                    title: params.title || '消息通知',
                    text: params.content
                },
                at: {
                    isAtAll: params.isAtAll || false
                }
            };
        }
        
        // 默认返回文本消息
        return {
            msgtype: 'text',
            text: {
                content: params.content
            },
            at: {
                isAtAll: params.isAtAll || false
            }
        };
    }
}