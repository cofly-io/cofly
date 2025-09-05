import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class Debug implements INode {
	node: INodeBasic = {
		kind: 'debug',
		name: '调试节点',
		event: "markdown",
		catalog: 'general',
		version: 1,
		description: "用于节点调试",
		icon: 'debug.svg',
		nodeWidth: 600
	};
	detail: INodeDetail = {
		fields: [
			{
				label: '调试数据',
				fieldName: 'outputData',
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '{}',
					placeholder: '输入传递到下游的数据',
					validation: { required: true }
				}
			},
			{
				label: '向下游输出数据的类型',
				fieldName: 'outputType',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'json',
					placeholder: '输出数据类型',
					validation: { required: true }
				}
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		if(opts.inputs?.outputType === 'json') {
			return { ...JSON.parse(opts.inputs?.outputData) };
		}

		return opts.inputs?.outputData;
	}
}
