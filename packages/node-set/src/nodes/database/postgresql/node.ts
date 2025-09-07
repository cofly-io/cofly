import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink, credentialManager } from '@repo/common';
import { Client } from 'pg';

export class PostgreSQL implements INode {
	node: INodeBasic = {
		kind: 'postgresql',
		name: 'PostgreSQL数据库',
		event: "postgresql",
		catalog: 'database',
		version: 1,
		// position: [0, 0],
		description: "连接PostgreSQL数据库进行查询、插入、更新和删除操作",
		icon: 'postgresql.svg',
		nodeWidth: 600
	};

	detail: INodeDetail = {
		fields: [
			// 数据库连接配置
			{
				label: '连接源',
				fieldName: 'datasource',
				dataSourceType: "postgresql",
				control: {
					name: 'selectconnect',
					dataType: 'string',
					defaultValue: '',
					validation: { required: true }
				},
				// 联动配置：影响表名字段
				linkage: {
					targets: ['table'],
					trigger: 'onChange'
				}
			},
			// 操作类型选择器
			{
				label: '操作类型',
				fieldName: 'operation',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'executeQuery',
					options: [
						{
							name: '执行SQL',
							value: 'executeQuery',
							description: '执行自定义SQL语句',
						},
						{
							name: '查询数据',
							value: 'select',
							description: '执行SELECT查询获取数据',
						},
						{
							name: '插入数据',
							value: 'insert',
							description: '向表中插入新记录',
						},
						{
							name: '更新数据',
							value: 'update',
							description: '更新表中的现有记录',
						},
						{
							name: '删除数据',
							value: 'delete',
							description: '删除表中的记录',
						},
					]
				}
			},

			// 表名（除了执行SQL操作外都需要）
			{
				label: '表名',
				fieldName: 'table',
				conditionRules: {
					hide: {
						operation: ['executeQuery']
					}
				},
				control: {
					name: 'selectfilter',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: users',
					validation: { required: true }
				},
				// 联动配置：依赖连接源字段
				linkage: {
					dependsOn: 'datasource',
					// fetchMethod: 'fetchConnectDetail',
					// clearOnChange: true,
					// enableWhen: (value) => !!value
				}
			},

			// 查询操作相关字段
			{
				label: '查询字段',
				fieldName: 'columns',
				conditionRules: {
					showBy: {
						operation: ['select']
					}
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '*',
					placeholder: '例如: id,name,email 或 * (全部字段)'
				}
			},
			{
				label: '查询条件',
				fieldName: 'whereCondition',
				conditionRules: {
					showBy: {
						operation: ['select', 'update', 'delete']
					}
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: id > 10 AND status = \'active\''
				}
			},
			{
				label: '排序',
				fieldName: 'orderBy',
				conditionRules: {
					showBy: {
						operation: ['select']
					}
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: id DESC, name ASC'
				}
			},
			{
				label: '限制条数',
				fieldName: 'limit',
				conditionRules: {
					showBy: {
						operation: ['select']
					}
				},
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 0,
					placeholder: '0表示不限制'
				}
			},

			// 插入操作相关字段
			{
				label: '插入数据',
				fieldName: 'insertData',
				conditionRules: {
					showBy: {
						operation: ['insert']
					}
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'JSON格式: {"name": "张三", "email": "zhang@example.com"}',
					validation: { required: true }
				}
			},

			// 更新操作相关字段
			{
				label: '更新数据',
				fieldName: 'updateData',
				conditionRules: {
					showBy: {
						operation: ['update']
					}
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'JSON格式: {"name": "李四", "status": "inactive"}',
					validation: { required: true }
				}
			},

			// 自定义SQL
			{
				label: 'SQL语句',
				fieldName: 'query',
				conditionRules: {
					showBy: {
						operation: ['executeQuery']
					}
				},
				control: {
					name: 'sqlcode',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: SELECT * FROM users WHERE created_at > \'2024-01-01\'',
					validation: { required: true }
				}
			},

			// 连接选项
			{
				label: '连接超时(秒)',
				fieldName: 'connectionTimeout',
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 30,
					placeholder: '连接超时时间'
				}
			},
			{
				label: '启用SSL',
				fieldName: 'ssl',				
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false,
					placeholder: '是否启用SSL连接',
				}
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const operation = opts.inputs?.operation;

		try {
			// 创建数据库连接
			const client = await this.createConnection(opts.inputs);

			let result;
			switch (operation) {
				case 'select':
					result = await this.executeSelect(client, opts);
					break;
				case 'insert':
					result = await this.executeInsert(client, opts);
					break;
				case 'update':
					result = await this.executeUpdate(client, opts);
					break;
				case 'delete':
					result = await this.executeDelete(client, opts);
					break;
				case 'executeQuery':
					result = await this.executeCustomQuery(client, opts);
					break;
				default:
					throw new Error(`未知操作类型: ${operation}`);
			}
			// 关闭连接
			await client.end();
			return result;

		} catch (error: any) {
			console.error('❌ [PostgreSQL Node] 执行错误:', error.message);
			return {
				error: error.message,
				success: false
			};
		}
	}

	private async createConnection(inputs: any): Promise<Client> {
		let connectionConfig: any;

		// 如果选择了连接源，直接从数据库查询连接配置
		if (inputs.datasource) {
			try {
				// 使用数据源配置
				const connectConfig = await credentialManager.mediator?.get(inputs.datasource);

				if (!connectConfig) {
					throw new Error(`连接配置不存在: ${inputs.datasource}`);
				}

				const configData = connectConfig.config;

				connectionConfig = {
					host: configData.host || 'localhost',
					port: configData.port || 5432,
					database: configData.database,
					user: configData.username || configData.user,
					password: configData.password || '',
					connectionTimeoutMillis: (configData.connectionTimeout || 30) * 1000,
					ssl: configData.ssl || false
				};
			} catch (error: any) {
				console.error('❌ [PostgreSQL Node] 查询连接配置失败:', error.message);
				throw new Error(`获取连接配置失败: ${error.message}`);
			}
		} else {
			// 使用直接配置的连接信息
			connectionConfig = {
				host: inputs.host || 'localhost',
				port: inputs.port || 5432,
				database: inputs.database,
				user: inputs.username,
				password: inputs.password || '',
				connectionTimeoutMillis: (inputs.connectionTimeout || 30) * 1000,
				ssl: inputs.ssl || false
			};
		}

		try {
			const client = new Client(connectionConfig);
			await client.connect();
			return client;
		} catch (error: any) {
			console.error('📍 [PostgreSQL Node] 连接错误堆栈:', error.stack);
			throw error;
		}
	}

	private async executeSelect(client: Client, opts: IExecuteOptions): Promise<any> {
		const table = opts.inputs?.table;
		const columns = opts.inputs?.columns || '*';
		const whereCondition = opts.inputs?.whereCondition;
		const orderBy = opts.inputs?.orderBy;
		const limit = opts.inputs?.limit;

		console.log('📍 [PostgreSQL Node] executeSelect 输入参数:', {
			table,
			columns,
			whereCondition,
			orderBy,
			limit
		});

		if (!table) {
			throw new Error('表名不能为空');
		}

		let query = `SELECT ${columns} FROM ${table}`;

		if (whereCondition) {
			query += ` WHERE ${whereCondition}`;
		}

		if (orderBy) {
			query += ` ORDER BY ${orderBy}`;
		}

		if (limit && limit > 0) {
			query += ` LIMIT ${limit}`;
		}

		console.log('📍 [PostgreSQL Node] 执行查询语句:', query);

		try {
			const result = await client.query(query);
			console.log('📍 [PostgreSQL Node] 查询结果:', {
				rowsType: typeof result.rows,
				isArray: Array.isArray(result.rows),
				rowCount: result.rows.length,
				firstRow: result.rows.length > 0 ? result.rows[0] : null
			});

			const queryResult = {
				data: result.rows,
				rowCount: result.rows.length,
				success: true,
			};

			console.log('📍 [PostgreSQL Node] 返回结果:', queryResult);
			return queryResult;
		} catch (error: any) {
			console.error('📍 [PostgreSQL Node] executeSelect 查询错误:', error);
			throw error;
		}
	}

	private async executeInsert(client: Client, opts: IExecuteOptions): Promise<any> {
		const table = opts.inputs?.table;
		const insertDataStr = opts.inputs?.insertData;

		if (!table) {
			throw new Error('表名不能为空');
		}

		if (!insertDataStr) {
			throw new Error('插入数据不能为空');
		}

		let insertData;
		try {
			insertData = JSON.parse(insertDataStr);
		} catch (error) {
			throw new Error('插入数据格式错误，请使用有效的JSON格式');
		}

		// 支持单条记录和多条记录插入
		const records = Array.isArray(insertData) ? insertData : [insertData];

		if (records.length === 0) {
			throw new Error('没有要插入的数据');
		}

		// 获取字段名
		const columns = Object.keys(records[0]);
		const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
		const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;

		let insertedCount = 0;
		const insertedRows = [];

		for (const record of records) {
			const values = columns.map(col => record[col]);
			const result = await client.query(query, values);
			insertedCount++;
			if (result.rows.length > 0) {
				insertedRows.push(result.rows[0]);
			}
		}

		return {
			query: query,
			insertedCount: insertedCount,
			insertedRows: insertedRows,
			success: true,
			operation: 'insert'
		};
	}

	private async executeUpdate(client: Client, opts: IExecuteOptions): Promise<any> {
		const table = opts.inputs?.table;
		const updateDataStr = opts.inputs?.updateData;
		const whereCondition = opts.inputs?.whereCondition;

		if (!table) {
			throw new Error('表名不能为空');
		}

		if (!updateDataStr) {
			throw new Error('更新数据不能为空');
		}

		if (!whereCondition) {
			throw new Error('更新操作必须指定WHERE条件以确保安全');
		}

		let updateData;
		try {
			updateData = JSON.parse(updateDataStr);
		} catch (error) {
			throw new Error('更新数据格式错误，请使用有效的JSON格式');
		}

		const setClause = Object.keys(updateData).map((key, index) => `${key} = $${index + 1}`).join(', ');
		const values = Object.values(updateData);
		const query = `UPDATE ${table} SET ${setClause} WHERE ${whereCondition}`;

		console.log('执行更新:', query);
		const result = await client.query(query, values);

		return {
			query: query,
			affectedRows: result.rowCount,
			success: true,
			operation: 'update'
		};
	}

	private async executeDelete(client: Client, opts: IExecuteOptions): Promise<any> {
		const table = opts.inputs?.table;
		const whereCondition = opts.inputs?.whereCondition;

		if (!table) {
			throw new Error('表名不能为空');
		}

		if (!whereCondition) {
			throw new Error('删除操作必须指定WHERE条件以确保安全');
		}

		const query = `DELETE FROM ${table} WHERE ${whereCondition}`;

		console.log('执行删除:', query);
		const result = await client.query(query);

		return {
			query: query,
			affectedRows: result.rowCount,
			success: true,
			operation: 'delete'
		};
	}

	private async executeCustomQuery(client: Client, opts: IExecuteOptions): Promise<any> {
		const query = opts.inputs?.query;

		if (!query) {
			throw new Error('SQL语句不能为空');
		}

		console.log('执行自定义SQL:', query);
		const result = await client.query(query);

		// 判断是否为查询操作
		const isSelect = query.trim().toLowerCase().startsWith('select');

		if (isSelect) {
			return {
				data: result.rows,
				query: query,
				rowCount: result.rows.length,
				success: true,
				operation: 'executeQuery'
			};
		} else {
			// 非查询操作（INSERT, UPDATE, DELETE等）
			return {
				query: query,
				affectedRows: result.rowCount || 0,
				success: true,
				operation: 'executeQuery'
			};
		}
	}
}