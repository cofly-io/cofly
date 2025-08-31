import { INode, INodeBasic, INodeDetail, IExecuteOptions, NodeLink, credentialManager } from '@repo/common';

/**
 * Agent路由器
 * 通过规则在多个Agent之间协同
 */
export class AgentRouter implements INode {
    node: INodeBasic = {
        kind: 'agent-router',
        name: '智能体路由器',
        event: 'agent-router',
        catalog: 'AI',
        version: 1,
        description: '通过规则在多个智能体之间协同',
        icon: 'agent-router.png',
        nodeWidth: 600,
      link: {
        inputs: [NodeLink.Data],
        outputs: [NodeLink.Done, NodeLink.Composite]
      }
    };

    /**
     * 节点详细配置
     */
    detail: INodeDetail = {
        fields: [
            // {
            //     displayName: 'WebHook地址',
            //     name: 'webhook',
            //     type: 'string',
            //     required: true,
            //     default: '',
            //     description: '输入企业微信连消息推送WebHook地址',
            //     placeholder: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=???',
            //     controlType: 'textarea'
            // },
            // {
            //     displayName: '消息',
            //     name: 'message',
            //     type: 'string',
            //     required: true,
            //     default: '',
            //     description: '需要推送的消息',
            //     placeholder: '需要推送的消息',
            //     controlType: 'textarea'
            // },
        ]
    };

    /**
     * 执行企业微信群消息发送
     */
    async execute(opts: IExecuteOptions): Promise<any> {

        // const webhook = opts?.inputs?.webhook || undefined;
        // const message = opts?.inputs?.message || undefined;
        //
        // if(!webhook || !message) {
        //     return {
        //         success: false
        //     };
        // }
        //
        // const json = await fetch(webhook, {
        //     method: 'post',
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //         "msgtype": "text",
        //         "text": {
        //             "content": message
        //         }
        //     })
        // });
        //
        // return json;

      return true;
    }
}