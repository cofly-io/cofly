import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

export class PdfNode implements INode {
	node: INodeBasic = {
		kind: 'pdf',
		name: 'PDF文档',
		event: "pdf",
		catalog: 'files',
		version: 1,
		description: "读取PDF文档并转换为JSON格式",
		icon: 'pdf.svg',
		nodeWidth: 500
	};

	detail: INodeDetail = {
		fields: [
			// 操作模式选择器（核心联动字段）
			{
				label: '操作类型',
				fieldName: 'operation',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'read',
					placeholder: '选择操作类型',
					options: [
						{
							name: '读取PDF',
							value: 'read',
							description: '从PDF文档读取内容',
						},
					],
				}
			},

			// 读取PDF相关字段
			{
				label: 'PDF文件路径',
				fieldName: 'filePath',
				conditionRules: {
					showBy: {
						operation: ['read'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: /data/document.pdf',
					validation: { required: true }
				}
			},
			{
				label: '输出字段名',
				fieldName: 'outputFieldName',
				conditionRules: {
					showBy: {
						operation: ['read'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'data',
					placeholder: '例如: content'
				}
			},
			{
				label: '提取页面范围',
				fieldName: 'pageRange',
				conditionRules: {
					showBy: {
						operation: ['read'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: 1-5 或 1,3,5'
				}
			},
			{
				label: '包含元数据',
				fieldName: 'includeMetadata',
				conditionRules: {
					showBy: {
						operation: ['read'],
					},
				},
				control: {
					name: 'switch',
					dataType: 'boolean',
					defaultValue: true
				}
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const operation = opts.inputs?.operation;
		
		try {
			if (operation === 'read') {
				return await this.executeRead(opts);
			} else {
				throw new Error(`未知操作类型: ${operation}`);
			}
		} catch (error: any) {
			console.error('PDF Node执行错误:', error.message);
			return {
				error: error.message,
				success: false
			};
		}
	}

	private async executeRead(opts: IExecuteOptions): Promise<any> {
		const filePath = opts.inputs?.filePath;
		const outputFieldName = opts.inputs?.outputFieldName || 'data';
		const pageRange = opts.inputs?.pageRange || '';
		const includeMetadata = opts.inputs?.includeMetadata !== false; // 默认为true
		
		if (!filePath) {
			throw new Error('文件路径不能为空');
		}

		// 检查文件是否存在
		if (!fs.existsSync(filePath)) {
			throw new Error(`文件不存在: ${filePath}`);
		}

		// 检查文件大小限制 (50MB)
		const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
		const stats = fs.statSync(filePath);
		if (stats.size > MAX_FILE_SIZE) {
			throw new Error(`文件大小超出限制: ${this.formatFileSize(stats.size)}。最大允许大小: ${this.formatFileSize(MAX_FILE_SIZE)}`);
		}

		try {
			// 读取PDF文件
			const fileBuffer = fs.readFileSync(filePath);
			
			// 配置pdf-parse选项
			const pdfOptions: any = {};
			
			// 如果指定了页面范围
			if (pageRange) {
				const pages = this.parsePageRange(pageRange);
				if (pages) {
					pdfOptions.max = Math.max(...pages);
					pdfOptions.min = Math.min(...pages);
				}
			}
			
			// 解析PDF
			const pdfData = await pdf(fileBuffer, pdfOptions);
			
			// 构建返回结果
			const result: any = {
				text: pdfData.text,
				numPages: pdfData.numpages,
				numRenderedPages: pdfData.numrender
			};
			
			// 如果需要包含元数据
			if (includeMetadata) {
				result.metadata = {
					info: pdfData.info,
					metadata: pdfData.metadata ? pdfData.metadata.metadata : null,
					version: pdfData.version
				};
			}
			
			// 如果指定了页面范围，过滤文本内容
			if (pageRange) {
				const pages = this.parsePageRange(pageRange);
				if (pages) {
					result.text = this.filterTextByPages(pdfData.text, pages);
				}
			}
			
			// 返回结果
			return {
				[outputFieldName]: result,
				filePath: filePath,
				fileSize: stats.size,
				success: true
			};
		} catch (error: any) {
			throw new Error(`读取PDF文件失败: ${error.message}`);
		}
	}
	
	/**
	 * 解析页面范围字符串
	 * @param pageRange 页面范围字符串，例如 "1-5" 或 "1,3,5"
	 * @returns 页面数组
	 */
	private parsePageRange(pageRange: string): number[] | null {
		if (!pageRange) return null;
		
		const pages: number[] = [];
		
		// 处理逗号分隔的页面
		if (pageRange.includes(',')) {
			const parts = pageRange.split(',');
			for (const part of parts) {
				const pageNum = parseInt(part.trim(), 10);
				if (!isNaN(pageNum) && pageNum > 0) {
					pages.push(pageNum);
				}
			}
		}
		// 处理范围格式 (例如 1-5)
		else if (pageRange.includes('-')) {
			const parts = pageRange.split('-');
			const start = parseInt(parts[0]?.trim() ?? '', 10);
			const end = parseInt(parts[1]?.trim() ?? '', 10);
			
			if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
				for (let i = start; i <= end; i++) {
					pages.push(i);
				}
			}
		}
		// 处理单个页面
		else {
			const pageNum = parseInt(pageRange.trim(), 10);
			if (!isNaN(pageNum) && pageNum > 0) {
				pages.push(pageNum);
			}
		}
		
		return pages.length > 0 ? pages : null;
	}
	
	/**
	 * 根据页面过滤文本内容
	 * @param text 完整的文本内容
	 * @param pages 要保留的页面数组
	 * @returns 过滤后的文本
	 */
	private filterTextByPages(text: string, pages: number[]): string {
		// 这是一个简化的实现
		// 在实际应用中，可能需要更复杂的逻辑来准确分割页面内容
		// 这里我们只是返回原文本作为示例
		return text;
	}
	
	/**
	 * 格式化文件大小显示
	 * @param bytes 字节数
	 * @returns 格式化后的文件大小字符串
	 */
	private formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
}