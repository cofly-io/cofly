import { X2jOptions, XMLParser } from 'fast-xml-parser';
import { credentialManager, IExecuteOptions, INode, INodeDetail, INodeWebhook, IWebhookMessage } from '@repo/common';
import { WxWork, WxWorkConfig, WxWorkVerifyParams } from "../../../utils/wxwork";

export class FeishuEvent implements INode{
	node: INodeWebhook = {
		kind: 'feishu-event',
		name: '飞书触发',
		catalog: 'trigger',
		version: 1,
		description: "飞书应用触发，接收来自飞书的回调",
		icon: 'feishu-event.svg',
        nodeMode: 'webhook',
        respondData: "node-result"
	};
	detail: INodeDetail = {
		fields: [
            {
                displayName: '飞书连接',
                name: 'credential',
                type: 'string',
                required: true,
                connectType: 'feishu',
                default: '',
                description: '选择飞书连接配置',
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

        const credential = await credentialManager.mediator?.get(opts?.inputs?.credential);
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

            return echo;
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
