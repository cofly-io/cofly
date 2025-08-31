import type { IExecuteOptions, INode, INodeWebhook, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class Webhook implements INode {
	node: INodeWebhook = {
		kind: 'webhook',
		name: 'Webhook触发',
		catalog: 'trigger',
		version: 1,
		description: "Webhook，多用于外部回调",
		icon: 'webhook.svg',
        nodeMode: 'webhook',
        respondData: "node-result",
	};
	detail: INodeDetail = {
		fields: [
            {
                displayName: '请求方式',             // 显示名称
                name: 'method',                     // 字段名
                type: 'string',                     // 字段类型
                default: 'GET',                     // 默认值
                controlType: 'select',
                options: [
                    { name: 'GET', value: 'GET' },
                    { name: 'POST', value: 'POST' },
                    { name: 'PUT', value: 'PUT' },
                    { name: 'DELETE', value: 'DELETE' },
                ],
            },
            {
                displayName: '响应模式',             // 显示名称
                name: 'respondMode',                // 字段名
                type: 'string',                     // 字段类型
                default: 'imm',                     // 默认值
                controlType: 'selectwithdesc',
                options: [
                    { name: '立即返回', value: 'onCall', description: '立即执行并返回结果' },
                    { name: '执行完成后返回', value: 'onFinished', description: '最后一个节点执行完成后返回' },
                    { name: '使用“响应到Webhook”节点', value: 'onNode', description: '通过定义在流程中的相应节点返回' },
                ],
            },
			{
				displayName: '说明',                 // 显示名称
				name: 'note',                       // 字段名
				type: 'string',                     // 字段类型
				default: '',                        // 默认值
				controlType: 'Note'
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		return opts?.inputs?.message || {};
	}
}
