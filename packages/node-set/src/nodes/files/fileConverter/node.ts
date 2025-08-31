import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class FileConverter implements INode {
	node: INodeBasic = {
		kind: 'fileConverter',
		name: '文件转换器',
		event: "fileConverter",
		catalog: 'files',
		version: 1,
		description: "在不同文件格式之间进行转换",
		icon: 'fileConverter.svg',
		nodeWidth: 500
	};

	detail: INodeDetail = {
		fields: [
			{
				displayName: '操作类型',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: '转换为JSON',
						value: 'toJson',
						description: '将输入数据转换为JSON文件',
					},
					{
						name: '转换为文本',
						value: 'toText',
						description: '将输入数据转换为文本文件',
					},
					{
						name: '转换为CSV',
						value: 'toCsv',
						description: '将输入数据转换为CSV文件',
					},
					{
						name: 'Base64转文件',
						value: 'base64ToFile',
						description: '将base64字符串转换为文件',
					},
				],
				default: 'toJson',
				placeholder: '选择操作类型',
				controlType: 'selectwithdesc'
			},
			{
				displayName: '源属性名',
				name: 'sourceProperty',
				type: 'string',
				default: 'data',
				placeholder: '例如: data',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['toJson', 'toText', 'toCsv'],
					},
				},
			},
			{
				displayName: 'Base64属性名',
				name: 'base64Property',
				type: 'string',
				default: 'data',
				placeholder: '例如: data',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['base64ToFile'],
					},
				},
			},
			{
				displayName: '输出文件名',
				name: 'fileName',
				type: 'string',
				default: 'output',
				placeholder: '例如: output',
				controlType: 'input'
			},
			{
				displayName: '输出二进制属性名',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				placeholder: '例如: data',
				controlType: 'input'
			},
			{
				displayName: '编码格式',
				name: 'encoding',
				type: 'options',
				options: [
					{ name: 'UTF-8', value: 'utf8' },
					{ name: 'ASCII', value: 'ascii' },
					{ name: 'Base64', value: 'base64' },
					{ name: 'Hex', value: 'hex' },
				],
				default: 'utf8',
				placeholder: '选择编码格式',
				controlType: 'select',
				displayOptions: {
					showBy: {
						operation: ['toJson', 'toText', 'toCsv'],
					},
				},
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		try {
			const operation = opts.inputs?.operation || 'toJson';
			const sourceProperty = opts.inputs?.sourceProperty || 'data';
			const base64Property = opts.inputs?.base64Property || 'data';
			const fileName = opts.inputs?.fileName || 'output';
			const binaryPropertyName = opts.inputs?.binaryPropertyName || 'data';
			const encoding = opts.inputs?.encoding || 'utf8';

			if (operation === 'toJson') {
				return await this.executeToJson(opts, sourceProperty, fileName, binaryPropertyName, encoding);
			} else if (operation === 'toText') {
				return await this.executeToText(opts, sourceProperty, fileName, binaryPropertyName, encoding);
			} else if (operation === 'toCsv') {
				return await this.executeToCsv(opts, sourceProperty, fileName, binaryPropertyName, encoding);
			} else if (operation === 'base64ToFile') {
				return await this.executeBase64ToFile(opts, base64Property, fileName, binaryPropertyName);
			} else {
				throw new Error(`未知操作类型: ${operation}`);
			}
		} catch (error: any) {
			console.error('FileConverter执行错误:', error.message);
			return {
				error: error.message,
				success: false
			};
		}
	}

	private async executeToJson(opts: IExecuteOptions, sourceProperty: string, fileName: string, binaryPropertyName: string, encoding: string): Promise<any> {
		const sourceData = opts.inputs?.[sourceProperty];
		if (sourceData === undefined) {
			throw new Error(`属性 '${sourceProperty}' 未找到`);
		}

		const jsonString = JSON.stringify(sourceData, null, 2);
		const fileContent = Buffer.from(jsonString, encoding as BufferEncoding);
		const mimeType = 'application/json';
		const fileExtension = 'json';

		return {
			[binaryPropertyName]: {
				data: fileContent.toString('base64'),
				mimeType,
				fileName: `${fileName}.${fileExtension}`,
				fileSize: fileContent.length,
			},
			operation: 'toJson',
			success: true
		};
	}

	private async executeToText(opts: IExecuteOptions, sourceProperty: string, fileName: string, binaryPropertyName: string, encoding: string): Promise<any> {
		const sourceData = opts.inputs?.[sourceProperty];
		if (sourceData === undefined) {
			throw new Error(`属性 '${sourceProperty}' 未找到`);
		}

		const textContent = typeof sourceData === 'string' ? sourceData : JSON.stringify(sourceData);
		const fileContent = Buffer.from(textContent, encoding as BufferEncoding);
		const mimeType = 'text/plain';
		const fileExtension = 'txt';

		return {
			[binaryPropertyName]: {
				data: fileContent.toString('base64'),
				mimeType,
				fileName: `${fileName}.${fileExtension}`,
				fileSize: fileContent.length,
			},
			operation: 'toText',
			success: true
		};
	}

	private async executeToCsv(opts: IExecuteOptions, sourceProperty: string, fileName: string, binaryPropertyName: string, encoding: string): Promise<any> {
		const sourceData = opts.inputs?.[sourceProperty];
		if (!Array.isArray(sourceData)) {
			throw new Error('CSV转换需要对象数组');
		}

		let fileContent: Buffer;
		if (sourceData.length === 0) {
			fileContent = Buffer.from('', encoding as BufferEncoding);
		} else {
			// Get headers from first object
			const headers = Object.keys(sourceData[0]);
			const csvLines = [headers.join(',')];

			// Add data rows
			for (const row of sourceData) {
				const values = headers.map(header => {
					const value = row[header];
					if (value === null || value === undefined) {
						return '';
					}
					const stringValue = String(value);
					// Escape quotes and wrap in quotes if contains comma or quote
					if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
						return `"${stringValue.replace(/"/g, '""')}"`;
					}
					return stringValue;
				});
				csvLines.push(values.join(','));
			}

			fileContent = Buffer.from(csvLines.join('\n'), encoding as BufferEncoding);
		}

		const mimeType = 'text/csv';
		const fileExtension = 'csv';

		return {
			[binaryPropertyName]: {
				data: fileContent.toString('base64'),
				mimeType,
				fileName: `${fileName}.${fileExtension}`,
				fileSize: fileContent.length,
			},
			operation: 'toCsv',
			success: true
		};
	}

	private async executeBase64ToFile(opts: IExecuteOptions, base64Property: string, fileName: string, binaryPropertyName: string): Promise<any> {
		const base64Data = opts.inputs?.[base64Property];
		if (!base64Data || typeof base64Data !== 'string') {
			throw new Error(`属性 '${base64Property}' 必须包含有效的base64字符串`);
		}

		// Handle data URL format (data:mime/type;base64,data)
		let actualBase64Data = base64Data;
		let detectedMimeType = 'application/octet-stream';

		const dataUrlMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
		if (dataUrlMatch && dataUrlMatch[1] && dataUrlMatch[2]) {
			detectedMimeType = dataUrlMatch[1];
			actualBase64Data = dataUrlMatch[2];
		}

		let fileContent: Buffer;
		try {
			fileContent = Buffer.from(actualBase64Data, 'base64');
		} catch (error) {
			throw new Error('无效的base64数据');
		}

		const mimeType = detectedMimeType;
		const fileExtension = this.getExtensionFromMimeType(mimeType);

		return {
			[binaryPropertyName]: {
				data: fileContent.toString('base64'),
				mimeType,
				fileName: `${fileName}.${fileExtension}`,
				fileSize: fileContent.length,
			},
			operation: 'base64ToFile',
			success: true
		};
	}

	private getExtensionFromMimeType(mimeType: string): string {
		const mimeToExt: Record<string, string> = {
			'application/json': 'json',
			'text/plain': 'txt',
			'text/csv': 'csv',
			'text/html': 'html',
			'application/pdf': 'pdf',
			'image/jpeg': 'jpg',
			'image/png': 'png',
			'image/gif': 'gif',
			'image/svg+xml': 'svg',
			'application/zip': 'zip',
			'application/xml': 'xml',
			'text/xml': 'xml',
		};
		return mimeToExt[mimeType] ?? 'bin';
	}
}