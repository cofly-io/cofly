import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';

export class Markdown implements INode {
	node: INodeBasic = {
		kind: 'markdown',
		name: 'Markdown文档',
		event: "markdown",
		catalog: 'files',
		version: 1,
		description: "Markdown文件转HTML",
		icon: 'markdown.svg',
		nodeWidth: 600
	};
	detail: INodeDetail = {
		fields: [
			// 模式选择器（核心联动字段）
			{
				label: '转换模式',      // 显示名称
				fieldName: 'mode',                 // 字段名
				control: {
					name: 'select',
					dataType: 'string',
					options: [                    // 选项列表
						{
							name: 'Markdown转HTML',   // 选项显示名
							value: 'markdownToHtml',  // 选项值
						},
						{
							name: 'HTML转Markdown',
							value: 'htmlToMarkdown',
						},
						{
							name: '测试',
							value: 'ceshi',
						},
					],
				}
			},
			// HTML输入字段（条件显示）
			{
				label: 'HTML内容',     // 显示名称
				fieldName: 'html',                 // 字段名
				conditionRules: {             // 显示条件
					showBy: {
						mode: ['htmlToMarkdown', 'ceshi'], // 当mode为htmlToMarkdown时显示
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					validation: { required: true },               // 是否必填
					placeholder: '输入需要转换的HTML代码', // 描述
				}
			},
			// Markdown输入字段（条件显示）
			{
				label: 'Markdown内容',     // 显示名称
				fieldName: 'markdown',                 // 字段名
				conditionRules: {             // 显示条件
					showBy: {
						mode: ['markdownToHtml'], // 当mode为htmlToMarkdown时显示
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					validation: { required: true },               // 是否必填
					placeholder: '输入需要转换的Markdown文本', // 描述
				}
			},
			// 目标字段（通用配置）
			{
				label: '目标字段',
				fieldName: 'destinationKey',
				conditionRules: {
					showBy: {
						mode: ['markdownToHtml', 'htmlToMarkdown'], // 两种模式下都显示
					},
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					validation: { required: true },               // 是否必填
					placeholder: '输入需要转换的Markdown文本', // 描述
				}
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		return "this a markdown executing function";
	}
}
