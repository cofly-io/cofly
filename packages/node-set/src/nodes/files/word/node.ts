import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

export class WordNode implements INode {
	node: INodeBasic = {
		kind: 'word',
		name: 'Word文档',
		event: "word",
		catalog: 'files',
		version: 1,
		description: "读取或写入Word文档(.docx)",
		icon: 'word.svg',
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
							name: '读取Word',
							value: 'read',
							description: '从Word文档读取内容',
						},
						{
							name: '写入Word',
							value: 'write',
							description: '将内容写入Word文档',
						},
					],
				}
			},

			// 读取Word相关字段
			{
				label: 'Word文件路径',
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
					placeholder: '例如: /data/document.docx',
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

			// 写入Word相关字段
			{
				label: '保存文件路径',
				fieldName: 'outputFilePath',
				conditionRules: {
					showBy: {
						operation: ['write'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: /data/output.docx',
					validation: { required: true }
				}
			},
			{
				label: '输入内容',
				fieldName: 'content',
				conditionRules: {
					showBy: {
						operation: ['write'],
					},
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '输入要写入Word文档的内容'
				}
			},
			{
				label: '内容格式',
				fieldName: 'contentFormat',
				conditionRules: {
					showBy: {
						operation: ['write'],
					},
				},
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'text',
					options: [
						{
							name: '纯文本',
							value: 'text'
						},
						{
							name: 'HTML',
							value: 'html'
						}
					]
				}
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const operation = opts.inputs?.operation;
		
		try {
			if (operation === 'read') {
				return await this.executeRead(opts);
			} else if (operation === 'write') {
				return await this.executeWrite(opts);
			} else {
				throw new Error(`未知操作类型: ${operation}`);
			}
		} catch (error: any) {
			console.error('Word Node执行错误:', error.message);
			return {
				error: error.message,
				success: false
			};
		}
	}

	private async executeRead(opts: IExecuteOptions): Promise<any> {
		const filePath = opts.inputs?.filePath;
		const outputFieldName = opts.inputs?.outputFieldName || 'data';
		
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
			// 使用mammoth读取Word文档
			const result = await mammoth.convertToHtml({ path: filePath });
			
			// 返回结果
			return {
				[outputFieldName]: result.value,
				messages: result.messages,
				filePath: filePath,
				fileSize: stats.size,
				success: true
			};
		} catch (error: any) {
			throw new Error(`读取Word文件失败: ${error.message}`);
		}
	}

	private async executeWrite(opts: IExecuteOptions): Promise<any> {
		const outputFilePath = opts.inputs?.outputFilePath;
		const content = opts.inputs?.content || '';
		const contentFormat = opts.inputs?.contentFormat || 'text';
		
		if (!outputFilePath) {
			throw new Error('输出文件路径不能为空');
		}

		// 确保目录存在
		const dir = path.dirname(outputFilePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		try {
			// 创建一个简单的Word文档模板内容
			let templateContent = content;
			
			// 如果是HTML格式，我们需要特殊处理
			if (contentFormat === 'html') {
				// 对于HTML内容，我们可以直接写入，但需要确保格式正确
				templateContent = content;
			}

			// 创建一个基础的docx模板
			const docxTemplate = this.createSimpleDocxTemplate(templateContent);

			// 写入文件
			fs.writeFileSync(outputFilePath, docxTemplate, 'binary');

			// 获取文件信息
			const stats = fs.statSync(outputFilePath);
			
			return {
				filePath: outputFilePath,
				fileSize: stats.size,
				success: true,
				message: `文件写入成功`
			};
		} catch (error: any) {
			throw new Error(`写入文件失败: ${error.message}`);
		}
	}
	
	/**
	 * 创建一个简单的docx文档模板
	 * @param content 要写入的内容
	 * @returns 二进制格式的docx文档
	 */
	private createSimpleDocxTemplate(content: string): Buffer {
		// 创建一个简单的Word文档结构
		const zip = new PizZip();
		
		// 添加基本的Word文档结构文件
		zip.file("[Content_Types].xml", 
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
				<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
				<Default Extension="xml" ContentType="application/xml"/>
				<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
				<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
				<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
				<Override PartName="/word/webSettings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml"/>
				<Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
				<Override PartName="/word/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
			</Types>`
		);
		
		zip.file("_rels/.rels", 
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
				<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
			</Relationships>`
		);
		
		zip.file("word/document.xml", 
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
				<w:body>
					<w:p>
						<w:r>
							<w:t>${this.escapeXml(content)}</w:t>
						</w:r>
					</w:p>
				</w:body>
			</w:document>`
		);
		
		zip.file("word/styles.xml",
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:docDefaults>
					<w:rPrDefault>
						<w:rPr>
							<w:rFonts w:ascii="Calibri" w:eastAsia="宋体" w:hAnsi="Calibri" w:cs="Times New Roman"/>
						</w:rPr>
					</w:rPrDefault>
					<w:pPrDefault/>
				</w:docDefaults>
			</w:styles>`
		);
		
		zip.file("word/settings.xml",
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:defaultTabStop w:val="720"/>
			</w:settings>`
		);
		
		zip.file("word/webSettings.xml",
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<w:webSettings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`
		);
		
		zip.file("word/fontTable.xml",
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`
		);
		
		zip.file("word/theme/theme1.xml",
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
				<a:themeElements>
					<a:clrScheme name="Office">
						<a:dk1><a:srgbClr val="000000"/></a:dk1>
						<a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
					</a:clrScheme>
					<a:fontScheme name="Office">
						<a:majorFont>
							<a:latin typeface="Calibri"/>
						</a:majorFont>
						<a:minorFont>
							<a:latin typeface="Calibri"/>
						</a:minorFont>
					</a:fontScheme>
				</a:themeElements>
			</a:theme>`
		);
		
		zip.file("word/_rels/document.xml.rels", 
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
			</Relationships>`
		);

		// 生成Word文档
		return zip.generate({
			type: "nodebuffer",
			compression: "DEFLATE"
		});
	}
	
	private escapeXml(unsafe: string): string {
		return unsafe.replace(/[<>&'"]/g, (c) => {
			switch (c) {
				case '<': return '&lt;';
				case '>': return '&gt;';
				case '&': return '&amp;';
				case '\'': return '&apos;';
				case '"': return '&quot;';
				default: return c;
			}
		});
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