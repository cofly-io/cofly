import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class Merge implements INode {
	node: INodeBasic = {
		kind: 'merge',
		name: '数据合并',
		event: "merge",
		catalog: 'flow',
		version: 1,
		description: "合并多个数据流的数据，支持多种合并模式",
		icon: 'merge.svg',
		nodeWidth: 650,
		link: {
			inputs: [NodeLink.Data, NodeLink.Data], // 支持多个输入
			outputs: [NodeLink.Data]
		}
	};

	detail: INodeDetail = {
		fields: [
			// 合并模式选择
			{
				label: '合并模式',
				fieldName: 'mode',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'append',
					validation: { required: true },
					options: [
						{
							name: '追加模式',
							value: 'append',
							description: '将所有输入的数据项依次输出',
						},
						{
							name: '字段匹配合并',
							value: 'combineByFields',
							description: '根据指定字段匹配合并数据',
						},
						{
							name: '位置合并',
							value: 'combineByPosition',
							description: '根据数据项的位置顺序合并',
						},
						{
							name: '全组合',
							value: 'combineAll',
							description: '生成所有可能的数据组合（笛卡尔积）',
						},
						{
							name: '选择分支',
							value: 'chooseBranch',
							description: '选择特定分支的数据输出',
						},
					]
				}
			},

			// 字段匹配合并配置
			{
				label: '匹配字段',
				fieldName: 'matchFields',
				conditionRules: {
					showBy: {
						mode: ['combineByFields'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: id,name (多个字段用逗号分隔)',
					validation: { required: true }
				}
			},
			{
				label: '连接类型',
				fieldName: 'joinType',
				conditionRules: {
					showBy: {
						mode: ['combineByFields'],
					},
				},
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'inner',
					options: [
						{
							name: '内连接',
							value: 'inner',
							description: '只保留匹配的数据项',
						},
						{
							name: '左连接',
							value: 'left',
							description: '保留第一个输入的所有数据，匹配第二个输入',
						},
						{
							name: '右连接',
							value: 'right',
							description: '保留第二个输入的所有数据，匹配第一个输入',
						},
						{
							name: '外连接',
							value: 'outer',
							description: '保留所有数据，匹配的合并，不匹配的单独保留',
						},
					]
				}
			},

			// 位置合并配置
			{
				label: '填充模式',
				fieldName: 'fillMode',
				conditionRules: {
					showBy: {
						mode: ['combineByPosition'],
					},
				},
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'null',
					options: [
						{
							name: '空值填充',
							value: 'null',
							description: '较短的数据用null填充',
						},
						{
							name: '重复最后值',
							value: 'repeat',
							description: '重复最后一个值进行填充',
						},
						{
							name: '跳过空值',
							value: 'skip',
							description: '跳过没有对应数据的位置',
						},
					]
				}
			},

			// 选择分支配置
			{
				label: '选择分支',
				fieldName: 'branchIndex',
				conditionRules: {
					showBy: {
						mode: ['chooseBranch'],
					},
				},
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 0,
					placeholder: '分支索引（从0开始）',
					validation: { required: true }
				}
			},

			// 输出配置
			{
				label: '输出数据来源',
				fieldName: 'outputDataFrom',
				conditionRules: {
					showBy: {
						mode: ['combineByFields'],
					},
				},
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'both',
					options: [
						{
							name: '合并数据',
							value: 'both',
							description: '输出合并后的数据',
						},
						{
							name: '仅输入1',
							value: 'input1',
							description: '只输出第一个输入的数据',
						},
						{
							name: '仅输入2',
							value: 'input2',
							description: '只输出第二个输入的数据',
						},
					]
				}
			},

			// 冲突处理
			{
				label: '字段冲突处理',
				fieldName: 'conflictResolution',
				conditionRules: {
					showBy: {
						mode: ['combineByFields', 'combineByPosition', 'combineAll'],
					},
				},
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'input2',
					options: [
						{
							name: '使用输入1的值',
							value: 'input1',
							description: '当字段名冲突时，使用第一个输入的值',
						},
						{
							name: '使用输入2的值',
							value: 'input2',
							description: '当字段名冲突时，使用第二个输入的值',
						},
						{
							name: '添加后缀',
							value: 'suffix',
							description: '为冲突字段添加_1、_2后缀',
						},
						{
							name: '合并数组',
							value: 'array',
							description: '将冲突值合并为数组',
						},
					]
				}
			},

			// 高级选项
			{
				label: '忽略大小写',
				fieldName: 'ignoreCase',
				conditionRules: {
					showBy: {
						mode: ['combineByFields'],
					},
				},
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '多重匹配处理',
				fieldName: 'multipleMatches',
				conditionRules: {
					showBy: {
						mode: ['combineByFields'],
					},
				},
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'all',
					options: [
						{
							name: '包含所有匹配',
							value: 'all',
							description: '输出所有匹配的组合',
						},
						{
							name: '仅第一个匹配',
							value: 'first',
							description: '每个数据项只输出第一个匹配',
						},
					]
				}
			},
			{
				label: '添加来源字段',
				fieldName: 'addSourceField',
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '来源字段名',
				fieldName: 'sourceFieldName',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '_source',
					placeholder: '来源字段的名称'
				}
			},
		],
	};

	async metadata(opts: IExecuteOptions): Promise<any> {
		// Merge节点通常不需要元数据查询
		return {
			success: false,
			error: '数据合并节点不支持元数据查询'
		};
	}

	async execute(opts: IExecuteOptions): Promise<any> {
		console.log('🔀 [Merge Node] 开始执行数据合并:', opts.inputs);

		try {
			const mode = opts.inputs?.mode || 'append';
			
			// 获取输入数据
			const input1 = opts.inputs?.input1 || [];
			const input2 = opts.inputs?.input2 || [];
			
			console.log('📍 [Merge Node] 输入数据:', {
				mode,
				input1Count: input1.length,
				input2Count: input2.length
			});

			let result;
			switch (mode) {
				case 'append':
					result = await this.executeAppend(input1, input2, opts.inputs);
					break;
				case 'combineByFields':
					result = await this.executeCombineByFields(input1, input2, opts.inputs);
					break;
				case 'combineByPosition':
					result = await this.executeCombineByPosition(input1, input2, opts.inputs);
					break;
				case 'combineAll':
					result = await this.executeCombineAll(input1, input2, opts.inputs);
					break;
				case 'chooseBranch':
					result = await this.executeChooseBranch(input1, input2, opts.inputs);
					break;
				default:
					throw new Error(`不支持的合并模式: ${mode}`);
			}

			console.log('✅ [Merge Node] 数据合并完成:', {
				mode,
				outputCount: result.data.length
			});

			return {
				success: true,
				data: result.data,
				mode: mode
			};

		} catch (error: any) {
			console.error('❌ [Merge Node] 执行失败:', error.message);
			return {
				success: false,
				error: `数据合并失败: ${error.message}`
			};
		}
	}

	/**
	 * 追加模式：将所有输入数据依次输出
	 */
	private async executeAppend(input1: any[], input2: any[], inputs: any): Promise<{ data: any[] }> {
		const result: any[] = [];
		const sourceFieldName = inputs.sourceFieldName || '_source';

		// 添加第一个输入的数据
		for (const item of input1) {
			const newItem = { ...item };
			if (inputs.addSourceField) {
				newItem[sourceFieldName] = 'input1';
			}
			result.push(newItem);
		}

		// 添加第二个输入的数据
		for (const item of input2) {
			const newItem = { ...item };
			if (inputs.addSourceField) {
				newItem[sourceFieldName] = 'input2';
			}
			result.push(newItem);
		}

		return { data: result };
	}

	/**
	 * 字段匹配合并模式
	 */
	private async executeCombineByFields(input1: any[], input2: any[], inputs: any): Promise<{ data: any[] }> {
		const matchFields = (inputs.matchFields || '').split(',').map((f: string) => f.trim()).filter((f: string) => f);
		const joinType = inputs.joinType || 'inner';
		const outputDataFrom = inputs.outputDataFrom || 'both';
		const conflictResolution = inputs.conflictResolution || 'input2';
		const ignoreCase = inputs.ignoreCase || false;
		const multipleMatches = inputs.multipleMatches || 'all';
		const sourceFieldName = inputs.sourceFieldName || '_source';

		if (matchFields.length === 0) {
			throw new Error('必须指定至少一个匹配字段');
		}

		const result: any[] = [];
		const matched1: Set<number> = new Set();
		const matched2: Set<number> = new Set();

		// 执行匹配
		for (let i = 0; i < input1.length; i++) {
			const item1 = input1[i];
			const matches: any[] = [];

			for (let j = 0; j < input2.length; j++) {
				const item2 = input2[j];
				
				if (this.isMatch(item1, item2, matchFields, ignoreCase)) {
					matches.push({ item: item2, index: j });
					matched2.add(j);
				}
			}

			if (matches.length > 0) {
				matched1.add(i);
				
				// 处理多重匹配
				const matchesToProcess = multipleMatches === 'first' ? [matches[0]] : matches;
				
				for (const match of matchesToProcess) {
					const mergedItem = this.mergeItems(item1, match.item, conflictResolution, outputDataFrom);
					if (inputs.addSourceField) {
						mergedItem[sourceFieldName] = 'merged';
					}
					result.push(mergedItem);
				}
			}
		}

		// 处理连接类型
		if (joinType === 'left' || joinType === 'outer') {
			// 添加未匹配的input1数据
			for (let i = 0; i < input1.length; i++) {
				if (!matched1.has(i)) {
					const item = { ...input1[i] };
					if (inputs.addSourceField) {
						item[sourceFieldName] = 'input1';
					}
					result.push(item);
				}
			}
		}

		if (joinType === 'right' || joinType === 'outer') {
			// 添加未匹配的input2数据
			for (let j = 0; j < input2.length; j++) {
				if (!matched2.has(j)) {
					const item = { ...input2[j] };
					if (inputs.addSourceField) {
						item[sourceFieldName] = 'input2';
					}
					result.push(item);
				}
			}
		}

		return { data: result };
	}

	/**
	 * 位置合并模式
	 */
	private async executeCombineByPosition(input1: any[], input2: any[], inputs: any): Promise<{ data: any[] }> {
		const fillMode = inputs.fillMode || 'null';
		const conflictResolution = inputs.conflictResolution || 'input2';
		const sourceFieldName = inputs.sourceFieldName || '_source';

		const result: any[] = [];
		const maxLength = Math.max(input1.length, input2.length);

		for (let i = 0; i < maxLength; i++) {
			const item1 = i < input1.length ? input1[i] : null;
			const item2 = i < input2.length ? input2[i] : null;

			if (fillMode === 'skip' && (!item1 || !item2)) {
				continue;
			}

			let finalItem1 = item1;
			let finalItem2 = item2;

			// 处理填充模式
			if (fillMode === 'repeat') {
				if (!finalItem1 && input1.length > 0) {
					finalItem1 = input1[input1.length - 1];
				}
				if (!finalItem2 && input2.length > 0) {
					finalItem2 = input2[input2.length - 1];
				}
			}

			const mergedItem = this.mergeItems(finalItem1 || {}, finalItem2 || {}, conflictResolution, 'both');
			if (inputs.addSourceField) {
				if (finalItem1 && finalItem2) {
					mergedItem[sourceFieldName] = 'merged';
				} else if (finalItem1) {
					mergedItem[sourceFieldName] = 'input1';
				} else if (finalItem2) {
					mergedItem[sourceFieldName] = 'input2';
				}
			}
			result.push(mergedItem);
		}

		return { data: result };
	}

	/**
	 * 全组合模式（笛卡尔积）
	 */
	private async executeCombineAll(input1: any[], input2: any[], inputs: any): Promise<{ data: any[] }> {
		const conflictResolution = inputs.conflictResolution || 'input2';
		const sourceFieldName = inputs.sourceFieldName || '_source';

		const result: any[] = [];

		for (const item1 of input1) {
			for (const item2 of input2) {
				const mergedItem = this.mergeItems(item1, item2, conflictResolution, 'both');
				if (inputs.addSourceField) {
					mergedItem[sourceFieldName] = 'merged';
				}
				result.push(mergedItem);
			}
		}

		return { data: result };
	}

	/**
	 * 选择分支模式
	 */
	private async executeChooseBranch(input1: any[], input2: any[], inputs: any): Promise<{ data: any[] }> {
		const branchIndex = inputs.branchIndex || 0;
		const sourceFieldName = inputs.sourceFieldName || '_source';

		let selectedData: any[];
		let sourceName: string;

		if (branchIndex === 0) {
			selectedData = input1;
			sourceName = 'input1';
		} else if (branchIndex === 1) {
			selectedData = input2;
			sourceName = 'input2';
		} else {
			throw new Error(`无效的分支索引: ${branchIndex}，只支持0或1`);
		}

		const result = selectedData.map(item => {
			const newItem = { ...item };
			if (inputs.addSourceField) {
				newItem[sourceFieldName] = sourceName;
			}
			return newItem;
		});

		return { data: result };
	}

	/**
	 * 检查两个数据项是否匹配
	 */
	private isMatch(item1: any, item2: any, matchFields: string[], ignoreCase: boolean): boolean {
		for (const field of matchFields) {
			let value1 = this.getNestedValue(item1, field);
			let value2 = this.getNestedValue(item2, field);

			if (ignoreCase && typeof value1 === 'string' && typeof value2 === 'string') {
				value1 = value1.toLowerCase();
				value2 = value2.toLowerCase();
			}

			if (value1 !== value2) {
				return false;
			}
		}
		return true;
	}

	/**
	 * 合并两个数据项
	 */
	private mergeItems(item1: any, item2: any, conflictResolution: string, outputDataFrom: string): any {
		if (outputDataFrom === 'input1') {
			return { ...item1 };
		}
		if (outputDataFrom === 'input2') {
			return { ...item2 };
		}

		// 合并两个对象
		const result: any = {};

		// 先添加item1的字段
		for (const [key, value] of Object.entries(item1 || {})) {
			result[key] = value;
		}

		// 再添加item2的字段，处理冲突
		for (const [key, value] of Object.entries(item2 || {})) {
			if (key in result) {
				// 处理字段冲突
				switch (conflictResolution) {
					case 'input1':
						// 保持item1的值，不覆盖
						break;
					case 'input2':
						// 使用item2的值覆盖
						result[key] = value;
						break;
					case 'suffix':
						// 添加后缀
						result[`${key}_1`] = result[key];
						result[`${key}_2`] = value;
						delete result[key];
						break;
					case 'array':
						// 合并为数组
						const existingValue = result[key];
						if (Array.isArray(existingValue)) {
							result[key] = [...existingValue, value];
						} else {
							result[key] = [existingValue, value];
						}
						break;
					default:
						result[key] = value;
				}
			} else {
				result[key] = value;
			}
		}

		return result;
	}

	/**
	 * 获取嵌套对象的值
	 */
	private getNestedValue(obj: any, path: string): any {
		return path.split('.').reduce((current, key) => {
			return current && current[key] !== undefined ? current[key] : undefined;
		}, obj);
	}
}