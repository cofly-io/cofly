import { IEnumeratorData, IEnumeratorOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common'
import { JSONPath } from '@astronautlabs/jsonpath';

export class Code implements INode {
	node: INodeBasic = {
		kind: 'loop',
		name: '循环',
		event: "code",
		catalog: 'flow',
		version: 1,
		description: "对数据进行循环处理",
		icon: 'loop.svg',
		nodeWidth: 700,
		executeMode: 'each',
		link: {
			inputs: [NodeLink.Data],
			outputs: [NodeLink.Done, NodeLink.Loop]
		}
	};
	detail: INodeDetail = {
		fields: [
			{
				label: '循环内容',
				fieldName: 'content',
				control: {
					name: 'input',
					dataType: 'string',
					placeholder: '',
					defaultValue: ''
				}
			},
			{
				label: '最大循环次数(0为不控制)',
				fieldName: 'times',
				control: {
					name: 'input',
					dataType: 'number',
					placeholder: '',
					defaultValue: 0
				}
			},
			{
				label: '从第几条开始',
				fieldName: 'index',
				control: {
					name: 'input',
					dataType: 'number',
					placeholder: '',
					defaultValue: 0
				}
			},
		],
	};

	async first(opts: IEnumeratorOptions): Promise<IEnumeratorData> {
		return this.get(opts.state, opts.inputs?.content, opts.inputs?.index);
	}

	async next(opts: IEnumeratorOptions): Promise<IEnumeratorData> {
		return this.get(opts.state, opts.inputs?.content, opts.index ?? -1);
	}

	get(state: any, path: string, index: number): IEnumeratorData {

		if (!path || isNaN(index)) {
			throw Error("invalid arguments");
		}

		if (state == null) {
			return {
				eof: true
			} as unknown as IEnumeratorData;
		}

		const data = JSONPath.query(Object.fromEntries(state), path);
		if (!data || data.length == 0) {
			throw Error(`${path} no data found`);
		}

		const record = data[0];
		if (!Array.isArray(record)) {
			throw Error(`${path} is not an array`);
		}

		if (record.length < index) {
			throw Error(`Index out of bounds`);
		}

		return {
			eof: record.length == index + 1,
			data: record[index],
			current: index
		} as IEnumeratorData;
	}
}

