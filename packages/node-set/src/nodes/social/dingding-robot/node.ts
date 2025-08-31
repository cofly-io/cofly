import { IExecuteOptions, INode, INodeBasic, INodeDetail, NodeLink, credentialManager } from '@repo/common';
import crypto from 'crypto';

export class DingdingRobot implements INode {
    node: INodeBasic = {
        kind: 'dingding-robot',
        name: '钉钉机器人',
        event: 'dingding-robot',
        catalog: 'social',
        version: 1,
        description: '发送消息到钉钉群聊机器人',
        icon: 'dingding-robot.svg',
        nodeWidth: 600
    };

    detail: INodeDetail = {
        fields: [
            {
                displayName: '连接源',
                name: 'datasource',
                type: 'string',
                default: '',
                required: true,
                connectType: 'dingding-robot',
                controlType: 'selectconnect'
            },
            {
                displayName: '消息类型',
                name: 'messageType',
                type: 'options',
                options: [
                    {
                        name: '文本消息',
                        value: 'text',
                        description: '发送纯文本消息'
                    },
                    {
                        name: '链接消息',
                        value: 'link',
                        description: '发送带链接的消息'
                    },
                    {
                        name: 'Markdown消息',
                        value: 'markdown',
                        description: '发送Markdown格式消息'
                    },
                    {
                        name: 'ActionCard消息',
                        value: 'actionCard',
                        description: '发送可交互的卡片消息'
                    }
                ],
                default: 'text',
                controlType: 'selectwithdesc'
            },
            // 文本消息字段
            {
                displayName: '消息内容',
                name: 'content',
                type: 'string',
                displayOptions: {
                    showBy: {
                        messageType: ['text']
                    }
                },
                default: '',
                required: true,
                placeholder: '请输入要发送的文本内容',
                controlType: 'textarea'
            },
            // @功能
            {
                displayName: '@所有人',
                name: 'atAll',
                type: 'boolean',
                displayOptions: {
                    showBy: {
                        messageType: ['text', 'markdown']
                    }
                },
                default: false,
                controlType: 'checkbox'
            },
            {
                displayName: '@指定用户',
                name: 'atMobiles',
                type: 'string',
                displayOptions: {
                    showBy: {
                        messageType: ['text', 'markdown']
                    }
                },
                default: '',
                placeholder: '手机号，多个用逗号分隔',
                controlType: 'input'
            },
            // 链接消息字段
            {
                displayName: '消息标题',
                name: 'title',
                type: 'string',
                displayOptions: {
                    showBy: {
                        messageType: ['link', 'actionCard']
                    }
                },
                default: '',
                required: true,
                placeholder: '消息标题',
                controlType: 'input'
            },
            {
                displayName: '消息文本',
                name: 'text',
                type: 'string',
                displayOptions: {
                    showBy: {
                        messageType: ['link', 'actionCard']
                    }
                },
                default: '',
                required: true,
                placeholder: '消息描述文本',
                controlType: 'textarea'
            },
            {
                displayName: '消息链接',
                name: 'messageUrl',
                type: 'string',
                displayOptions: {
                    showBy: {
                        messageType: ['link']
                    }
                },
                default: '',
                required: true,
                placeholder: 'https://example.com',
                controlType: 'input'
            },
            {
                displayName: '图片链接',
                name: 'picUrl',
                type: 'string',
                displayOptions: {
                    showBy: {
                        messageType: ['link']
                    }
                },
                default: '',
                placeholder: '图片URL（可选）',
                controlType: 'input'
            },
            // Markdown消息字段
            {
                displayName: 'Markdown内容',
                name: 'markdownText',
                type: 'string',
                displayOptions: {
                    showBy: {
                        messageType: ['markdown']
                    }
                },
                default: '',
                required: true,
                placeholder: '支持Markdown格式的文本内容',
                controlType: 'textarea'
            },
            {
                displayName: 'Markdown标题',
                name: 'markdownTitle',
                type: 'string',
                displayOptions: {
                    showBy: {
                        messageType: ['markdown']
                    }
                },
                default: '',
                required: true,
                placeholder: 'Markdown消息标题',
                controlType: 'input'
            },
            // ActionCard消息字段
            {
                displayName: '按钮文本',
                name: 'singleTitle',
                type: 'string',
                displayOptions: {
                    showBy: {
                        messageType: ['actionCard']
                    }
                },
                default: '',
                required: true,
                placeholder: '按钮显示文本',
                controlType: 'input'
            },
            {
                displayName: '按钮链接',
                name: 'singleURL',
                type: 'string',
                displayOptions: {
                    showBy: {
                        messageType: ['actionCard']
                    }
                },
                default: '',
                required: true,
                placeholder: 'https://example.com',
                controlType: 'input'
            }
        ]
    };

    async execute(opts: IExecuteOptions): Promise<any> {
        const messageType = opts.inputs?.messageType || 'text';
        
        try {
            // 获取连接配置
            const connectConfig = await this.getConnectionConfig(opts.inputs);
            
            // 构建消息体
            const messageBody = await this.buildMessageBody(messageType, opts.inputs);
            
            // 发送消息
            const result = await this.sendMessage(connectConfig, messageBody);
            
            return {
                success: true,
                message: '消息发送成功',
                data: result,
                messageType: messageType
            };
            
        } catch (error: any) {
            console.error('❌ [DingdingRobot Node] 执行错误:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    private async getConnectionConfig(inputs: any): Promise<any> {
        const datasource = inputs?.datasource;
        if (!datasource) {
            throw new Error('请选择钉钉机器人连接源');
        }

        try {
            const connectConfig = await credentialManager.mediator?.get(datasource);
            if (!connectConfig) {
                throw new Error(`连接配置不存在: ${datasource}`);
            }
            return connectConfig.config;
        } catch (error: any) {
            console.error('❌ [DingdingRobot Node] 获取连接配置失败:', error.message);
            throw new Error(`获取连接配置失败: ${error.message}`);
        }
    }

    private async buildMessageBody(messageType: string, inputs: any): Promise<any> {
        let messageBody: any = {
            msgtype: messageType
        };

        switch (messageType) {
            case 'text':
                if (!inputs.content) {
                    throw new Error('文本消息内容不能为空');
                }
                messageBody.text = {
                    content: inputs.content
                };
                
                // 处理@功能
                if (inputs.atAll || inputs.atMobiles) {
                    messageBody.at = {};
                    if (inputs.atAll) {
                        messageBody.at.isAtAll = true;
                    }
                    if (inputs.atMobiles) {
                        messageBody.at.atMobiles = inputs.atMobiles.split(',').map((mobile: string) => mobile.trim());
                    }
                }
                break;
                
            case 'link':
                if (!inputs.title || !inputs.text || !inputs.messageUrl) {
                    throw new Error('链接消息的标题、文本和链接地址不能为空');
                }
                messageBody.link = {
                    title: inputs.title,
                    text: inputs.text,
                    messageUrl: inputs.messageUrl,
                    picUrl: inputs.picUrl || ''
                };
                break;
                
            case 'markdown':
                if (!inputs.markdownTitle || !inputs.markdownText) {
                    throw new Error('Markdown消息的标题和内容不能为空');
                }
                messageBody.markdown = {
                    title: inputs.markdownTitle,
                    text: inputs.markdownText
                };
                
                // 处理@功能
                if (inputs.atAll || inputs.atMobiles) {
                    messageBody.at = {};
                    if (inputs.atAll) {
                        messageBody.at.isAtAll = true;
                    }
                    if (inputs.atMobiles) {
                        messageBody.at.atMobiles = inputs.atMobiles.split(',').map((mobile: string) => mobile.trim());
                    }
                }
                break;
                
            case 'actionCard':
                if (!inputs.title || !inputs.text || !inputs.singleTitle || !inputs.singleURL) {
                    throw new Error('ActionCard消息的标题、文本、按钮文本和按钮链接不能为空');
                }
                messageBody.actionCard = {
                    title: inputs.title,
                    text: inputs.text,
                    singleTitle: inputs.singleTitle,
                    singleURL: inputs.singleURL
                };
                break;
                
            default:
                throw new Error(`不支持的消息类型: ${messageType}`);
        }

        return messageBody;
    }

    private async sendMessage(connectConfig: any, messageBody: any): Promise<any> {
        const webhook = connectConfig.webhook;
        const secret = connectConfig.secret;
        
        if (!webhook) {
            throw new Error('Webhook地址不能为空');
        }

        // 构建请求URL
        let requestUrl = webhook;
        
        // 如果有加签密钥，计算签名
        if (secret) {
            const timestamp = Date.now();
            const stringToSign = `${timestamp}\n${secret}`;
            const sign = crypto.createHmac('sha256', secret)
                .update(stringToSign)
                .digest('base64');
            
            requestUrl += `&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
        }

        console.log('📍 [DingdingRobot Node] 发送消息:', {
            url: requestUrl.replace(/access_token=[^&]+/, 'access_token=***'),
            messageType: messageBody.msgtype
        });

        // 发送请求
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.errcode === 0) {
            console.log('📍 [DingdingRobot Node] 消息发送成功');
            return result;
        } else {
            throw new Error(`发送失败: ${result.errmsg || '未知错误'} (错误码: ${result.errcode})`);
        }
    }
}