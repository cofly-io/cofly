import { INode, INodeBasic, INodeDetail, IExecuteOptions, NodeLink, credentialManager } from '@repo/common';
import { WxWork, WxWorkConfig } from "../../..//utils/wxwork";

/**
 * 企业微信消息发送节点
 * 支持向企业微信用户发送应用消息
 */
export class WecomSender implements INode {
    node: INodeBasic = {
        kind: 'wecom-message',
        name: '企微应用推送',
        event: 'wecom-message',
        catalog: 'social',
        version: 1,
        description: '向企业微信用户发送应用消息',
        icon: 'wecom-message.svg',
        nodeWidth: 600
    };

    /**
     * 节点详细配置
     */
    detail: INodeDetail = {
        fields: [
            {
                label: '企业微信连接',
                fieldName: 'credential',
                description: '选择企业微信连接配置',
                connectType: 'wecom',
                control: {
                    name: 'selectconnect',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    }
                }
            },
            {
                label: '接收人',
                fieldName: 'touser',
                description: '接收消息的用户ID，多个用户用|分隔，@all表示全部用户',
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '用户ID或@all'
                }
            },
            {
                label: '消息类型',
                fieldName: 'msgtype',
                description: '选择消息类型',
                control: {
                    name: 'select',
                    dataType: 'string',
                    defaultValue: 'text',
                    validation: {
                        required: true
                    },
                    options: [
                        {
                            name: '文本消息',
                            value: 'text'
                        },
                        {
                            name: 'Markdown消息',
                            value: 'markdown'
                        },
                        {
                            name: '文本卡片消息',
                            value: 'textcard'
                        }
                    ],
                    placeholder: '选择消息类型'
                }
            },
            {
                label: '消息标题',
                fieldName: 'title',
                description: '消息标题（仅文本卡片消息需要）',
                conditionRules: {
                    showBy: {
                        msgtype: ['textcard']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: false
                    },
                    placeholder: '请输入消息标题'
                }
            },
            {
                label: '消息内容',
                fieldName: 'content',
                description: '消息内容，支持变量替换',
                control: {
                    name: 'textarea',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '请输入消息内容'
                }
            },
            {
                label: '链接地址',
                fieldName: 'url',
                description: '点击消息跳转的链接地址（仅文本卡片消息）',
                conditionRules: {
                    showBy: {
                        msgtype: ['textcard']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: false
                    },
                    placeholder: 'https://example.com'
                }
            },
            {
                label: '按钮文字',
                fieldName: 'btntxt',
                description: '按钮文字（仅文本卡片消息）',
                conditionRules: {
                    showBy: {
                        msgtype: ['textcard']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: false
                    },
                    placeholder: '详情'
                }
            },
            {
                label: '是否保密消息',
                fieldName: 'safe',
                description: '是否是保密消息，0表示否，1表示是',
                control: {
                    name: 'switch',
                    dataType: 'boolean',
                    defaultValue: false
                }
            }
        ]
    };

    /**
     * 执行企业微信消息发送
     */
    async execute(opts: IExecuteOptions): Promise<any> {
        const params = opts.inputs;
        
        if (!params || !params.credential) {
            return {
                success: false,
                message: '缺少输入参数'
            };
        }

        const credentialConfig = JSON.parse(params.credential || "{}");
        const credentialId = credentialConfig.id;
        if(!credentialId) {
            return {
                success: false,
                message: '缺少输入参数'
            };
        }

        const credential = await credentialManager.mediator?.get(credentialId);
        if(!credential || !credential.config) {
            return {
                success: false,
                error: 'Cannot found credential'
            }
        }

        const config = credential.config as WxWorkConfig;
        const wx = new WxWork(config);

        const msg = {
            userIds: [params.touser],
            type: 'text' as const,
            content: params.content
        };

        return await wx.sendMsg(msg);
    }
}