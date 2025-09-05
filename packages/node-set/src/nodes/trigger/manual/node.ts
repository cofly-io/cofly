import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class Manual implements INode {
	node: INodeBasic = {
		kind: 'manual',
		name: '手工触发',
		catalog: 'trigger',
		version: 1,
		description: "手工触发任务，多用于测试",
		icon: 'manual.svg'
	};
	detail: INodeDetail = {
		fields: [
			// 模式选择器（核心联动字段）
			{
				label: '说明',      // 显示名称
				fieldName: 'note',                 // 字段名
				control: {
					name: 'note',        // 提示AI这是联动触发器
					dataType: 'string',
					defaultValue: '此节点是工作流执行的起始点，点击画布上"业务流测试"后，工作流会继续执行后续节点'
				}
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const now = new Date();

		// 格式化日期 (yyyy-mm-dd)
		const currentDate = now.getFullYear() + '-' +
			String(now.getMonth() + 1).padStart(2, '0') + '-' +
			String(now.getDate()).padStart(2, '0');

		// 格式化时间 (hh:MM:ss)
		const currentTime = String(now.getHours()).padStart(2, '0') + ':' +
			String(now.getMinutes()).padStart(2, '0') + ':' +
			String(now.getSeconds()).padStart(2, '0');

		// 格式化日期时间 (yyyy-mm-dd hh:MM:ss)
		const currentDateTime = currentDate + ' ' + currentTime;

		return {
			currentDate,
			currentTime,
			currentDateTime
		};

	}
}
