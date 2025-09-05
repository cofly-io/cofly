import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';
import {
	FileData,
	ProcessResult,
	EncodingType,
	OperationType,
	KeepSourceStrategy,
} from './fileInterface'
import { OPERATION_TYPES, ENCODING_TYPES, KEEP_SOURCE_STRATEGIES, DEFAULT_CONFIG } from './fileInterface'

export class FileExtracted implements INode {
	node: INodeBasic = {
		kind: 'fileExtracted',
		name: '文件提取器',
		event: "fileExtracted",
		catalog: 'files',
		version: 1,
		description: "从文件中提取数据",
		icon: 'fileExtracted.svg',
		nodeWidth: 500
	};

	detail: INodeDetail = {
		fields: [

			{
				label: '操作类型',
				fieldName: 'operation',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'fromJson',
					placeholder: '选择操作类型',
					options: [
						{
							name: '从JSON提取',
							value: 'fromJson',
							description: '从JSON文件中提取数据',
						},
						{
							name: '从文本提取',
							value: 'fromText',
							description: '从文件中提取文本内容',
						},
						{
							name: '从CSV提取',
							value: 'fromCsv',
							description: '从CSV文件中提取数据',
						},
						{
							name: '文件转Base64',
							value: 'fileToBase64',
							description: '将文件转换为base64字符串',
						},
					],
				}
			},
			{
				label: '二进制流输入',
				fieldName: 'binaryPropertyName',
				description: '包含文件数据的属性路径，支持嵌套访问、数组索引和通配符',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'data',
					placeholder: '例如: data 或 {{ $.文件读写.json.files[0].data }} 或 {{ $.文件读写.json.files[*].data }}',
					validation: { required: true }
				}
			},
			{
				label: '输出属性名',
				fieldName: 'outputProperty',
				description: 'Name of the output property to store extracted data',
				conditionRules: {
					showBy: {
						operation: ['fromJson', 'fromText', 'fromCsv'],
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
			{
				label: 'Base64输出属性名',
				fieldName: 'base64OutputProperty',
				description: 'Name of the output property to store base64 string',
				conditionRules: {
					showBy: {
						operation: ['fileToBase64'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'base64',
					placeholder: '例如: base64',
					validation: { required: true }
				}
			},
			{
				label: '编码格式',
				fieldName: 'encoding',
				description: 'Text encoding of the input file',
				conditionRules: {
					showBy: {
						operation: ['fromJson', 'fromText', 'fromCsv'],
					},
				},
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'utf8',
					placeholder: '选择编码格式',
					options: [
						{ name: 'UTF-8', value: 'utf8' },
						{ name: 'ASCII', value: 'ascii' },
						{ name: 'Latin1', value: 'latin1' },
						{ name: 'UTF-16LE', value: 'utf16le' },
						{ name: 'Base64', value: 'base64' },
					]
				}
			},
			{
				label: 'CSV Options',
				fieldName: 'csvOptions',
				conditionRules: {
					showBy: {
						operation: ['fromCsv'],
					},
				},
				control: {
					name: 'collection',
					dataType: 'multiOptions',
					defaultValue: {},
					placeholder: 'Add Option',
					options: [
						{
							label: 'Delimiter',
							fieldName: 'delimiter',
							description: 'Character used to separate fields',
							control: {
								name: 'input',
								dataType: 'string',
								defaultValue: ','
							}
						},
						{
							label: 'Has Header Row',
							fieldName: 'hasHeader',
							description: 'Whether the first row contains column headers',
							control: {
								name: 'checkbox',
								dataType: 'boolean',
								defaultValue: true
							}
						},
						{
							label: 'Quote Character',
							fieldName: 'quote',
							description: 'Character used to quote fields',
							control: {
								name: 'input',
								dataType: 'string',
								defaultValue: '"'
							}
						},
					],
				}
			},
			{
				label: '保留源数据',
				fieldName: 'keepSource',
				description: 'What source data to keep in the output',
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'json',
					placeholder: '选择保留数据类型',
					options: [
						{ name: '仅JSON', value: 'json' },
						{ name: '仅二进制', value: 'binary' },
						{ name: '两者都保留', value: 'both' },
						{ name: '都不保留', value: 'none' },
					]
				}
			},
		]
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		try {
			return this.handleOperation(opts);
		} catch (error: any) {
			console.error('FileExtracted执行错误:', error.message);
			return { error: error.message, success: false };
		}
	}

	/**
	 * 处理不同类型的文件提取操作
	 * @param opts 执行选项，包含操作类型和相关参数
	 * @returns 处理结果
	 * @throws {Error} 当操作类型未知时抛出错误
	 */
	private handleOperation(opts: IExecuteOptions) {
		const {
			operation = OPERATION_TYPES.FROM_JSON,
			binaryPropertyName: rawBinaryPropertyName = DEFAULT_CONFIG.BINARY_PROPERTY_NAME,
			outputProperty = DEFAULT_CONFIG.OUTPUT_PROPERTY,
			base64OutputProperty = DEFAULT_CONFIG.BASE64_OUTPUT_PROPERTY,
			encoding = DEFAULT_CONFIG.ENCODING,
			keepSource = DEFAULT_CONFIG.KEEP_SOURCE
		} = opts.inputs || {};

		// 确保binaryPropertyName不为空，使用默认值
		const binaryPropertyName: string = rawBinaryPropertyName?.trim() || DEFAULT_CONFIG.BINARY_PROPERTY_NAME;

		// 验证操作类型
		const validOperations = Object.values(OPERATION_TYPES);
		if (!validOperations.includes(operation as OperationType)) {
			throw new Error(`未知操作类型: ${operation}。支持的操作类型: ${validOperations.join(', ')}`);
		}

		// 验证输入参数
		this.validateInputs(encoding, keepSource);

		switch (operation) {
			case OPERATION_TYPES.FROM_JSON:
				return this.processJson(opts, binaryPropertyName, outputProperty, encoding, keepSource);
			case OPERATION_TYPES.FROM_TEXT:
				return this.processText(opts, binaryPropertyName, outputProperty, encoding, keepSource);
			case OPERATION_TYPES.FROM_CSV:
				return this.processCsv(opts, binaryPropertyName, outputProperty, encoding, keepSource);
			case OPERATION_TYPES.FILE_TO_BASE64:
				return this.processToBase64(opts, binaryPropertyName, base64OutputProperty, keepSource);
			default:
				throw new Error(`未知操作类型: ${operation}`);
		}
	}

	/**
	 * 核心文件内容处理方法
	 * @param data 文件数据（字符串或FileData对象）
	 * @param operation 操作类型
	 * @param outputProperty 输出属性名
	 * @param encoding 编码格式
	 * @param keepSource 源数据保留策略
	 * @param binaryPropertyName 二进制属性名
	 * @returns 处理结果
	 */
	private async processFileContent(
		data: string | FileData,
		operation: string,
		outputProperty: string,
		encoding: string,
		keepSource: string,
		binaryPropertyName: string
	): Promise<ProcessResult> {
		const isStringInput = typeof data === 'string';
		const fileBuffer = Buffer.from(isStringInput ? data : data.data || '', 'base64');

		const fileInfo = {
			fileName: isStringInput ? 'unknown' : data.fileName || 'unknown',
			mimeType: isStringInput ? 'text/plain' : data.mimeType || 'application/octet-stream',
			fileSize: isStringInput ? fileBuffer.length : data.fileSize || fileBuffer.length,
			operation
		};

		let extractedData: any;
		if (encoding === 'base64') {
			extractedData = fileBuffer;
		} else {
			extractedData = fileBuffer.toString(encoding as BufferEncoding);

			// JSON 特殊处理
			if (operation === 'fromJson') {
				try {
					extractedData = JSON.parse(extractedData);
				} catch (error) {
					throw new Error(`JSON 解析失败: ${(error as Error).message}`);
				}
			}
		}

		const result: ProcessResult = {
			[outputProperty]: extractedData,
			fileInfo,
			operation,
			success: true
		};

		// 源数据保留逻辑
		if (keepSource === 'json' || keepSource === 'both') {
			result.sourceJson = operation === 'fromJson' && encoding !== 'base64'
				? extractedData
				: fileBuffer.toString('utf8');
		}

		if (keepSource === 'binary' || keepSource === 'both') {
			result[binaryPropertyName] = isStringInput ? { data } : data;
		}

		return result;
	}

	/**
	 * 验证编码类型是否有效
	 * @param encoding 编码类型
	 * @returns 是否为有效编码
	 */
	private isValidEncoding(encoding: string): encoding is EncodingType {
		return Object.values(ENCODING_TYPES).includes(encoding as EncodingType);
	}

	/**
	 * 验证保留源数据策略是否有效
	 * @param strategy 保留策略
	 * @returns 是否为有效策略
	 */
	private isValidKeepSourceStrategy(strategy: string): strategy is KeepSourceStrategy {
		return Object.values(KEEP_SOURCE_STRATEGIES).includes(strategy as KeepSourceStrategy);
	}

	/**
	 * 验证输入参数
	 * @param encoding 编码类型
	 * @param keepSource 保留源数据策略
	 * @throws {Error} 当参数无效时抛出错误
	 */
	private validateInputs(encoding: string, keepSource: string): void {
		if (!this.isValidEncoding(encoding)) {
			const validEncodings = Object.values(ENCODING_TYPES).join(', ');
			throw new Error(`无效的编码类型: ${encoding}。支持的编码类型: ${validEncodings}`);
		}

		if (!this.isValidKeepSourceStrategy(keepSource)) {
			const validStrategies = Object.values(KEEP_SOURCE_STRATEGIES).join(', ');
			throw new Error(`无效的源数据保留策略: ${keepSource}。支持的策略: ${validStrategies}`);
		}
	}

	/**
	 * 智能查找二进制数据的方法
	 * @param inputs 输入数据对象
	 * @returns 找到的二进制数据或null
	 */
	private findBinaryDataIntelligently(inputs: any): any {
		if (!inputs || typeof inputs !== 'object') {
			return null;
		}

		// 常见的二进制数据属性名
		const commonBinaryProps = ['data', 'file', 'content', 'binary', 'buffer'];

		// 1. 直接查找常见属性
		for (const prop of commonBinaryProps) {
			if (inputs[prop] !== undefined) {
				return inputs[prop];
			}
		}

		// 2. 查找包含文件数据的嵌套结构
		const searchInObject = (obj: any, depth = 0): any => {
			if (depth > 3 || !obj || typeof obj !== 'object') return null;

			// 查找数组中的文件数据
			if (Array.isArray(obj)) {
				for (const item of obj) {
					if (item && typeof item === 'object') {
						// 检查是否包含文件相关属性
						for (const prop of commonBinaryProps) {
							if (item[prop] !== undefined) {
								return item[prop];
							}
						}
						// 递归搜索
						const found = searchInObject(item, depth + 1);
						if (found) return found;
					}
				}
			} else {
				// 在对象中搜索
				for (const [key, value] of Object.entries(obj)) {
					if (value && typeof value === 'object') {
						const found = searchInObject(value, depth + 1);
						if (found) return found;
					}
				}
			}
			return null;
		};

		return searchInObject(inputs);
	}

	/**
	 * 统一的二进制数据获取方法
	 * @param inputs 输入数据对象
	 * @param propertyPath 二进制属性路径
	 * @returns 提取的二进制数据
	 * @throws {Error} 当属性路径无效或数据不存在时抛出错误
	 */
	private getBinaryData(inputs: any, propertyPath: string): any {
		// 验证输入参数
		if (!propertyPath || typeof propertyPath !== 'string') {
			throw new Error('二进制属性名不能为空');
		}

		// 调试信息：记录输入数据结构用于问题诊断
		if (process.env.NODE_ENV === 'development') {
			console.log('FileExtracted调试:', {
				propertyPath,
				inputsType: typeof inputs,
				availableKeys: inputs ? Object.keys(inputs) : [],
				inputsStructure: inputs
			});
		}

		// 检查是否为模板字符串
		const isTemplate = propertyPath.includes('{{') && propertyPath.includes('}}');

		if (isTemplate) {
			// 对于模板字符串，尝试智能查找
			console.warn(`检测到模板字符串路径: ${propertyPath}，尝试智能查找二进制数据...`);

			const intelligentResult = this.findBinaryDataIntelligently(inputs);
			if (intelligentResult !== null) {
				console.log('智能查找成功，找到二进制数据');
				return intelligentResult;
			}

			// 如果智能查找失败，尝试解析模板路径
			const cleanPath = propertyPath
				.replace(/^{{\s*\$\.?|}}$/g, '')
				.trim();

			if (cleanPath) {
				const result = this.parsePropertyPath(inputs, cleanPath);
				if (result !== undefined) {
					return result;
				}
			}
		} else {
			// 非模板字符串，直接解析路径
			const result = this.parsePropertyPath(inputs, propertyPath);
			if (result !== undefined) {
				return result;
			}
		}

		// 所有方法都失败时，提供详细的错误信息和建议
		const availableKeys = inputs ? Object.keys(inputs).join(', ') : '无';
		const suggestion = this.findBinaryDataIntelligently(inputs) !== null
			? '建议：检测到可能的二进制数据，请尝试使用 "data" 作为属性名。'
			: '建议：请确认输入数据包含有效的文件数据。';

		throw new Error(`二进制属性 '${propertyPath}' 在输入数据中不存在。可用属性: ${availableKeys}。${suggestion}`);
	}

	/**
	 * 解析属性路径
	 * @param inputs 输入对象
	 * @param path 属性路径
	 * @returns 解析结果
	 */
	private parsePropertyPath(inputs: any, path: string): any {
		if (!path) return inputs;

		// 直接属性访问
		if (!path.includes('.') && !path.includes('[')) {
			return inputs?.[path];
		}

		// 复杂路径解析
		return path.split('.').reduce((obj, part) => {
			if (obj === null || obj === undefined) {
				return undefined;
			}

			const arrayMatch = part.match(/(\w+)\[(\d+|\*)\]/);
			if (arrayMatch) {
				const [, prop, index] = arrayMatch;
				if (!prop || !(prop in obj)) return undefined;
				const arr = obj[prop];
				if (!Array.isArray(arr)) return undefined;
				if (index === '*') return arr;
				// 确保index是字符串类型再进行解析
				const idx = parseInt(index as string, 10);
				if (isNaN(idx) || idx < 0 || idx >= arr.length) return undefined;
				return arr[idx];
			}

			if (typeof obj !== 'object' || !(part in obj)) return undefined;
			return obj[part];
		}, inputs);
	}

	// 各操作类型的处理函数
	private async processJson(
		opts: IExecuteOptions,
		binaryPropertyName: string,
		outputProperty: string,
		encoding: string,
		keepSource: string
	) {
		const data = this.getBinaryData(opts.inputs, binaryPropertyName);

		// 处理数组情况
		if (Array.isArray(data)) {
			const results = await Promise.all(
				data.map(item =>
					this.processFileContent(item, 'fromJson', outputProperty, encoding, keepSource, binaryPropertyName)
						.catch(error => ({ error: error.message, success: false }))
				)
			);

			return {
				[outputProperty]: results,
				fileCount: results.length,
				operation: 'fromJson',
				success: true
			};
		}

		return this.processFileContent(
			typeof data === 'string' ? { data } : data,
			'fromJson',
			outputProperty,
			encoding,
			keepSource,
			binaryPropertyName
		);
	}

	private async processText(
		opts: IExecuteOptions,
		binaryPropertyName: string,
		outputProperty: string,
		encoding: string,
		keepSource: string
	) {
		const data = this.getBinaryData(opts.inputs, binaryPropertyName);

		return this.processFileContent(
			data,
			'fromText',
			outputProperty,
			encoding,
			keepSource,
			binaryPropertyName
		);
	}

	private async processCsv(
		opts: IExecuteOptions,
		binaryPropertyName: string,
		outputProperty: string,
		encoding: string,
		keepSource: string
	) {
		const data = this.getBinaryData(opts.inputs, binaryPropertyName);

		const {
			delimiter = ',',
			hasHeader = true,
			quote = '"'
		} = opts.inputs?.csvOptions || {};

		const fileContent = typeof data === 'string'
			? { data }
			: data;

		const result = await this.processFileContent(
			fileContent,
			'fromCsv',
			outputProperty,
			encoding,
			keepSource,
			binaryPropertyName
		);

		// CSV 解析逻辑
		const csvString = result[outputProperty];
		const lines = csvString.split('\n').filter((line: string) => line.trim());

		if (lines.length === 0) {
			return { ...result, [outputProperty]: [] };
		}

		const parseLine = (line: string): string[] => {
			const result = [];
			let current = '';
			let inQuotes = false;

			for (const char of line) {
				if (char === quote) {
					inQuotes = !inQuotes;
				} else if (char === delimiter && !inQuotes) {
					result.push(current.trim());
					current = '';
				} else {
					current += char;
				}
			}

			result.push(current.trim());
			return result;
		};

		const headers = hasHeader
			? parseLine(lines[0])
			: parseLine(lines[0]).map((_, i) => `column_${i}`);

		const startIndex = hasHeader ? 1 : 0;
		const extractedData = lines.slice(startIndex).map((line: string) => {
			const values = parseLine(line);
			return headers.reduce((obj, header, i) => {
				obj[header] = values[i] || '';
				return obj;
			}, {} as Record<string, string>);
		});

		return {
			...result,
			[outputProperty]: extractedData,
			sourceJson: keepSource.includes('json') ? extractedData : undefined
		};
	}

	private async processToBase64(
		opts: IExecuteOptions,
		binaryPropertyName: string,
		outputProperty: string,
		keepSource: string
	) {
		const data = this.getBinaryData(opts.inputs, binaryPropertyName);

		const fileData = typeof data === 'string'
			? { data }
			: data;

		const mimeType = fileData.mimeType || 'application/octet-stream';
		const base64Data = fileData.data || '';

		const result: ProcessResult = {
			[outputProperty]: `data:${mimeType};base64,${base64Data}`,
			fileInfo: {
				fileName: fileData.fileName || 'unknown',
				mimeType,
				fileSize: fileData.fileSize || Buffer.from(base64Data, 'base64').length,
				operation: 'fileToBase64'
			},
			operation: 'fileToBase64',
			success: true
		};

		if (keepSource === 'binary' || keepSource === 'both') {
			result[binaryPropertyName] = fileData;
		}

		return result;
	}
}