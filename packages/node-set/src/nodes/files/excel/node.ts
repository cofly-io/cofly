import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

export class ExcelNode implements INode {
	node: INodeBasic = {
		kind: 'excel',
		name: 'Excel操作',
		event: "excel",
		catalog: 'files',
		version: 1,
		description: "读取或写入Excel文件",
		icon: 'excel.svg',
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
							name: '读取Excel',
							value: 'read',
							description: '从Excel文件读取数据',
						},
						{
							name: '写入Excel',
							value: 'write',
							description: '将数据写入Excel文件',
						},
					],
				}
			},

			// 读取Excel相关字段
			{
				label: 'Excel文件路径',
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
					placeholder: '例如: /data/example.xlsx',
					validation: { required: true }
				}
			},
			{
				label: '工作表名称',
				fieldName: 'sheetName',
				conditionRules: {
					showBy: {
						operation: ['read'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: Sheet1 (留空则读取第一个工作表)'
				}
			},
			{
				label: '包含表头',
				fieldName: 'withHeader',
				conditionRules: {
					showBy: {
						operation: ['read'],
					},
				},
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},

			// 写入Excel相关字段
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
					placeholder: '例如: /data/output.xlsx',
					validation: { required: true }
				}
			},
			{
				label: '输入数据',
				fieldName: 'inputDataField',
				conditionRules: {
					showBy: {
						operation: ['write'],
					},
				},
				control: {
					name: 'jsoncode',
					dataType: 'string',
					defaultValue: '[{"姓名": "张三", "性别": "男"}]',
					placeholder: '指定表头：[{"姓名": "张三", "性别": "男"}]\n非指定表头：[["张三","男"],["李丽","女"]]'
				}
			},
			{
				label: '工作表名称',
				fieldName: 'outputSheetName',
				conditionRules: {
					showBy: {
						operation: ['write'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'Sheet1',
					placeholder: '例如: Sheet1'
				}
			},
			{
				label: '追加数据',
				fieldName: 'appendData',
				conditionRules: {
					showBy: {
						operation: ['write'],
					},
				},
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const operation = opts.inputs?.operation;
		
		try {
			console.log('🚀 [Excel Node] Starting execution:', { operation, inputs: opts.inputs });
			
			if (operation === 'read') {
				return await this.executeRead(opts);
			} else if (operation === 'write') {
				return await this.executeWrite(opts);
			} else {
				throw new Error(`未知操作类型: ${operation}`);
			}
		} catch (error: any) {
			console.error('❌ [Excel Node] Execution failed:', error.message);
			console.error('📊 [Excel Node] Error stack:', error.stack);
			return {
				error: error.message,
				success: false
			};
		}
	}

	private async executeRead(opts: IExecuteOptions): Promise<any> {
		const filePath = opts.inputs?.filePath;
		const sheetName = opts.inputs?.sheetName;
		const withHeader = opts.inputs?.withHeader || false; // 默认不包含表头
				
		if (!filePath) {
			const errorMsg = '文件路径不能为空';
			console.error('❌ [Excel Node] File path is empty');
			throw new Error(errorMsg);
		}

		// 处理文件路径，确保兼容Windows和Unix系统
		const normalizedPath = this.normalizePath(filePath);
		
		
		// Check both original and normalized paths
		const originalExists = fs.existsSync(filePath);
		const normalizedExists = fs.existsSync(normalizedPath);
		
		
		if (!originalExists && !normalizedExists) {
			const errorMessage = `文件不存在: ${normalizedPath}`;
			throw new Error(errorMessage);
		}
		
		// Use the path that exists
		const actualPath = normalizedExists ? normalizedPath : filePath;

		try {
			
			// Additional file info logging
			try {
				const stats = fs.statSync(actualPath);
			} catch (statError: any) {
				console.warn('⚠️ [Excel Node] Could not get file stats:', statError.message);
			}
			
			// Read file content first, then parse with xlsx library
			const fileBuffer = fs.readFileSync(actualPath);
			
			// Parse the buffer with xlsx library
			const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
			
			// 获取工作表名称
			const targetSheetName = sheetName || workbook.SheetNames[0];
			
			if (!workbook.SheetNames.includes(targetSheetName)) {
				const errorMsg = `工作表 "${targetSheetName}" 不存在`;
				throw new Error(errorMsg);
			}
			
			// 读取工作表数据
			const worksheet = workbook.Sheets[targetSheetName];
			if (!worksheet) {
				const errorMsg = `无法读取工作表 "${targetSheetName}"`;
				console.error('❌ [Excel Node] Worksheet is null or undefined');
				throw new Error(errorMsg);
			}
			
			
			// 根据是否包含表头来决定返回格式
			let data: any[];
			if (withHeader) {
				// 包含表头，返回对象数组
				const rawJsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
				
				// 处理合并单元格的情况
				data = this.processMergedCellsData(rawJsonData);
			} else {
				// 不包含表头，返回数组
				data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
			}
			
			// 返回结果
			const result =  data;
			// const result = {
			// 	data: data,
			// 	sheetName: targetSheetName,
			// 	filePath: actualPath,
			// 	success: true
			// };
			
			return result;
		} catch (error: any) {
			throw new Error(`读取Excel文件失败: ${error.message}`);
		}
	}

	private async executeWrite(opts: IExecuteOptions): Promise<any> {
		const outputFilePath = opts.inputs?.outputFilePath;
		const inputDataField = opts.inputs?.inputDataField; // This is the actual JSON data, not a field name
		const outputSheetName = opts.inputs?.outputSheetName || 'Sheet1';
		const includeHeader = opts.inputs?.includeHeader !== false; // 默认为true
		const appendData = opts.inputs?.appendData || false; // 默认不追加
		
		if (!outputFilePath) {
			const errorMsg = '输出文件路径不能为空';
			console.error('❌ [Excel Node] Output file path is empty');
			throw new Error(errorMsg);
		}

		// 获取要写入的数据 (直接使用inputDataField作为数据)
		const data = inputDataField;
		
		if (data === undefined || data === null) {
			const errorMsg = '输入数据不能为空';
			console.error('❌ [Excel Node] Input data is empty');
			throw new Error(errorMsg);
		}
		
		// 解析JSON数据
		let parsedData: any;
		try {
			if (typeof data === 'string') {
				parsedData = JSON.parse(data);
			} else {
				parsedData = data;
			}
		} catch (parseError: any) {
			console.error('❌ [Excel Node] Failed to parse JSON data:', parseError.message);
			throw new Error(`JSON数据解析失败: ${parseError.message}`);
		}

		// 处理文件路径，确保兼容Windows和Unix系统
		const normalizedPath = this.normalizePath(outputFilePath);
		
		// 确保目录存在
		const dir = path.dirname(normalizedPath);
		
		try {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
			
			// Check if directory is writable
			try {
				fs.accessSync(dir, fs.constants.W_OK);
			} catch (accessError: any) {
				throw new Error(`目录无写入权限: ${dir}`);
			}
		} catch (dirError: any) {
			console.error('❌ [Excel Node] Failed to create/access directory:', dirError.message);
			throw new Error(`无法创建或访问目录: ${dirError.message}`);
		}

		try {
			let workbook;
			
			// 检查是否需要追加数据且文件已存在
			if (appendData && fs.existsSync(normalizedPath)) {
				try {
					const fileBuffer = fs.readFileSync(normalizedPath);
					workbook = XLSX.read(fileBuffer, { type: 'buffer' });
				} catch (readError: any) {
					console.error('❌ [Excel Node] Failed to read existing file:', readError.message);
					throw new Error(`无法读取现有文件: ${readError.message}`);
				}
			} else {
				workbook = XLSX.utils.book_new();
			}
			
			// 转换数据为工作表
			let worksheet;
			
			// Handle different data types
			if (Array.isArray(parsedData)) {
				// 如果数据是数组，直接转换
				if (parsedData.length > 0 && typeof parsedData[0] === 'object' && parsedData[0] !== null) {
					// 对象数组，使用json_to_sheet
					worksheet = XLSX.utils.json_to_sheet(parsedData, { 
						skipHeader: !includeHeader 
					});
				} else {
					// 简单数组，使用aoa_to_sheet
					worksheet = XLSX.utils.aoa_to_sheet(parsedData);
				}
			} else if (typeof parsedData === 'object' && parsedData !== null) {
				// 如果数据是对象，转换为单行对象数组
				worksheet = XLSX.utils.json_to_sheet([parsedData], { 
					skipHeader: !includeHeader 
				});
			} else {
				// 其他类型数据，包装成数组
				worksheet = XLSX.utils.aoa_to_sheet([[parsedData]]);
			}
			
			// 处理工作表名称
			let finalSheetName = outputSheetName;
			if (appendData && workbook.SheetNames.includes(outputSheetName)) {
				// 如果追加模式且工作表已存在，我们需要合并数据
				const existingSheet = workbook.Sheets[outputSheetName];
				
				// 获取现有数据
				const existingData = existingSheet ? XLSX.utils.sheet_to_json(existingSheet, { header: 1 }) : [];
				
				// 获取新数据
				const newData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
				
				// 合并数据（跳过表头）
				const mergedData: any[] = [...existingData];
				const startIndex = includeHeader && existingData.length > 0 ? 1 : 0;
				for (let i = startIndex; i < newData.length; i++) {
					mergedData.push(newData[i]);
				}
				
				
				// 创建新的工作表
				worksheet = XLSX.utils.aoa_to_sheet(mergedData as any[][]);
				finalSheetName = outputSheetName;
			}
			
			// 添加或更新工作表到工作簿
			if (workbook.SheetNames.includes(finalSheetName)) {
				workbook.Sheets[finalSheetName] = worksheet;
			} else {
				XLSX.utils.book_append_sheet(workbook, worksheet, finalSheetName);
			}
			
			
			// Check if the path is valid
			if (!normalizedPath || normalizedPath.length === 0) {
				throw new Error('文件路径无效');
			}
			
			// Try to write the file
			try {
				XLSX.writeFile(workbook, normalizedPath);
			} catch (writeError: any) {
				
				// Alternative method: Write as buffer
				try {
					const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
					fs.writeFileSync(normalizedPath, buffer);
				} catch (bufferError: any) {
					
					// Additional debugging info
					try {
						const dir = path.dirname(normalizedPath);
						if (fs.existsSync(dir)) {
							try {
								fs.accessSync(dir, fs.constants.W_OK);
							} catch (accessError) {
								console.error('❌ [Excel Node] Directory access denied:', accessError);
							}
						}
					} catch (dirCheckError: any) {
						console.error('❌ [Excel Node] Directory check failed:', dirCheckError.message);
					}
					
					throw new Error(`写入Excel文件失败: ${bufferError.message}`);
				}
			}

			// 获取文件信息
			const stats = fs.statSync(normalizedPath);
			
			const result = {
				filePath: normalizedPath,
				fileSize: stats.size,
				sheetName: finalSheetName,
				//success: true,
				message: `Excel文件${appendData ? '追加' : '写入'}成功`
			};
			
			return result;
		} catch (error: any) {
			console.error('💥 [Excel Node] Failed to write Excel file:', error.message);
			console.error('📋 [Excel Node] Error stack:', error.stack);
			
			// Provide more detailed error information
			const errorDetails = {
				originalError: error.message,
				filePath: normalizedPath,
				timestamp: new Date().toISOString(),
				nodeJsVersion: process.version,
				platform: process.platform
			};
			
			console.error('🔍 [Excel Node] Detailed error info:', JSON.stringify(errorDetails, null, 2));
			throw new Error(`写入Excel文件失败: ${error.message}`);
		}
	}
	
	/**
	 * 标准化文件路径，处理不同操作系统的路径分隔符
	 * @param filePath 原始文件路径
	 * @returns 标准化后的文件路径
	 */
	private normalizePath(filePath: string): string {
		// Convert all backslashes to forward slashes for consistency
		let normalized = filePath.replace(/\\/g, '/');
		
		// Handle Windows drive letters (e.g., C:/path/to/file)
		if (/^[a-zA-Z]:\//.test(normalized)) {
			// Ensure drive letter is uppercase
			const driveLetter = normalized.charAt(0).toUpperCase();
			normalized = driveLetter + ':' + normalized.substring(2);
		}
		
		// Decode URI components to handle Chinese characters properly
		try {
			normalized = decodeURIComponent(normalized);
		} catch (decodeError: any) {
			console.warn('⚠️ [Excel Node] Failed to decode URI, using original path:', decodeError.message);
		}
		
		return normalized;
	}

	/**
	 * 处理合并单元格的数据，填充空值
	 * @param rawData 原始数据数组
	 * @returns 处理后的数据数组
	 */
	private processMergedCellsData(rawData: any[]): any[] {
		if (!rawData || rawData.length === 0) {
			return [];
		}
		
		// 创建处理后的数据副本
		const processedData = [...rawData];
		
		// 遍历每一列，处理合并单元格的情况
		for (let colIndex = 0; colIndex < processedData[0].length; colIndex++) {
			let lastValue = null;
			
			// 遍历每一行
			for (let rowIndex = 0; rowIndex < processedData.length; rowIndex++) {
				const cellValue = processedData[rowIndex][colIndex];
				
				// 如果当前单元格为空但之前有值，则使用之前的值填充
				if (cellValue === null || cellValue === undefined || cellValue === '') {
					if (lastValue !== null && lastValue !== undefined) {
						processedData[rowIndex][colIndex] = lastValue;
					}
				} else {
					// 更新最后的值
					lastValue = cellValue;
				}
			}
		}
		
		// 如果第一行是表头，将其作为对象的键
		if (processedData.length > 1) {
			const headers = processedData[0];
			const result = [];
			
			// 从第二行开始处理数据行
			for (let i = 1; i < processedData.length; i++) {
				const row = processedData[i];
				const obj: any = {};
				
				// 为每个单元格创建键值对
				for (let j = 0; j < headers.length && j < row.length; j++) {
					const key = headers[j];
					const value = row[j];
					obj[key] = value;
				}
				
				result.push(obj);
			}
			return result;
		}
		return processedData;
	}
}