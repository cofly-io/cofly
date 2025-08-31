import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@cofly-ai/interfaces';
import { NodeLink } from '@cofly-ai/interfaces';

export class MathDemo implements INode {
	node: INodeBasic = {
		kind: 'math-demo',
		name: '数学计算',
		event: "math-demo",
		categories: ['general'],
		version: 1,
		position: [0, 0],
		description: "用于数学计算的模块",
		icon: 'markdown.svg',
		nodeWidth: 600,
		link: {
			inputs: [NodeLink.Data],
			outputs: [NodeLink.Data]
		}
	};
	detail: INodeDetail = {
		fields: [
			{
				displayName: '表达式',
				name: 'expression',
				type: 'string',
				default: '1 + 2 * 3',
				required: true,
				placeholder: '输入计算公式',
				controlType: 'textarea'      // 提示AI使用路径输入控件
			},
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		return eval(opts?.inputs?.expression);
	}
}
