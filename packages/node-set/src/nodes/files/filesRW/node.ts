import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';
import glob from 'fast-glob';
import * as fs from 'fs';
import * as path from 'path';

export class FilesRW implements INode {
	node: INodeBasic = {
		kind: 'filesRW',
		name: '文件读写',
		event: "filesRW",
		catalog: 'files',
		version: 1,
		description: "读取或写入本机上的文件",
		icon: 'filesRW.svg',
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
							name: '读取文件',
							value: 'read',
							description: '读取一个或多个文件',
						},
						{
							name: '写入文件',
							value: 'write',
							description: '创建一个二进制文件',
						},
					],
				}
			},

			// 读取文件相关字段
			{
				label: '文件路径',
				fieldName: 'fileSelector',
				conditionRules: {
					showBy: {
						operation: ['read'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: /home/user/Pictures/**/*.png(支持Glob模式语法)',
					validation: { required: true }
				}
			},

			// 写入文件相关字段
			{
				label: '文件路径和名称',
				fieldName: 'fileName',
				conditionRules: {
					showBy: {
						operation: ['write'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: /data/example.jpg',
					validation: { required: true }
				}
			},
			{
				label: '数据格式',
				fieldName: 'dataFormat',
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'base64',
					validation: { required: true },
					options: [
						{
							name: 'Base64编码',
							value: 'base64'
						},
						{
							name: '纯文本',
							value: 'text'
						},
						{
							name: 'JSON对象',
							value: 'json'
						}
					]
				}
			},
			{
				label: '输入数据字段',
				fieldName: 'dataPropertyName',
				conditionRules: {
					showBy: {
						operation: ['write'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'data',
					placeholder: '例如: data',
					validation: { required: true }
				}
			},

			// 读取文件选项
			{
				// 无扩展名文件
				// config 文件 → 指定 ini 或 properties

				// 错误命名文件
				// sales.xls (实际是 CSV) → 指定 csv

				// 统一处理目录
				// 混合格式文件 → 强制作为 text/plain 读取

				// 特殊扩展名映射
				// .log → 指定 txt 获得 text/plain MIME

				// 二进制文件伪装
				// .txt 文件实际是加密二进制 → 指定 bin
				label: '指定文件扩展名',
				fieldName: 'fileExtension',
				conditionRules: {
					showBy: {
						operation: ['read'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: zip（可选，用于覆盖自动检测的扩展名）'
				}
			},
			{
				label: '输出字段名',
				fieldName: 'outputDataPropertyName',
				conditionRules: {
					showBy: {
						operation: ['read'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'data',
					placeholder: '例如: data'
				}
			},

			// 写入文件选项
			{
				label: '追加模式',
				fieldName: 'append',
				conditionRules: {
					showBy: {
						operation: ['write'],
					},
				},
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false,
					placeholder: '是否追加到现有文件'
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
			console.error('FilesRW执行错误:', error.message);
			return {
				error: error.message,
				success: false
			};
		}
	}

	private async executeRead(opts: IExecuteOptions): Promise<any> {
		const fileSelector = opts.inputs?.fileSelector;
		const userFileExtension = opts.inputs?.fileExtension;
		
		if (!fileSelector) {
			throw new Error('文件选择器不能为空');
		}

		// 处理文件路径格式
		let normalizedSelector = fileSelector;
		if (/^[a-zA-Z]:/.test(normalizedSelector)) {
			normalizedSelector = normalizedSelector.replace(/\\\\/g, '/');
		}

		// 使用glob查找文件
		const files = await glob(normalizedSelector);
		
		if (files.length === 0) {
			return {
				files: [],
				message: '未找到匹配的文件'
			};
		}

		const outputDataPropertyName = opts.inputs?.outputDataPropertyName || 'data';
		
		const results = [];
		for (const filePath of files) {
			try {
				const stats = fs.statSync(filePath);
				const content = fs.readFileSync(filePath);
				const fileName = path.basename(filePath);
				const autoDetectedExtension = path.extname(filePath).slice(1);
				
				// 优先使用用户指定的扩展名，否则使用自动检测的扩展名
				const finalExtension = userFileExtension || autoDetectedExtension;
				
				const fileInfo: any = {
					fileName: fileName,
					fileExtension: finalExtension,
					filePath: filePath,
					fileSize: stats.size,
					mimeType: this.getMimeType(finalExtension),
					lastModified: stats.mtime
				};
				
				// 使用用户配置的字段名存储文件内容
                if(opts?.inputs?.dataFormat === 'base64') {
                    fileInfo[outputDataPropertyName] = content.toString('base64');
                } else if(opts?.inputs?.dataFormat === 'text') {
                    fileInfo[outputDataPropertyName] = content.toString('utf8');
                } else {
                    fileInfo[outputDataPropertyName] = JSON.parse(content.toString('utf8'));
                }

				results.push(fileInfo);
			} catch (fileError: any) {
				console.error(`读取文件失败 ${filePath}:`, fileError.message);
				results.push({
					filePath: filePath,
					error: fileError.message
				});
			}
		}

		return {
			files: results,
			totalFiles: results.length,
			success: true
		};
	}

	private async executeWrite(opts: IExecuteOptions): Promise<any> {
		const fileName = opts.inputs?.fileName;
		const dataPropertyName = opts.inputs?.dataPropertyName || 'data';
		const dataFormat = opts.inputs?.dataFormat || 'base64';
		const append = opts.inputs?.append || false;
		
		if (!fileName) {
			throw new Error('文件路径不能为空');
		}

		// 获取要写入的内容
		const content = opts.inputs?.[dataPropertyName];
		if (!content) {
			throw new Error(`输入字段 '${dataPropertyName}' 不能为空`);
		}

		// 确保目录存在
		const dir = path.dirname(fileName);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		// 根据用户选择的数据格式处理内容
		let writeContent: Buffer;
		switch (dataFormat) {
			case 'base64':
				if (typeof content !== 'string') {
					throw new Error('Base64格式要求输入为字符串类型');
				}
				try {
					writeContent = Buffer.from(content, 'base64');
				} catch (error) {
					throw new Error('Base64解码失败，请检查输入格式');
				}
				break;
				
			case 'text':
				if (typeof content !== 'string') {
					throw new Error('文本格式要求输入为字符串类型');
				}
				writeContent = Buffer.from(content, 'utf8');
				break;
				
			case 'json':
				try {
					const jsonString = typeof content === 'string' ? content : JSON.stringify(content);
					writeContent = Buffer.from(jsonString, 'utf8');
				} catch (error) {
					throw new Error('JSON序列化失败，请检查输入数据');
				}
				break;
				
			default:
				// 兼容旧版本，保持原有的自动检测逻辑
				if (typeof content === 'string') {
					try {
						writeContent = Buffer.from(content, 'base64');
					} catch {
						writeContent = Buffer.from(content, 'utf8');
					}
				} else if (Buffer.isBuffer(content)) {
					writeContent = content;
				} else {
					writeContent = Buffer.from(JSON.stringify(content), 'utf8');
				}
				break;
		}

		// 写入文件
		const flag = append ? 'a' : 'w';
		fs.writeFileSync(fileName, writeContent, { flag });

		const stats = fs.statSync(fileName);
		
		return {
			fileName: fileName,
			fileSize: stats.size,
			operation: append ? 'append' : 'write',
			dataFormat: dataFormat,
			success: true,
			message: `文件${append ? '追加' : '写入'}成功（${dataFormat}格式）`
		};
	}

	private getMimeType(extension: string): string {
		const mimeTypes: { [key: string]: string } = {
			'txt': 'text/plain',
			'json': 'application/json',
			'xml': 'application/xml',
			'html': 'text/html',
			'css': 'text/css',
			'js': 'application/javascript',
			'png': 'image/png',
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'gif': 'image/gif',
			'pdf': 'application/pdf',
			'zip': 'application/zip'
		};
		
		return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
	}
}