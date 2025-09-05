import { INode, INodeBasic, INodeDetail, IExecuteOptions, NodeLink, credentialManager } from '@repo/common';

/**
 * 企业微信消息发送节点
 * 支持向企业微信用户发送应用消息
 */
export class WecomNotice implements INode {
    node: INodeBasic = {
        kind: 'wecom-notice',
        name: '企微群通知',
        event: 'wecom-notice',
        catalog: 'social',
        version: 1,
        description: '向企业微信群消息推送Webhook发送消息',
        icon: 'wecom-notice.svg',
        nodeWidth: 600
    };

    /**
     * 节点详细配置
     */
    detail: INodeDetail = {
        fields: [
            {
                label: 'WebHook地址',
                fieldName: 'webhook',
                description: '输入企业微信连消息推送WebHook地址',
                control: {
                    name: 'textarea',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=???'
                }
            },
            {
                label: '消息',
                fieldName: 'message',
                description: '需要推送的消息',
                control: {
                    name: 'textarea',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '需要推送的消息'
                }
            }
        ]
    };

    /**
     * 执行企业微信群消息发送
     */
    async execute(opts: IExecuteOptions): Promise<any> {

        const webhook = opts?.inputs?.webhook || undefined;
        const message = opts?.inputs?.message || undefined;

        if(!webhook || !message) {
            return {
                success: false
            };
        }

        const json = await fetch(webhook, {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "msgtype": "text",
                "text": {
                    "content": message
                }
            })
        });

        return json;
    }
}