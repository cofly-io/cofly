import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';

export class Switch implements INode {
	node: INodeBasic = {
		kind: 'switch',
		name: '条件分支',
		event: 'switch',
		catalog: 'flow',
		version: 1,
		description: '根据条件表达式或规则将数据路由到不同的输出分支',
		icon: 'switch.svg',
		nodeWidth: 500
	};

	detail: INodeDetail = {
		fields: [
			{
				displayName: '模式',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: '表达式',
						value: 'expression',
						description: '使用JavaScript表达式进行条件判断',
					},
					{
						name: '规则',
						value: 'rules',
						description: '使用预定义规则进行条件判断',
					}
				],
				default: 'expression',
				placeholder: '选择判断模式',
				controlType: 'selectwithdesc'
			},
			{
				displayName: '表达式',
				name: 'expression',
				type: 'string',
				default: '',
				required: true,
				placeholder: '例如: $input.age > 18 ? 0 : 1',
				controlType: 'textarea',
				displayOptions: {
					showBy: {
						mode: ['expression']
					}
				}
			},
			{
				displayName: '规则配置',
				name: 'rules',
				type: 'string',
				default: '[]',
				required: true,
				placeholder: '配置判断规则的JSON数组',
				controlType: 'textarea',
				displayOptions: {
					showBy: {
						mode: ['rules']
					}
				}
			},
			{
				displayName: '默认输出',
				name: 'defaultOutput',
				type: 'number',
				default: 0,
				placeholder: '当所有条件都不满足时的默认输出分支（0-3）',
				controlType: 'input'
			},
			{
				displayName: '输出分支数量',
				name: 'outputCount',
				type: 'number',
				default: 2,
				placeholder: '设置输出分支的数量（2-4）',
				controlType: 'input'
			},
			{
				displayName: '分支0名称',
				name: 'branch0Name',
				type: 'string',
				default: '分支0',
				placeholder: '第一个输出分支的名称',
				controlType: 'input'
			},
			{
				displayName: '分支1名称',
				name: 'branch1Name',
				type: 'string',
				default: '分支1',
				placeholder: '第二个输出分支的名称',
				controlType: 'input'
			},
			{
				displayName: '分支2名称',
				name: 'branch2Name',
				type: 'string',
				default: '分支2',
				placeholder: '第三个输出分支的名称',
				controlType: 'input',
				displayOptions: {
					showBy: {
						outputCount: [3, 4]
					}
				}
			},
			{
				displayName: '分支3名称',
				name: 'branch3Name',
				type: 'string',
				default: '分支3',
				placeholder: '第四个输出分支的名称',
				controlType: 'input',
				displayOptions: {
					showBy: {
						outputCount: [4]
					}
				}
			}
		]
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const mode = opts.inputs?.mode || 'expression';

		try {
			const inputData = opts.state?.get('$input') || {};
			const outputCount = Math.min(Math.max(parseInt(opts.inputs?.outputCount) || 2, 2), 4);
			const defaultOutput = Math.min(Math.max(parseInt(opts.inputs?.defaultOutput) || 0, 0), outputCount - 1);

			let targetBranch: number;

			if (mode === 'expression') {
				targetBranch = await this.evaluateExpression(opts.inputs?.expression, inputData, outputCount, defaultOutput);
			} else {
				targetBranch = await this.evaluateRules(opts.inputs?.rules, inputData, outputCount, defaultOutput);
			}

			// 创建输出结果
			const outputs: any[] = new Array(outputCount).fill(null);
			outputs[targetBranch] = {
				...inputData,
				_switchBranch: targetBranch,
				_switchBranchName: this.getBranchName(targetBranch, opts.inputs),
				_switchMode: mode,
				success: true,
				timestamp: new Date().toISOString()
			};

			return {
				outputs,
				selectedBranch: targetBranch,
				branchName: this.getBranchName(targetBranch, opts.inputs),
				mode,
				success: true
			};

		} catch (error: any) {
			console.error('❌ [Switch Node] 执行错误:', error.message);
			
			// 错误时输出到默认分支
			const outputCount = Math.min(Math.max(parseInt(opts.inputs?.outputCount) || 2, 2), 4);
			const defaultOutput = Math.min(Math.max(parseInt(opts.inputs?.defaultOutput) || 0, 0), outputCount - 1);
			const outputs: any[] = new Array(outputCount).fill(null);
			
			outputs[defaultOutput] = {
				error: error.message,
				success: false,
				mode,
				_switchBranch: defaultOutput,
				_switchBranchName: this.getBranchName(defaultOutput, opts.inputs)
			};

			return {
				outputs,
				selectedBranch: defaultOutput,
				error: error.message,
				success: false
			};
		}
	}

	private async evaluateExpression(expression: string, inputData: any, outputCount: number, defaultOutput: number): Promise<number> {
		if (!expression || !expression.trim()) {
			return defaultOutput;
		}

		try {
			// 创建安全的执行上下文
			const context = this.createExecutionContext(inputData);
			
			// 创建安全函数
			const func = this.createSafeFunction(expression);
			const result = await func(context);

			// 处理返回值
			if (typeof result === 'number') {
				return Math.min(Math.max(Math.floor(result), 0), outputCount - 1);
			} else if (typeof result === 'boolean') {
				return result ? 0 : 1;
			} else {
				return defaultOutput;
			}

		} catch (error) {
			console.error('表达式执行错误:', error);
			return defaultOutput;
		}
	}

	private async evaluateRules(rulesStr: string, inputData: any, outputCount: number, defaultOutput: number): Promise<number> {
		if (!rulesStr || !rulesStr.trim()) {
			return defaultOutput;
		}

		try {
			const rules = JSON.parse(rulesStr);
			if (!Array.isArray(rules)) {
				throw new Error('规则必须是数组格式');
			}

			for (let i = 0; i < rules.length; i++) {
				const rule = rules[i];
				if (this.evaluateRule(rule, inputData)) {
					const branch = typeof rule.output === 'number' ? rule.output : i;
					return Math.min(Math.max(branch, 0), outputCount - 1);
				}
			}

			return defaultOutput;

		} catch (error) {
			console.error('规则解析错误:', error);
			return defaultOutput;
		}
	}

	private evaluateRule(rule: any, inputData: any): boolean {
		if (!rule || typeof rule !== 'object') {
			return false;
		}

		const { field, operator, value } = rule;
		const fieldValue = this.getFieldValue(inputData, field);

		switch (operator) {
			case '==':
			case 'equals':
				return fieldValue == value;
			case '===':
			case 'strictEquals':
				return fieldValue === value;
			case '!=':
			case 'notEquals':
				return fieldValue != value;
			case '!==':
			case 'strictNotEquals':
				return fieldValue !== value;
			case '>':
			case 'greaterThan':
				return Number(fieldValue) > Number(value);
			case '>=':
			case 'greaterThanOrEqual':
				return Number(fieldValue) >= Number(value);
			case '<':
			case 'lessThan':
				return Number(fieldValue) < Number(value);
			case '<=':
			case 'lessThanOrEqual':
				return Number(fieldValue) <= Number(value);
			case 'contains':
				return String(fieldValue).includes(String(value));
			case 'startsWith':
				return String(fieldValue).startsWith(String(value));
			case 'endsWith':
				return String(fieldValue).endsWith(String(value));
			case 'regex':
				return new RegExp(String(value)).test(String(fieldValue));
			case 'isEmpty':
				return !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;
			case 'isNotEmpty':
				return fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
			default:
				return false;
		}
	}

	private getFieldValue(data: any, field: string): any {
		if (!field) return data;
		
		const keys = field.split('.');
		let value = data;
		
		for (const key of keys) {
			if (value && typeof value === 'object' && key in value) {
				value = value[key];
			} else {
				return undefined;
			}
		}
		
		return value;
	}

	private getBranchName(branch: number, inputs: any): string {
		const branchNames = [
			inputs?.branch0Name || '分支0',
			inputs?.branch1Name || '分支1',
			inputs?.branch2Name || '分支2',
			inputs?.branch3Name || '分支3'
		];
		
		return branchNames[branch] || `分支${branch}`;
	}

	private createExecutionContext(inputData: any): any {
		return {
			$input: inputData,
			data: inputData,
			get(key: string) {
				return this[key];
			},
			now: Date.now,
			stringify: JSON.stringify,
			parse: JSON.parse,
			Math: Math,
			String: String,
			Number: Number,
			Boolean: Boolean,
			Array: Array,
			Object: Object
		};
	}

	private createSafeFunction(expression: string): (context: any) => Promise<any> {
		if (expression.trim().length === 0) {
			return () => Promise.resolve(false);
		}
		
		try {
			const strictCode = `'use strict';\nreturn (${expression});`;
			
			const func = new Function('$input', `
				try {
					${strictCode}
				} catch (error) {
					return Promise.reject(error);
				}
			`) as (context: any) => Promise<any>;
			
			return func;
		} catch (syntaxError: any) {
			console.error('表达式语法错误:', syntaxError);
			throw new SyntaxError(`表达式语法错误: ${syntaxError.message}`);
		}
	}
}