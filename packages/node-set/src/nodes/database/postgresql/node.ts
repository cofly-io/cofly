import { IExecuteOptions, IExecuteResult, INode, INodeBasic, INodeDetail } from '@repo/common';
import { credentialManager } from '@repo/common';
import { Client } from 'pg';

export class PostgreSQL implements INode {
	node: INodeBasic = {
		kind: 'postgresql',
		name: 'PostgreSQL数据库',
		event: "postgresql",
		catalog: 'database',
		version: 1,
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
				control: {
					name: 'selectlistdesc',
					dataType: 'string',
					dataSourceType: "postgresql",
					defaultValue: '',
					validation: { required: true },
					linkage: {
						targets: ['table'],
					}
				},
			},
			// 联动配置：影响表名字段

			// 表名（除了执行SQL操作外都需要）
			{
				label: '表名',
				fieldName: 'table',
				control: {
					name: 'selectfilter',
					dataType: 'string',
					defaultValue: '',
					validation: { required: true },
					placeholder: '例如: users',
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
					placeholder: '例如: id,name,email 或 * (全部字段)',
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
					placeholder: '例如: id > 10 AND status = "active"',
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
					placeholder: '例如: id DESC, name ASC',
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
					validation: { required: true },
					placeholder: 'JSON格式: {"name": "张三", "email": "zhang@example.com"}',
					attributes: [{
						rows: 12
					}]
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
					validation: { required: true },
					placeholder: 'JSON格式: {"name": "李四", "status": "inactive"}',
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
					validation: { required: true },
					placeholder: '例如: SELECT * FROM users WHERE created_at > "2024-01-01"',
				},
				AIhelp: {
					enable: true,
					rules: '[你一个PostgreSQL的DBA，擅长编写SQL语句，要求：\n1. SQL语句是完整可执行的\n2. 请确保SQL语句正确且逻辑清晰]'
				}
			},
			{
				label: '返回条数',
				fieldName: 'limit',
				conditionRules: {
					showBy: {
						operation: ['executeQuery', 'select']
					}
				},
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 0,
					placeholder: '空或者0表示不限制'
				}
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const operation = opts.inputs?.operation;
		console.log("inputs.operation", operation);
		let client: Client | null = null;

		try {
			// 创建数据库连接
			client = await this.createConnection(opts.inputs);
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

			return result;

		} catch (error: any) {
			return {
				error: error.message
			};
		} finally {
			// 确保连接总是被关闭
			if (client) {
				try {
					await client.end();
				} catch (closeError: any) {
					console.error('⚠️ [PostgreSQL Node] 关闭连接时出错:', closeError.message);
				}
			}
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

		try {
			const result = await client.query(query);
			return result.rows;
		} catch (error: any) {
			throw new Error(`执行SQL失败: ${error.message}`);
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

		// ISO8601正则表达式，匹配格式如：2024-11-27T21:53:37.231Z 或 2024-11-27T21:53:37Z
		const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

		for (const record of records) {
			const values = columns.map(col => {
				let value = record[col];
				if (typeof value === 'string' && isoRegex.test(value)) {
					const date = new Date(value);
					if (!isNaN(date.getTime())) {
						// 转换为PostgreSQL datetime格式：'YYYY-MM-DD HH:MM:SS'
						return date.toISOString().slice(0, 19).replace('T', ' ');
					}
				}
				return value;
			});
			const result = await client.query(query, values);
			insertedCount++;
			if (result.rows.length > 0) {
				insertedRows.push(result.rows[0]);
			}
		}

		return {
			insertedCount: insertedCount,
			insertedRows: insertedRows,
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

		const result = await client.query(query, values);
		return {
			affectedRows: result.rowCount,
			changedRows: result.rowCount,
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

		const result = await client.query(query);

		return { affectedRows: result.rowCount };
	}

	private async executeCustomQuery(client: Client, opts: IExecuteOptions): Promise<any> {
		const queryStr = opts.inputs?.query;
		const query = queryStr && queryStr.endsWith(';') ? queryStr.slice(0, -1) : queryStr;
		const limit = opts.inputs?.limit;

		if (!query) {
			throw new Error('SQL语句不能为空');
		}

		// 检查是否为 SELECT 查询且需要添加 LIMIT
		let finalQuery = query;
		const isSelectQuery = query.trim().toLowerCase().startsWith('select');

		if (isSelectQuery && limit && limit > 0) {
			// 检查是否已包含 LIMIT 子句
			const hasLimit = query.toLowerCase().includes('limit');

			if (!hasLimit) {
				finalQuery = `${query.trim()} LIMIT ${limit}`;
			}
		}
		const result = await client.query(finalQuery);

		if (isSelectQuery) {
			return result.rows;
		} else {
			return {
				affectedRows: result.rowCount || 0,
				insertId: result.rows?.[0]?.id || null,
			}
		}
	}
}