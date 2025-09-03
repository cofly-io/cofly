import { X2jOptions, XMLParser } from 'fast-xml-parser';
import {
    credentialManager,
    IExecuteOptions,
    IExecuteResult,
    INode,
    INodeDetail,
    INodeWebhook,
    IWebhookMessage
} from '@repo/common';
import { WxWork, WxWorkConfig, WxWorkVerifyParams } from "../../../utils/wxwork";

export class WecomEvent implements INode{
	node: INodeWebhook = {
		kind: 'wecom-event',
		name: '企微触发',
		catalog: 'trigger',
		version: 1,
		description: "企业微信触发，多用接收来自企业微信的回调",
		icon: 'wecom-event.svg',
        nodeMode: 'webhook',
        respondData: "node-result"
	};
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
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const message = opts?.inputs?.message as IWebhookMessage;
        if(!message) {
            return {
                success: false,
                error: 'Bad request'
            }
        }

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

        if(message.method == 'GET') {
            const urlParams = new URLSearchParams(message.query);
            const params = {
                msgSignature: urlParams.get('msg_signature'),
                timestamp: urlParams.get('timestamp'),
                nonce: urlParams.get('nonce'),
                echostr: urlParams.get('echostr'),
            } as WxWorkVerifyParams;

            const echo = wx.verifyURL(params);
            if(echo === undefined) {
                return {
                    success: false,
                    error: "Verify URL failed."
                }
            }

            return {
                data: echo,
                status: 'BREAK'
            } as IExecuteResult;
        } else if(message.method == 'POST') {
            const urlParams = new URLSearchParams(message.query);
            const params = {
                msgSignature: urlParams.get('msg_signature'),
                timestamp: urlParams.get('timestamp'),
                nonce: urlParams.get('nonce'),
                postData: message.body,
            } as WxWorkVerifyParams;

            const msg = wx.decryptMsg(params);
            if(!msg) {
                return {
                    success: false,
                    error: "Decrypt Message failed."
                }
            }

            const pascalToCamelCase = (tagName: string): string => {
                if (!tagName || typeof tagName !== 'string') {
                    return tagName;
                }
                // 將第一個字母轉為小寫
                return tagName.charAt(0).toLowerCase() + tagName.slice(1);
            };

            const options : X2jOptions = {
                ignoreAttributes: false,
                // 設置屬性前綴，這是一個好的習慣，用來區分屬性與標籤
                attributeNamePrefix: "",
                transformTagName: pascalToCamelCase,
                transformAttributeName: pascalToCamelCase
            };

            const parser = new XMLParser(options);
            const jsonMsg = parser.parse(msg);

            return jsonMsg.xml;
        }
	}
}
