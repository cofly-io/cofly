import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class Interval implements INode {
	node: INodeBasic = {
		kind: 'interval',
		name: 'Interval',
		event: 'interval',
		catalog: 'flow',
		version: 1,
		description: 'Triggers the workflow in a given interval',
		icon: 'interval.svg',
		nodeWidth: 600
	};

	detail: INodeDetail = {
		fields: [
			{
				label: 'Notice',
				fieldName: 'notice',
				control: {
					name: 'note',
					dataType: 'string',
					defaultValue: 'This workflow will run on the schedule you define here once you activate it. For testing, you can also trigger it manually: by going back to the canvas and clicking \'execute workflow\''
				}
			},
			{
				label: 'Interval',
				fieldName: 'interval',
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 1,
					placeholder: 'Interval value',
					validation: { required: true },
					attributes: [{
						minValue: 1
					}]
				}
			},
			{
				label: 'Unit',
				fieldName: 'unit',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'seconds',
					validation: { required: true },
					options: [
						{
							name: 'Seconds',
							value: 'seconds',
							description: 'Execute every X seconds'
						},
						{
							name: 'Minutes',
							value: 'minutes',
							description: 'Execute every X minutes'
						},
						{
							name: 'Hours',
							value: 'hours',
							description: 'Execute every X hours'
						}
					]
				}
			}
		]
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const interval = opts?.inputs?.interval as number;
		const unit = opts?.inputs?.unit as string;

		if (!interval || interval <= 0) {
			throw new Error('The interval has to be set to at least 1 or higher!');
		}

		let intervalValue = interval;
		if (unit === 'minutes') {
			intervalValue *= 60;
		}
		if (unit === 'hours') {
			intervalValue *= 60 * 60;
		}

		// Convert to milliseconds
		intervalValue *= 1000;

		// Check if interval value is within Node.js setInterval limits
		if (intervalValue > 2147483647) {
			throw new Error('The interval value is too large.');
		}

		// For trigger nodes, we typically return configuration or setup information
		// The actual interval execution would be handled by the workflow engine
		return {
			interval: intervalValue,
			unit: unit,
			message: `Interval trigger configured for ${interval} ${unit}`,
			timestamp: new Date().toISOString()
		};
	}
}