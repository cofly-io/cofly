import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class Markdown implements INode {
	node: INodeBasic = {
		kind: 'markdown',
		name: 'Markdown文档',
		event: "markdown",
		catalog:'general',
		version: 1,
		description: "Markdown文件转HTML",
		icon: 'markdown.svg',
		nodeWidth: 600
	};
	detail: INodeDetail = {
		// displayName: 'Markdown',
		// name: 'markdown',		
		// group: ['input', 'output'],
		// subtitle:
		// 	'={{$parameter["mode"]==="markdownToHtml" ? "Markdown to HTML" : "HTML to Markdown"}}',
		// description: 'Convert data between Markdown and HTML',
		// inputs: [NodeConnectionTypes.Main],
		// outputs: [NodeConnectionTypes.Main],
		fields: [
			// 模式选择器（核心联动字段）
			{
				displayName: '转换模式',      // 显示名称
				name: 'mode',                 // 字段名
				type: 'options',              // 字段类型
				options: [                    // 选项列表
					{
						name: 'Markdown转HTML',   // 选项显示名
						value: 'markdownToHtml',  // 选项值
					},
					{
						name: 'HTML转Markdown',
						value: 'htmlToMarkdown',
					},
				],
				default: 'htmlToMarkdown',    // 默认值
				placeholder: '选择转换方向',   // 描述
				controlType: 'selectwithdesc'        // 提示AI这是联动触发器
			},

			// HTML输入字段（条件显示）
			{
				displayName: 'HTML内容',     // 显示名称
				name: 'html',                 // 字段名
				type: 'string',               // 字段类型
				displayOptions: {             // 显示条件
					showBy: {
						mode: ['htmlToMarkdown'], // 当mode为htmlToMarkdown时显示
					},
				},
				default: '',                   // 默认值
				required: true,               // 是否必填
				placeholder: '输入需要转换的HTML代码', // 描述
				controlType: 'input'      // 提示AI使用代码编辑器
			},

			// Markdown输入字段（条件显示）
			{
				displayName: 'Markdown内容',
				name: 'markdown',
				type: 'string',
				displayOptions: {
					showBy: {
						mode: ['markdownToHtml'], // 当mode为markdownToHtml时显示
					},
				},
				default: '',
				required: true,
				placeholder: '输入需要转换的Markdown文本',
				controlType: 'input' // 提示AI使用Markdown编辑器
			},

			// 目标字段（通用配置）
			{
				displayName: '目标字段',
				name: 'destinationKey',
				type: 'string',
				displayOptions: {
					showBy: {
						mode: ['markdownToHtml', 'htmlToMarkdown'], // 两种模式下都显示
					},
				},
				default: 'data',
				required: true,
				placeholder: '转换结果的存储位置',
				controlType: 'textarea'      // 提示AI使用路径输入控件
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		return "this a markdown executing function";
	}
}
