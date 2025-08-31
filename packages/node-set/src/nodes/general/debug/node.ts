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
				displayName: '调试数据',
				name: 'outputData',
				type: 'string',
				default: '{}',
				required: true,
				placeholder: '输入传递到下游的数据',
				controlType: 'textarea'      // 提示AI使用路径输入控件
			},
			{
				displayName: '向下游输出数据的类型',
				name: 'outputType',
				type: 'string',
				default: 'json',
				required: true,
				placeholder: '输出数据类型',
				controlType: 'input'      // 提示AI使用路径输入控件
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
