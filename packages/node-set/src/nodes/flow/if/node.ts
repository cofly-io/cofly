import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class If implements INode {
	node: INodeBasic = {
		kind: 'if',
		name: '条件判断',
		event: "if",
		catalog: 'flow',
		version: 1,
		description: "根据条件判断将数据路由到不同的分支（真/假）",
		icon: 'if.svg',
		nodeWidth: 600,
		link: {
			inputs: [NodeLink.Data],
			outputs: [NodeLink.Data, NodeLink.Data] // 两个输出：true和false
		}
	};

	detail: INodeDetail = {
		fields: [
			// 条件组合方式
			{
				label: '条件组合',
				fieldName: 'combineOperation',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'all',
					validation: { required: true },
					options: [
						{
							name: '全部满足(AND)',
							value: 'all',
							description: '所有条件都满足时才为真',
						},
						{
							name: '任一满足(OR)',
							value: 'any',
							description: '任意一个条件满足时就为真',
						},
					]
				}
			},

			// 条件列表
			{
				label: '条件列表',
				fieldName: 'conditions',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '请添加至少一个条件',
					validation: { required: true }
				}
			},

			// 字符串条件
			{
				label: '字符串条件',
				fieldName: 'stringConditions',
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '值1|操作|值2\n例如: {{$json.name}}|等于|张三\n{{$json.status}}|包含|active'
				}
			},

			// 数字条件
			{
				label: '数字条件',
				fieldName: 'numberConditions',
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '值1|操作|值2\n例如: {{$json.age}}|大于|18\n{{$json.score}}|小于等于|100'
				}
			},

			// 布尔条件
			{
				label: '布尔条件',
				fieldName: 'booleanConditions',
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '值1|操作|值2\n例如: {{$json.isActive}}|等于|true\n{{$json.isDeleted}}|不等于|true'
				}
			},

			// 日期时间条件
			{
				label: '日期时间条件',
				fieldName: 'dateTimeConditions',
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '值1|操作|值2\n例如: {{$json.createTime}}|晚于|2024-01-01\n{{$json.updateTime}}|早于|{{$json.deadline}}'
				}
			},

			// 自定义表达式
			{
				label: '自定义表达式',
				fieldName: 'customExpression',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: {{$json.age}} > 18 && {{$json.status}} === "active"'
				}
			},

			// 高级选项
			{
				label: '忽略大小写',
				fieldName: 'ignoreCase',
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: true
				}
			},
			{
				label: '宽松类型验证',
				fieldName: 'looseTypeValidation',
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '出错时继续',
				fieldName: 'continueOnFail',
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		console.log('🔀 [If Node] 开始执行条件判断:', opts.inputs);

		try {
			// 获取输入数据，如果没有则使用空对象数组
			const inputData = opts.inputs?.data || [{}];
			const trueItems: any[] = [];
			const falseItems: any[] = [];

			// 处理每个输入项
			for (let itemIndex = 0; itemIndex < inputData.length; itemIndex++) {
				const item = inputData[itemIndex];

				try {
					const conditionResult = await this.evaluateConditions(item, opts.inputs, itemIndex);

					if (conditionResult) {
						trueItems.push(item);
					} else {
						falseItems.push(item);
					}
				} catch (error: any) {
					console.error(`❌ [If Node] 条件评估失败 (项目 ${itemIndex}):`, error.message);

					if (opts.inputs?.continueOnFail) {
						// 出错时继续，将项目放入false分支
						falseItems.push(item);
					} else {
						return {
							success: false,
							error: `条件评估失败: ${error.message}`,
							itemIndex
						};
					}
				}
			}

			console.log('✅ [If Node] 条件判断完成:', {
				totalItems: inputData.length,
				trueItems: trueItems.length,
				falseItems: falseItems.length
			});

			return {
				success: true,
				outputs: [
					{
						data: trueItems,
						branch: 'true'
					},
					{
						data: falseItems,
						branch: 'false'
					}
				]
			};

		} catch (error: any) {
			console.error('❌ [If Node] 执行失败:', error.message);
			return {
				success: false,
				error: `条件判断执行失败: ${error.message}`
			};
		}
	}

	/**
	 * 评估所有条件
	 */
	private async evaluateConditions(item: any, inputs: any, itemIndex: number): Promise<boolean> {
		const combineOperation = inputs.combineOperation || 'all';
		const results: boolean[] = [];

		// 评估字符串条件
		if (inputs.stringConditions) {
			const stringResults = this.evaluateStringConditions(item, inputs.stringConditions, inputs);
			results.push(...stringResults);
		}

		// 评估数字条件
		if (inputs.numberConditions) {
			const numberResults = this.evaluateNumberConditions(item, inputs.numberConditions, inputs);
			results.push(...numberResults);
		}

		// 评估布尔条件
		if (inputs.booleanConditions) {
			const booleanResults = this.evaluateBooleanConditions(item, inputs.booleanConditions, inputs);
			results.push(...booleanResults);
		}

		// 评估日期时间条件
		if (inputs.dateTimeConditions) {
			const dateTimeResults = this.evaluateDateTimeConditions(item, inputs.dateTimeConditions, inputs);
			results.push(...dateTimeResults);
		}

		// 评估自定义表达式
		if (inputs.customExpression) {
			const expressionResult = this.evaluateCustomExpression(item, inputs.customExpression, inputs);
			results.push(expressionResult);
		}

		// 如果没有任何条件，返回true
		if (results.length === 0) {
			return true;
		}

		// 根据组合方式返回结果
		if (combineOperation === 'all') {
			return results.every(result => result === true);
		} else {
			return results.some(result => result === true);
		}
	}

	/**
	 * 评估字符串条件
	 */
	private evaluateStringConditions(item: any, conditionsStr: string, inputs: any): boolean[] {
		const results: boolean[] = [];
		const lines = conditionsStr.split('\n').filter(line => line.trim());

		for (const line of lines) {
			const parts = line.split('|');
			if (parts.length >= 3) {
				const value1 = this.resolveValue(parts[0]?.trim() || '', item);
				const operation = parts[1]?.trim() || '';
				const value2 = this.resolveValue(parts[2]?.trim() || '', item);

				const result = this.compareStrings(value1, operation, value2, inputs.ignoreCase);
				results.push(result);
			}
		}

		return results;
	}

	/**
	 * 评估数字条件
	 */
	private evaluateNumberConditions(item: any, conditionsStr: string, inputs: any): boolean[] {
		const results: boolean[] = [];
		const lines = conditionsStr.split('\n').filter(line => line.trim());

		for (const line of lines) {
			const parts = line.split('|');
			if (parts.length >= 3) {
				const value1 = this.resolveValue(parts[0]?.trim() || '', item);
				const operation = parts[1]?.trim() || '';
				const value2 = this.resolveValue(parts[2]?.trim() || '', item);

				const result = this.compareNumbers(value1, operation, value2);
				results.push(result);
			}
		}

		return results;
	}

	/**
	 * 评估布尔条件
	 */
	private evaluateBooleanConditions(item: any, conditionsStr: string, inputs: any): boolean[] {
		const results: boolean[] = [];
		const lines = conditionsStr.split('\n').filter(line => line.trim());

		for (const line of lines) {
			const parts = line.split('|');
			if (parts.length >= 3) {
				const value1 = this.resolveValue(parts[0]?.trim() || '', item);
				const operation = parts[1]?.trim() || '';
				const value2 = this.resolveValue(parts[2]?.trim() || '', item);

				const result = this.compareBooleans(value1, operation, value2);
				results.push(result);
			}
		}

		return results;
	}

	/**
	 * 评估日期时间条件
	 */
	private evaluateDateTimeConditions(item: any, conditionsStr: string, inputs: any): boolean[] {
		const results: boolean[] = [];
		const lines = conditionsStr.split('\n').filter(line => line.trim());

		for (const line of lines) {
			const parts = line.split('|');
			if (parts.length >= 3) {
				const value1 = this.resolveValue(parts[0]?.trim() || '', item);
				const operation = parts[1]?.trim() || '';
				const value2 = this.resolveValue(parts[2]?.trim() || '', item);

				const result = this.compareDateTimes(value1, operation, value2);
				results.push(result);
			}
		}

		return results;
	}

	/**
	 * 评估自定义表达式
	 */
	private evaluateCustomExpression(item: any, expression: string, inputs: any): boolean {
		try {
			// 简单的表达式替换（实际项目中可能需要更复杂的表达式引擎）
			let processedExpression = expression;

			// 替换 {{$json.xxx}} 格式的变量
			processedExpression = processedExpression.replace(/\{\{\$json\.([^}]+)\}\}/g, (match, path) => {
				const value = this.getNestedValue(item, path);
				return JSON.stringify(value);
			});

			// 使用Function构造器安全地评估表达式
			const func = new Function('return ' + processedExpression);
			return Boolean(func());
		} catch (error) {
			console.warn('自定义表达式评估失败:', expression, error);
			return false;
		}
	}

	/**
	 * 解析值（支持变量替换）
	 */
	private resolveValue(valueStr: string, item: any): any {
		// 如果是变量格式 {{$json.xxx}}
		if (valueStr.startsWith('{{$json.') && valueStr.endsWith('}}')) {
			const path = valueStr.slice(8, -2); // 移除 {{$json. 和 }}
			return this.getNestedValue(item, path);
		}

		// 尝试解析为数字
		const numValue = Number(valueStr);
		if (!isNaN(numValue)) {
			return numValue;
		}

		// 尝试解析为布尔值
		if (valueStr.toLowerCase() === 'true') return true;
		if (valueStr.toLowerCase() === 'false') return false;

		// 返回字符串
		return valueStr;
	}

	/**
	 * 获取嵌套对象的值
	 */
	private getNestedValue(obj: any, path: string): any {
		return path.split('.').reduce((current, key) => {
			return current && current[key] !== undefined ? current[key] : undefined;
		}, obj);
	}

	/**
	 * 字符串比较
	 */
	private compareStrings(value1: any, operation: string, value2: any, ignoreCase: boolean = true): boolean {
		const str1 = String(value1 || '');
		const str2 = String(value2 || '');

		const compareStr1 = ignoreCase ? str1.toLowerCase() : str1;
		const compareStr2 = ignoreCase ? str2.toLowerCase() : str2;

		switch (operation) {
			case '等于':
			case 'equals':
				return compareStr1 === compareStr2;
			case '不等于':
			case 'notEquals':
				return compareStr1 !== compareStr2;
			case '包含':
			case 'contains':
				return compareStr1.includes(compareStr2);
			case '不包含':
			case 'notContains':
				return !compareStr1.includes(compareStr2);
			case '开始于':
			case 'startsWith':
				return compareStr1.startsWith(compareStr2);
			case '结束于':
			case 'endsWith':
				return compareStr1.endsWith(compareStr2);
			case '为空':
			case 'isEmpty':
				return str1 === '';
			case '不为空':
			case 'isNotEmpty':
				return str1 !== '';
			case '正则匹配':
			case 'regex':
				try {
					const regex = new RegExp(str2, ignoreCase ? 'i' : '');
					return regex.test(str1);
				} catch {
					return false;
				}
			default:
				return false;
		}
	}

	/**
	 * 数字比较
	 */
	private compareNumbers(value1: any, operation: string, value2: any): boolean {
		const num1 = Number(value1);
		const num2 = Number(value2);

		if (isNaN(num1) || isNaN(num2)) {
			return false;
		}

		switch (operation) {
			case '等于':
			case 'equals':
				return num1 === num2;
			case '不等于':
			case 'notEquals':
				return num1 !== num2;
			case '大于':
			case 'greater':
				return num1 > num2;
			case '大于等于':
			case 'greaterOrEqual':
				return num1 >= num2;
			case '小于':
			case 'less':
				return num1 < num2;
			case '小于等于':
			case 'lessOrEqual':
				return num1 <= num2;
			default:
				return false;
		}
	}

	/**
	 * 布尔值比较
	 */
	private compareBooleans(value1: any, operation: string, value2: any): boolean {
		const bool1 = Boolean(value1);
		const bool2 = Boolean(value2);

		switch (operation) {
			case '等于':
			case 'equals':
				return bool1 === bool2;
			case '不等于':
			case 'notEquals':
				return bool1 !== bool2;
			default:
				return false;
		}
	}

	/**
	 * 日期时间比较
	 */
	private compareDateTimes(value1: any, operation: string, value2: any): boolean {
		const date1 = new Date(value1);
		const date2 = new Date(value2);

		if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
			return false;
		}

		switch (operation) {
			case '等于':
			case 'equals':
				return date1.getTime() === date2.getTime();
			case '不等于':
			case 'notEquals':
				return date1.getTime() !== date2.getTime();
			case '晚于':
			case 'after':
				return date1.getTime() > date2.getTime();
			case '早于':
			case 'before':
				return date1.getTime() < date2.getTime();
			case '晚于等于':
			case 'afterOrEqual':
				return date1.getTime() >= date2.getTime();
			case '早于等于':
			case 'beforeOrEqual':
				return date1.getTime() <= date2.getTime();
			default:
				return false;
		}
	}
}