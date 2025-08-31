import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class Schedule implements INode {
	node: INodeBasic = {
		kind: 'schedule',
		name: '定时触发',
		catalog: 'trigger',
		version: 1,
		description: '在指定的时间计划上触发工作流',
		icon: 'schedule.svg',
	};

	detail: INodeDetail = {
		// displayName: 'Markdown',
		fields: [
			{
				displayName: 'cron表达式',     // 显示名称
				name: 'cronExpression',                 // 字段名
				type: 'string',               // 字段类型
				default: '',                   // 默认值
				required: true,               // 是否必填
				placeholder: '输入cron表达式', // 描述
				controlType: 'input'      // 提示AI使用代码编辑器
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		return "this a markdown executing function";
	}
}
