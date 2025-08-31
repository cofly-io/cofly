import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { credentialManager } from '@repo/common';
import mysql from 'mysql2/promise';

export class MySQL implements INode {
	node: INodeBasic = {
		kind: 'mysql',
		name: 'MySQL数据库',
		event: "mysql",
		catalog: 'database',
		version: 1,
		description: "连接MySQL数据库进行查询、插入、更新和删除操作",
		icon: 'mysql.svg',
		nodeWidth: 600
	};

	detail: INodeDetail = {
		fields: [
			// 数据库连接配置
			{
				displayName: '连接源',
				name: 'datasource',
				type: 'string',
				default: '',
				required: true,
				connectType: "mysql",
				controlType: 'selectconnect',
				// 联动配置：影响表名字段
				linkage: {
					targets: ['table'],
					trigger: 'onChange'
				}
			},
			// 表名（除了执行SQL操作外都需要）
			{
				displayName: '表名',
				name: 'table',
				type: 'string',
				// displayOptions: {
				// 	hide: {
				// 		operation: ['executeQuery'],
				// 	},
				// },
				default: '',
				required: true,
				placeholder: '例如: users',
				controlType: 'selectfilter',
				// 联动配置：依赖连接源字段
				linkage: {
					dependsOn: 'datasource',
					fetchMethod: 'fetchConnectDetail',
					// clearOnChange: true,
					// enableWhen: (value) => !!value
				}
			},
			// 操作类型选择器
			{
				displayName: '操作类型',
				name: 'operation',
				type: 'options',
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
				],
				default: 'executeQuery',
				placeholder: '选择操作类型',
				controlType: 'selectwithdesc'
			},
			// 查询操作相关字段
			{
				displayName: '查询字段',
				name: 'columns',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['select'],
					},
				},
				default: '*',
				placeholder: '例如: id,name,email 或 * (全部字段)',
				controlType: 'input'
			},
			{
				displayName: '查询条件',
				name: 'whereCondition',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['select', 'update', 'delete'],
					},
				},
				default: '',
				placeholder: '例如: id > 10 AND status = "active"',
				controlType: 'textarea'
			},
			{
				displayName: '排序',
				name: 'orderBy',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['select'],
					},
				},
				default: '',
				placeholder: '例如: id DESC, name ASC',
				controlType: 'input'
			},
			{
				displayName: '限制条数',
				name: 'limit',
				type: 'number',
				displayOptions: {
					showBy: {
						operation: ['select'],
					},
				},
				default: 0,
				placeholder: '0表示不限制',
				controlType: 'input'
			},

			// 插入操作相关字段
			{
				displayName: '插入数据',
				name: 'insertData',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['insert'],
					},
				},
				default: '',
				required: true,
				placeholder: 'JSON格式: {"name": "张三", "email": "zhang@example.com"}',
				controlType: 'textarea'
			},

			// 更新操作相关字段
			{
				displayName: '更新数据',
				name: 'updateData',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['update'],
					},
				},
				default: '',
				required: true,
				placeholder: 'JSON格式: {"name": "李四", "status": "inactive"}',
				controlType: 'textarea'
			},

			// 自定义SQL
			{
				displayName: 'SQL语句',
				name: 'query',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['executeQuery'],
					},
				},
				default: '',
				required: true,
				placeholder: '例如: SELECT * FROM users WHERE created_at > "2024-01-01"',
				controlType: 'sqlcode'
			},

			// 连接选项
			{
				displayName: '连接超时(秒)',
				name: 'connectionTimeout',
				type: 'number',
				default: 30,
				placeholder: '连接超时时间',
				controlType: 'input'
			},
			// {
			// 	displayName: '启用SSL',
			// 	name: 'ssl',
			// 	type: 'boolean',
			// 	default: false,
			// 	placeholder: '是否启用SSL连接',
			// 	controlType: 'checkbox'
			// }
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const operation = opts.inputs?.operation;
		let connection: mysql.Connection | null = null;

		try {
			// 创建数据库连接
			connection = await this.createConnection(opts.inputs);

			let result;
			switch (operation) {
				case 'select':
					result = await this.executeSelect(connection, opts);
					break;
				case 'insert':
					result = await this.executeInsert(connection, opts);
					break;
				case 'update':
					result = await this.executeUpdate(connection, opts);
					break;
				case 'delete':
					result = await this.executeDelete(connection, opts);
					break;
				case 'executeQuery':
					result = await this.executeCustomQuery(connection, opts);
					break;
				default:
					throw new Error(`未知操作类型: ${operation}`);
			}

			return result; // 🔧 修复：添加返回语句

		} catch (error: any) {
			console.error('❌ [MySQL Node] 执行错误:', error.message);
			return {
				error: error.message,
				success: false
			};
		} finally {
			// 🔧 修复：将连接关闭逻辑移到 finally 块，确保连接总是被关闭
			if (connection) {
				try {
					await connection.end();
					console.log('✅ [MySQL Node] 数据库连接已关闭');
				} catch (closeError: any) {
					console.error('⚠️ [MySQL Node] 关闭连接时出错:', closeError.message);
				}
			}
		}
	}



	private async createConnection(inputs: any): Promise<mysql.Connection> {
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
					port: configData.port || 3306,
					database: configData.database,
					user: configData.username || configData.user,
					password: configData.password || '',
					connectTimeout: (configData.connectionTimeout || 30) * 1000,
					ssl: configData.ssl || false
				};
			} catch (error: any) {
				console.error('❌ [MySQL Node] 查询连接配置失败:', error.message);
				throw new Error(`获取连接配置失败: ${error.message}`);
			}
		} else {
			// 使用直接配置的连接信息
			connectionConfig = {
				host: inputs.host,
				port: inputs.port || 3306,
				database: inputs.database,
				user: inputs.username,
				password: inputs.password || '',
				connectTimeout: (inputs.connectionTimeout || 30) * 1000,
				ssl: inputs.ssl || false
			};
		}

		try {
			const connection = await mysql.createConnection(connectionConfig);
			return connection;
		} catch (error: any) {
			console.error('📍 [MySQL Node] 连接错误堆栈:', error.stack);
			throw error;
		}
	}

	private async executeSelect(connection: mysql.Connection, opts: IExecuteOptions): Promise<any> {
		const table = opts.inputs?.table;
		const columns = opts.inputs?.columns || '*';
		const whereCondition = opts.inputs?.whereCondition;
		const orderBy = opts.inputs?.orderBy;
		const limit = opts.inputs?.limit;

		console.log('📍 [MySQL Node] executeSelect 输入参数:', {
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

		console.log('📍 [MySQL Node] 执行查询语句:', query);

		try {
			const [rows] = await connection.execute(query);
			console.log('📍 [MySQL Node] 查询结果:', {
				rowsType: typeof rows,
				isArray: Array.isArray(rows),
				rowCount: Array.isArray(rows) ? rows.length : 0,
				firstRow: Array.isArray(rows) && rows.length > 0 ? rows[0] : null
			});

			const result = {
				data: rows,
				rowCount: Array.isArray(rows) ? rows.length : 0,
				success: true,
				query: query // 🔧 改进：返回执行的查询语句
			};

			console.log('📍 [MySQL Node] 返回结果:', result);
			return result;
		} catch (error: any) {
			console.error('❌ [MySQL Node] executeSelect 查询错误:', {
				message: error.message,
				code: error.code,
				errno: error.errno,
				sqlState: error.sqlState,
				query: query
			});
			throw new Error(`执行SQL失败: ${error.message}`);
		}
	}

	private async executeInsert(connection: mysql.Connection, opts: IExecuteOptions): Promise<any> {
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
		const placeholders = columns.map(() => '?').join(', ');
		const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

		let insertedCount = 0;
		const insertedIds = [];

		for (const record of records) {
			const values = columns.map(col => record[col]);
			const [result] = await connection.execute(query, values) as any;
			insertedCount++;
			if (result.insertId) {
				insertedIds.push(result.insertId);
			}
		}

		return {
			query: query,
			insertedCount: insertedCount,
			insertedIds: insertedIds,
			success: true,
			operation: 'insert'
		};
	}

	private async executeUpdate(connection: mysql.Connection, opts: IExecuteOptions): Promise<any> {
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

		const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
		const values = Object.values(updateData);
		const query = `UPDATE ${table} SET ${setClause} WHERE ${whereCondition}`;

		console.log('执行更新:', query);
		const [result] = await connection.execute(query, values) as any;

		return {
			query: query,
			affectedRows: result.affectedRows,
			changedRows: result.changedRows,
			success: true,
			operation: 'update'
		};
	}

	private async executeDelete(connection: mysql.Connection, opts: IExecuteOptions): Promise<any> {
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
		const [result] = await connection.execute(query) as any;

		return {
			query: query,
			affectedRows: result.affectedRows,
			success: true,
			operation: 'delete'
		};
	}

	private async executeCustomQuery(connection: mysql.Connection, opts: IExecuteOptions): Promise<any> {
		const query = opts.inputs?.query;

		if (!query) {
			throw new Error('SQL语句不能为空');
		}

		console.log('执行自定义SQL:', query);
		const [result] = await connection.execute(query);

		// 判断是否为查询操作
		const isSelect = query.trim().toLowerCase().startsWith('select');

		if (isSelect) {
			return {
				data: result,
				query: query,
				rowCount: Array.isArray(result) ? result.length : 0,
				success: true,
				operation: 'executeQuery'
			};
		} else {
			// 非查询操作（INSERT, UPDATE, DELETE等）
			const execResult = result as any;
			return {
				query: query,
				affectedRows: execResult.affectedRows || 0,
				insertId: execResult.insertId || null,
				success: true,
				operation: 'executeQuery'
			};
		}
	}
}