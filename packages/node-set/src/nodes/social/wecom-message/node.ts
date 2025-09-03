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
                displayName: '企业微信连接',
                name: 'credential',
                type: 'string',
                required: true,
                connectType: 'wecom',
                default: '',
                description: '选择企业微信连接配置',
                controlType: 'selectconnect'
            },
            {
                displayName: '接收人',
                name: 'touser',
                type: 'string',
                required: true,
                default: '',
                description: '接收消息的用户ID，多个用户用|分隔，@all表示全部用户',
                placeholder: '用户ID或@all',
                controlType: 'input'
            },
            {
                displayName: '消息类型',
                name: 'msgtype',
                type: 'options',
                required: true,
                default: 'text',
                description: '选择消息类型',
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
                controlType: 'select',
                placeholder: '选择消息类型'
            },
            {
                displayName: '消息标题',
                name: 'title',
                type: 'string',
                required: false,
                default: '',
                description: '消息标题（仅文本卡片消息需要）',
                placeholder: '请输入消息标题',
                displayOptions: {
                    showBy: {
                        msgtype: ['textcard']
                    }
                },
                controlType: 'input'
            },
            {
                displayName: '消息内容',
                name: 'content',
                type: 'string',
                required: true,
                default: '',
                description: '消息内容，支持变量替换',
                placeholder: '请输入消息内容',
                controlType: 'textarea'
            },
            {
                displayName: '链接地址',
                name: 'url',
                type: 'string',
                required: false,
                default: '',
                description: '点击消息跳转的链接地址（仅文本卡片消息）',
                placeholder: 'https://example.com',
                displayOptions: {
                    showBy: {
                        msgtype: ['textcard']
                    }
                },
                controlType: 'input'
            },
            {
                displayName: '按钮文字',
                name: 'btntxt',
                type: 'string',
                required: false,
                default: '',
                description: '按钮文字（仅文本卡片消息）',
                placeholder: '详情',
                displayOptions: {
                    showBy: {
                        msgtype: ['textcard']
                    }
                },
                controlType: 'input'
            },
            {
                displayName: '是否保密消息',
                name: 'safe',
                type: 'boolean',
                required: false,
                default: false,
                description: '是否是保密消息，0表示否，1表示是',
                controlType: 'switch'
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