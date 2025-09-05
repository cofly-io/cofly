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
                label: '请求方式',             // 显示名称
                fieldName: 'method',                     // 字段名
                control: {
                    name: 'select',
                    dataType: 'string',
                    defaultValue: 'GET',                     // 默认值
                    options: [
                        { name: 'GET', value: 'GET' },
                        { name: 'POST', value: 'POST' },
                        { name: 'PUT', value: 'PUT' },
                        { name: 'DELETE', value: 'DELETE' },
                    ],
                }
            },
            {
                label: '响应模式',             // 显示名称
                fieldName: 'respondMode',                // 字段名
                control: {
                    name: 'selectwithdesc',
                    dataType: 'string',
                    defaultValue: 'imm',                     // 默认值
                    options: [
                        { name: '立即返回', value: 'onCall', description: '立即执行并返回结果' },
                        { name: '执行完成后返回', value: 'onFinished', description: '最后一个节点执行完成后返回' },
                        { name: '使用“响应到Webhook”节点', value: 'onNode', description: '通过定义在流程中的相应节点返回' },
                    ],
                }
            },
			{
				label: '说明',                 // 显示名称
				fieldName: 'note',                       // 字段名
				control: {
					name: 'note',
					dataType: 'string',
					defaultValue: ''                        // 默认值
				}
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		return opts?.inputs?.message || {};
	}
}
