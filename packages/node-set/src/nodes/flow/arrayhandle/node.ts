import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class ArrayHandle implements INode {
	node: INodeBasic = {
		kind: 'arrayhandle',
		name: '数组处理',
		event: 'arrayhandle',
		catalog: 'flow',
		version: 1,
		description: '对数组数据进行排序、过滤、去重、映射等处理操作',
		icon: 'arrayhandle.svg',
		nodeWidth: 600
	};

	detail: INodeDetail = {
		fields: [
			{
				displayName: '数组',
				name: 'arrayData',
				type: 'json',
				default: '[]',
				required: true,
				placeholder: '请输入JSON格式的数组数据，例如：[{"name":"张三","age":25},{"name":"李四","age":30}]',
				controlType: 'textarea',
				description: '要处理的数组数据，必须是有效的JSON格式'
			},
			{
				displayName: '处理类型',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: '排序',
						value: 'sort',
						description: '按指定字段对数组进行排序'
					},
					{
						name: '过滤',
						value: 'filter',
						description: '根据条件过滤数组元素'
					},
					{
						name: '去重',
						value: 'unique',
						description: '移除数组中的重复元素'
					},
					{
						name: '映射',
						value: 'map',
						description: '转换数组中的每个元素'
					},
					{
						name: '分组',
						value: 'group',
						description: '按指定字段对数组元素进行分组'
					},
					{
						name: '聚合',
						value: 'aggregate',
						description: '对数组进行统计计算（求和、平均值等）'
					},
					{
						name: '切片',
						value: 'slice',
						description: '截取数组的指定部分'
					},
					{
						name: '连接',
						value: 'join',
						description: '将数组元素连接成字符串'
					}
				],
				default: 'sort',
				required: true,
				controlType: 'selectwithdesc',
				linkage: {
					targets: ['sortField', 'sortOrder', 'filterField', 'filterOperator', 'filterValue', 'uniqueField', 'mapExpression', 'groupField', 'aggregateField', 'aggregateFunction', 'sliceStart', 'sliceEnd', 'joinSeparator'],
					trigger: 'onChange'
				}
			},
			// 排序相关配置
			{
				displayName: '排序字段',
				name: 'sortField',
				type: 'string',
				default: '',
				required: true,
				placeholder: '请输入要排序的字段名',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['sort']
					}
				}
			},
			{
				displayName: '排序方式',
				name: 'sortOrder',
				type: 'options',
				options: [
					{
						name: '升序',
						value: 'asc',
						description: '从小到大排序'
					},
					{
						name: '降序',
						value: 'desc',
						description: '从大到小排序'
					}
				],
				default: 'asc',
				controlType: 'selectwithdesc',
				displayOptions: {
					showBy: {
						operation: ['sort']
					}
				}
			},
			// 过滤相关配置
			{
				displayName: '过滤字段',
				name: 'filterField',
				type: 'string',
				default: '',
				required: true,
				placeholder: '请输入要过滤的字段名',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['filter']
					}
				}
			},
			{
				displayName: '过滤操作符',
				name: 'filterOperator',
				type: 'options',
				options: [
					{
						name: '等于',
						value: 'equals',
						description: '字段值等于指定值'
					},
					{
						name: '不等于',
						value: 'notEquals',
						description: '字段值不等于指定值'
					},
					{
						name: '大于',
						value: 'greaterThan',
						description: '字段值大于指定值'
					},
					{
						name: '小于',
						value: 'lessThan',
						description: '字段值小于指定值'
					},
					{
						name: '包含',
						value: 'contains',
						description: '字段值包含指定文本'
					},
					{
						name: '不包含',
						value: 'notContains',
						description: '字段值不包含指定文本'
					}
				],
				default: 'equals',
				controlType: 'selectwithdesc',
				displayOptions: {
					showBy: {
						operation: ['filter']
					}
				}
			},
			{
				displayName: '过滤值',
				name: 'filterValue',
				type: 'string',
				default: '',
				required: true,
				placeholder: '请输入过滤条件的值',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['filter']
					}
				}
			},
			// 去重相关配置
			{
				displayName: '去重字段',
				name: 'uniqueField',
				type: 'string',
				default: '',
				placeholder: '留空则对整个对象去重，填写字段名则按该字段去重',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['unique']
					}
				}
			},
			// 映射相关配置
			{
				displayName: '映射表达式',
				name: 'mapExpression',
				type: 'string',
				default: '',
				required: true,
				placeholder: '例如：{"newField": "{{item.oldField}}", "computed": "{{item.value * 2}}"}',
				controlType: 'textarea',
				description: '使用JSON格式定义新的对象结构，可以使用{{item.fieldName}}引用原字段',
				displayOptions: {
					showBy: {
						operation: ['map']
					}
				}
			},
			// 分组相关配置
			{
				displayName: '分组字段',
				name: 'groupField',
				type: 'string',
				default: '',
				required: true,
				placeholder: '请输入要分组的字段名',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['group']
					}
				}
			},
			// 聚合相关配置
			{
				displayName: '聚合字段',
				name: 'aggregateField',
				type: 'string',
				default: '',
				required: true,
				placeholder: '请输入要聚合的字段名',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['aggregate']
					}
				}
			},
			{
				displayName: '聚合函数',
				name: 'aggregateFunction',
				type: 'options',
				options: [
					{
						name: '求和',
						value: 'sum',
						description: '计算字段值的总和'
					},
					{
						name: '平均值',
						value: 'avg',
						description: '计算字段值的平均值'
					},
					{
						name: '最大值',
						value: 'max',
						description: '找出字段的最大值'
					},
					{
						name: '最小值',
						value: 'min',
						description: '找出字段的最小值'
					},
					{
						name: '计数',
						value: 'count',
						description: '统计元素数量'
					}
				],
				default: 'sum',
				controlType: 'selectwithdesc',
				displayOptions: {
					showBy: {
						operation: ['aggregate']
					}
				}
			},
			// 切片相关配置
			{
				displayName: '开始位置',
				name: 'sliceStart',
				type: 'number',
				default: 0,
				placeholder: '起始索引（从0开始）',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['slice']
					}
				}
			},
			{
				displayName: '结束位置',
				name: 'sliceEnd',
				type: 'number',
				default: -1,
				placeholder: '结束索引（-1表示到末尾）',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['slice']
					}
				}
			},
			// 连接相关配置
			{
				displayName: '连接符',
				name: 'joinSeparator',
				type: 'string',
				default: ',',
				placeholder: '元素之间的分隔符',
				controlType: 'input',
				displayOptions: {
					showBy: {
						operation: ['join']
					}
				}
			}
		]
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const { arrayData, operation } = opts?.inputs || {};

		if (!arrayData) {
			throw new Error('数组数据不能为空');
		}

		let parsedArray: any[];
		try {
			parsedArray = typeof arrayData === 'string' ? JSON.parse(arrayData) : arrayData;
		} catch (error) {
			throw new Error('数组数据格式错误，请确保是有效的JSON格式');
		}

		if (!Array.isArray(parsedArray)) {
			throw new Error('输入的数据不是数组格式');
		}

		switch (operation) {
			case 'sort':
				return this.handleSort(parsedArray, opts.inputs);
			case 'filter':
				return this.handleFilter(parsedArray, opts.inputs);
			case 'unique':
				return this.handleUnique(parsedArray, opts.inputs);
			case 'map':
				return this.handleMap(parsedArray, opts.inputs);
			case 'group':
				return this.handleGroup(parsedArray, opts.inputs);
			case 'aggregate':
				return this.handleAggregate(parsedArray, opts.inputs);
			case 'slice':
				return this.handleSlice(parsedArray, opts.inputs);
			case 'join':
				return this.handleJoin(parsedArray, opts.inputs);
			default:
				throw new Error(`不支持的操作类型: ${operation}`);
		}
	}

	private handleSort(array: any[], inputs: any): any[] {
		const { sortField, sortOrder } = inputs;
		if (!sortField) {
			throw new Error('排序字段不能为空');
		}

		return array.sort((a, b) => {
			const aValue = this.getNestedValue(a, sortField);
			const bValue = this.getNestedValue(b, sortField);

			if (aValue < bValue) {
				return sortOrder === 'desc' ? 1 : -1;
			}
			if (aValue > bValue) {
				return sortOrder === 'desc' ? -1 : 1;
			}
			return 0;
		});
	}

	private handleFilter(array: any[], inputs: any): any[] {
		const { filterField, filterOperator, filterValue } = inputs;
		if (!filterField || filterValue === undefined) {
			throw new Error('过滤字段和过滤值不能为空');
		}

		return array.filter(item => {
			const itemValue = this.getNestedValue(item, filterField);
			return this.compareValues(itemValue, filterOperator, filterValue);
		});
	}

	private handleUnique(array: any[], inputs: any): any[] {
		const { uniqueField } = inputs;

		if (!uniqueField) {
			// 对整个对象去重
			return array.filter((item, index, self) => 
				self.findIndex(t => JSON.stringify(t) === JSON.stringify(item)) === index
			);
		} else {
			// 按指定字段去重
			const seen = new Set();
			return array.filter(item => {
				const value = this.getNestedValue(item, uniqueField);
				if (seen.has(value)) {
					return false;
				}
				seen.add(value);
				return true;
			});
		}
	}

	private handleMap(array: any[], inputs: any): any[] {
		const { mapExpression } = inputs;
		if (!mapExpression) {
			throw new Error('映射表达式不能为空');
		}

		let template: any;
		try {
			template = JSON.parse(mapExpression);
		} catch (error) {
			throw new Error('映射表达式格式错误，请确保是有效的JSON格式');
		}

		return array.map(item => {
			return this.processTemplate(template, item);
		});
	}

	private handleGroup(array: any[], inputs: any): Record<string, any[]> {
		const { groupField } = inputs;
		if (!groupField) {
			throw new Error('分组字段不能为空');
		}

		const groups: Record<string, any[]> = {};
		array.forEach(item => {
			const groupValue = this.getNestedValue(item, groupField);
			const key = String(groupValue);
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(item);
		});

		return groups;
	}

	private handleAggregate(array: any[], inputs: any): any {
		const { aggregateField, aggregateFunction } = inputs;
		if (!aggregateField) {
			throw new Error('聚合字段不能为空');
		}

		const values = array.map(item => {
			const value = this.getNestedValue(item, aggregateField);
			return typeof value === 'number' ? value : parseFloat(value) || 0;
		});

		switch (aggregateFunction) {
			case 'sum':
				return values.reduce((sum, val) => sum + val, 0);
			case 'avg':
				return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
			case 'max':
				return Math.max(...values);
			case 'min':
				return Math.min(...values);
			case 'count':
				return array.length;
			default:
				throw new Error(`不支持的聚合函数: ${aggregateFunction}`);
		}
	}

	private handleSlice(array: any[], inputs: any): any[] {
		const { sliceStart, sliceEnd } = inputs;
		const start = parseInt(sliceStart) || 0;
		const end = sliceEnd === -1 ? undefined : parseInt(sliceEnd);
		return array.slice(start, end);
	}

	private handleJoin(array: any[], inputs: any): string {
		const { joinSeparator } = inputs;
		const separator = joinSeparator || ',';
		return array.map(item => 
			typeof item === 'object' ? JSON.stringify(item) : String(item)
		).join(separator);
	}

	private getNestedValue(obj: any, path: string): any {
		return path.split('.').reduce((current, key) => {
			return current && current[key] !== undefined ? current[key] : undefined;
		}, obj);
	}

	private compareValues(itemValue: any, operator: string, filterValue: any): boolean {
		switch (operator) {
			case 'equals':
				return itemValue == filterValue;
			case 'notEquals':
				return itemValue != filterValue;
			case 'greaterThan':
				return Number(itemValue) > Number(filterValue);
			case 'lessThan':
				return Number(itemValue) < Number(filterValue);
			case 'contains':
				return String(itemValue).includes(String(filterValue));
			case 'notContains':
				return !String(itemValue).includes(String(filterValue));
			default:
				return false;
		}
	}

	private processTemplate(template: any, item: any): any {
		if (typeof template === 'string') {
			// 处理模板字符串，替换 {{item.fieldName}} 格式的占位符
			return template.replace(/\{\{item\.([^}]+)\}\}/g, (match, fieldPath) => {
				const value = this.getNestedValue(item, fieldPath);
				return value !== undefined ? String(value) : match;
			});
		} else if (Array.isArray(template)) {
			return template.map(t => this.processTemplate(t, item));
		} else if (typeof template === 'object' && template !== null) {
			const result: any = {};
			for (const [key, value] of Object.entries(template)) {
				result[key] = this.processTemplate(value, item);
			}
			return result;
		} else {
			return template;
		}
	}
}