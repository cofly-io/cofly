import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink, credentialManager } from '@repo/common';
import sql from 'mssql';

export class SQLServer implements INode {
	node: INodeBasic = {
		kind: 'sqlserver',
		name: 'SQL Server数据库',
		event: "sqlserver",
		catalog: 'database',
		version: 1,
		description: "连接SQL Server数据库进行查询、插入、更新和删除操作",
		icon: 'sqlserver.svg',
		nodeWidth: 600
	};

	detail: INodeDetail = {
		fields: [
			// 数据库连接配置
			{
				label: '连接源',
				fieldName: 'datasource',				
				control: {
					name: 'selectconnect',
					dataType: 'string',
					defaultValue: '',
					dataSourceType: "sqlserver",
					validation: { required: true }
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
					placeholder: '选择操作类型',
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
					defaultValue: 15,
					placeholder: '连接超时时间'
				}
			},
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const operation = opts.inputs?.operation;

		try {
			// 创建数据库连接
			const pool = await this.createConnection(opts.inputs);

			let result;
			switch (operation) {
				case 'select':
					result = await this.executeSelect(pool, opts);
					break;
				case 'insert':
					result = await this.executeInsert(pool, opts);
					break;
				case 'update':
					result = await this.executeUpdate(pool, opts);
					break;
				case 'delete':
					result = await this.executeDelete(pool, opts);
					break;
				case 'executeQuery':
					result = await this.executeCustomQuery(pool, opts);
					break;
				default:
					throw new Error(`未知操作类型: ${operation}`);
			}

			// 关闭连接
			await pool.close();
			return result;

		} catch (error: any) {
			console.error('❌ [SQL Server Node] 执行错误:', error.message);
			return {
				error: error.message,
				success: false
			};
		}
	}

	private async createConnection(inputs: any): Promise<sql.ConnectionPool> {
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
				connectionConfig = this.buildConnectionConfig(configData);
			} catch (error: any) {
				console.error('❌ [SQL Server Node] 查询连接配置失败:', error.message);
				throw new Error(`获取连接配置失败: ${error.message}`);
			}
		} else {
			// 使用直接配置的连接信息
			connectionConfig = this.buildConnectionConfig(inputs);
		}

		try {
			const pool = await sql.connect(connectionConfig);
			return pool;
		} catch (error: any) {
			console.error('📍 [SQL Server Node] 连接错误堆栈:', error.stack);
			throw error;
		}
	}

	private buildConnectionConfig(configData: any): any {
		let server = configData.host || 'localhost';
		if (configData.instance) {
			server += `\\${configData.instance}`;
		}
		if (configData.port && configData.port !== 1433) {
			server += `,${configData.port}`;
		}

		return {
			server: server,
			database: configData.database,
			user: configData.username || configData.user,
			password: configData.password || '',
			connectionTimeout: (configData.connectionTimeout || 15) * 1000,
			requestTimeout: (configData.requestTimeout || 15) * 1000,
			options: {
				encrypt: configData.encrypt !== false,
				trustServerCertificate: configData.trustServerCertificate || false,
				enableArithAbort: true
			}
		};
	}

	private async executeSelect(pool: sql.ConnectionPool, opts: IExecuteOptions): Promise<any> {
		const table = opts.inputs?.table;
		const columns = opts.inputs?.columns || '*';
		const whereCondition = opts.inputs?.whereCondition;
		const orderBy = opts.inputs?.orderBy;
		const limit = opts.inputs?.limit;

		console.log('📍 [SQL Server Node] executeSelect 输入参数:', {
			table,
			columns,
			whereCondition,
			orderBy,
			limit
		});

		if (!table) {
			throw new Error('表名不能为空');
		}

		let query = `SELECT ${columns} FROM [${table}]`;

		if (whereCondition) {
			query += ` WHERE ${whereCondition}`;
		}

		if (orderBy) {
			query += ` ORDER BY ${orderBy}`;
		}

		if (limit && limit > 0) {
			if (!orderBy) {
				// SQL Server 需要 ORDER BY 才能使用 TOP
				query = query.replace(`SELECT ${columns}`, `SELECT TOP ${limit} ${columns}`);
			} else {
				query += ` OFFSET 0 ROWS FETCH NEXT ${limit} ROWS ONLY`;
			}
		}

		console.log('📍 [SQL Server Node] 执行查询语句:', query);

		try {
			const result = await pool.request().query(query);
			console.log('📍 [SQL Server Node] 查询结果:', {
				rowCount: result.recordset.length,
				firstRow: result.recordset.length > 0 ? result.recordset[0] : null
			});

			const resultData = {
				data: result.recordset,
				rowCount: result.recordset.length,
				success: true,
			};

			console.log('📍 [SQL Server Node] 返回结果:', resultData);
			return resultData;
		} catch (error: any) {
			console.error('📍 [SQL Server Node] executeSelect 查询错误:', error);
			throw error;
		}
	}

	private async executeInsert(pool: sql.ConnectionPool, opts: IExecuteOptions): Promise<any> {
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
		const placeholders = columns.map((_, index) => `@param${index}`).join(', ');
		const query = `INSERT INTO [${table}] ([${columns.join('], [')}]) VALUES (${placeholders}); SELECT SCOPE_IDENTITY() AS insertId`;

		let insertedCount = 0;
		const insertedIds = [];

		for (const record of records) {
			const request = pool.request();
			columns.forEach((col, index) => {
				request.input(`param${index}`, record[col]);
			});

			const result = await request.query(query);
			insertedCount++;
			if (result.recordset && result.recordset[0] && result.recordset[0].insertId) {
				insertedIds.push(result.recordset[0].insertId);
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

	private async executeUpdate(pool: sql.ConnectionPool, opts: IExecuteOptions): Promise<any> {
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

		const setClause = Object.keys(updateData).map((key, index) => `[${key}] = @param${index}`).join(', ');
		const query = `UPDATE [${table}] SET ${setClause} WHERE ${whereCondition}`;

		console.log('执行更新:', query);
		const request = pool.request();
		Object.values(updateData).forEach((value, index) => {
			request.input(`param${index}`, value);
		});

		const result = await request.query(query);

		return {
			query: query,
			affectedRows: result.rowsAffected[0] || 0,
			success: true,
			operation: 'update'
		};
	}

	private async executeDelete(pool: sql.ConnectionPool, opts: IExecuteOptions): Promise<any> {
		const table = opts.inputs?.table;
		const whereCondition = opts.inputs?.whereCondition;

		if (!table) {
			throw new Error('表名不能为空');
		}

		if (!whereCondition) {
			throw new Error('删除操作必须指定WHERE条件以确保安全');
		}

		const query = `DELETE FROM [${table}] WHERE ${whereCondition}`;

		console.log('执行删除:', query);
		const result = await pool.request().query(query);

		return {
			query: query,
			affectedRows: result.rowsAffected[0] || 0,
			success: true,
			operation: 'delete'
		};
	}

	private async executeCustomQuery(pool: sql.ConnectionPool, opts: IExecuteOptions): Promise<any> {
		const query = opts.inputs?.query;

		if (!query) {
			throw new Error('SQL语句不能为空');
		}

		console.log('执行自定义SQL:', query);
		const result = await pool.request().query(query);

		// 判断是否为查询操作
		const isSelect = query.trim().toLowerCase().startsWith('select');

		if (isSelect) {
			return {
				data: result.recordset,
				query: query,
				rowCount: result.recordset ? result.recordset.length : 0,
				success: true,
				operation: 'executeQuery'
			};
		} else {
			// 非查询操作（INSERT, UPDATE, DELETE等）
			return {
				query: query,
				affectedRows: result.rowsAffected ? result.rowsAffected[0] : 0,
				success: true,
				operation: 'executeQuery'
			};
		}
	}
}