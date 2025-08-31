import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { credentialManager } from '@repo/common';
import oracledb from 'oracledb';

export class Oracle implements INode {
	node: INodeBasic = {
		kind: 'oracle',
		name: 'Oracle数据库',
		event: "oracle",
		catalog: 'database',
		version: 1,
		description: "连接Oracle数据库进行查询、插入、更新和删除操作",
		icon: 'oracle.svg',
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
				controlType: 'selectconnect',
				// 联动配置：影响表名字段
				linkage: {
					targets: ['table'],
					trigger: 'onChange'
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

            // 表名字段
			{
				displayName: '表名',
				name: 'table',
				type: 'string',
				default: '',
				required: true,
				controlType: 'selecttable',
				displayOptions: {
					showBy: {
						operation: ['select', 'insert', 'update', 'delete']
					}
				}
			},

            // 查询字段配置
			{
				displayName: '查询字段',
				name: 'columns',
				type: 'string',
				default: '*',
				placeholder: '例如：id, name, email 或 * 表示所有字段',
				displayOptions: {
					showBy: {
						operation: ['select']
					}
				}
			},
			// WHERE条件
			{
				displayName: 'WHERE条件',
				name: 'where',
				type: 'string',
				default: '',
				placeholder: '例如：id = 1 AND status = \'active\'',
				displayOptions: {
					showBy: {
						operation: ['select', 'update', 'delete']
					}
				}
			},
			// ORDER BY排序
			{
				displayName: 'ORDER BY',
				name: 'orderBy',
				type: 'string',
				default: '',
				placeholder: '例如：id DESC, name ASC',
				displayOptions: {
					showBy: {
						operation: ['select']
					}
				}
			},
			// 限制记录数
			{
				displayName: '限制记录数',
				name: 'limit',
				type: 'number',
				default: 1000,
				displayOptions: {
					showBy: {
						operation: ['select']
					}
				}
			},

            // 插入数据配置
			{
				displayName: '插入数据',
				name: 'insertData',
				type: 'json',
				default: '{}',
				placeholder: '{"column1": "value1", "column2": "value2"}',
				displayOptions: {
					showBy: {
						operation: ['insert']
					}
				}
			},
			// 更新数据配置
			{
				displayName: '更新数据',
				name: 'updateData',
				type: 'json',
				default: '{}',
				placeholder: '{"column1": "new_value1", "column2": "new_value2"}',
				displayOptions: {
					showBy: {
						operation: ['update']
					}
				}
			},
			// 自定义SQL查询
			{
				displayName: 'SQL语句',
				name: 'query',
				type: 'string',
				default: '',
				placeholder: 'SELECT * FROM table_name WHERE condition',
				controlType: 'textarea',
				displayOptions: {
					showBy: {
						operation: ['executeQuery']
					}
				}
			},
        ]
	};

	/**
	 * 执行节点操作
	 */
	async execute(opts: IExecuteOptions): Promise<any> {
		const operation = opts.inputs?.operation;
		
		try {
			// 创建数据库连接
			const connection = await this.createConnection(opts.inputs);
			
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
			
			// 关闭连接
			await connection.close();
			return result;
			
		} catch (error: any) {
			return {
				error: error.message,
				success: false
			};
		}
	}

	/**
	 * 执行SELECT查询
	 */
	private async executeSelect(connection: any, opts: IExecuteOptions): Promise<any> {
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
			query = `SELECT * FROM (${query}) WHERE ROWNUM <= ${limit}`;
		}
		
		const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
		return {
			success: true,
			data: result.rows,
			rowCount: result.rows?.length || 0
		};
	}

	/**
	 * 执行INSERT操作
	 */
	private async executeInsert(connection: any, opts: IExecuteOptions): Promise<any> {
		const table = opts.inputs?.table;
		const insertData = opts.inputs?.insertData;
		
		if (!table) {
			throw new Error('表名不能为空');
		}
		
		if (!insertData) {
			throw new Error('插入数据不能为空');
		}
		
		let data;
		try {
			data = typeof insertData === 'string' ? JSON.parse(insertData) : insertData;
		} catch (error) {
			throw new Error('插入数据格式错误，请提供有效的JSON格式');
		}
		
		if (Array.isArray(data)) {
			// 批量插入
			let insertedCount = 0;
			for (const record of data) {
				const columns = Object.keys(record).join(', ');
				const placeholders = Object.keys(record).map((_, index) => `:${index + 1}`).join(', ');
				const values = Object.values(record);
				
				const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
				await connection.execute(query, values);
				insertedCount++;
			}
			await connection.commit();
			return {
				success: true,
				message: `成功插入 ${insertedCount} 条记录`,
				insertedCount
			};
		} else {
			// 单条插入
			const columns = Object.keys(data).join(', ');
			const placeholders = Object.keys(data).map((_, index) => `:${index + 1}`).join(', ');
			const values = Object.values(data);
			
			const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
			const result = await connection.execute(query, values);
			await connection.commit();
			return {
				success: true,
				message: '插入成功',
				rowsAffected: result.rowsAffected
			};
		}
	}

	/**
	 * 执行UPDATE操作
	 */
	private async executeUpdate(connection: any, opts: IExecuteOptions): Promise<any> {
		const table = opts.inputs?.table;
		const updateData = opts.inputs?.updateData;
		const whereCondition = opts.inputs?.whereCondition;
		
		if (!table) {
			throw new Error('表名不能为空');
		}
		
		if (!updateData) {
			throw new Error('更新数据不能为空');
		}
		
		if (!whereCondition) {
			throw new Error('更新操作必须提供WHERE条件以确保安全');
		}
		
		let data;
		try {
			data = typeof updateData === 'string' ? JSON.parse(updateData) : updateData;
		} catch (error) {
			throw new Error('更新数据格式错误，请提供有效的JSON格式');
		}
		
		const setClause = Object.keys(data).map((key, index) => `${key} = :${index + 1}`).join(', ');
		const values = Object.values(data);
		
		const query = `UPDATE ${table} SET ${setClause} WHERE ${whereCondition}`;
		const result = await connection.execute(query, values);
		await connection.commit();
		
		return {
			success: true,
			message: '更新成功',
			rowsAffected: result.rowsAffected
		};
	}

	/**
	 * 执行DELETE操作
	 */
	private async executeDelete(connection: any, opts: IExecuteOptions): Promise<any> {
		const table = opts.inputs?.table;
		const whereCondition = opts.inputs?.whereCondition;
		
		if (!table) {
			throw new Error('表名不能为空');
		}
		
		if (!whereCondition) {
			throw new Error('删除操作必须提供WHERE条件以确保安全');
		}
		
		const query = `DELETE FROM ${table} WHERE ${whereCondition}`;
		const result = await connection.execute(query);
		await connection.commit();
		
		return {
			success: true,
			message: '删除成功',
			rowsAffected: result.rowsAffected
		};
	}

	/**
	 * 执行自定义SQL查询
	 */
	private async executeCustomQuery(connection: any, opts: IExecuteOptions): Promise<any> {
		const sql = opts.inputs?.sql;
		const parameters = opts.inputs?.parameters || [];
		
		if (!sql) {
			throw new Error('SQL语句不能为空');
		}
		
		const trimmedQuery = sql.trim().toUpperCase();
		const isSelect = trimmedQuery.startsWith('SELECT');
		
		if (isSelect) {
			// SELECT查询
			const result = await connection.execute(sql, parameters, { outFormat: oracledb.OUT_FORMAT_OBJECT });
			return {
				success: true,
				data: result.rows,
				rowCount: result.rows?.length || 0
			};
		} else {
			// INSERT/UPDATE/DELETE等操作
			const result = await connection.execute(sql, parameters);
			await connection.commit();
			return {
				success: true,
				message: 'SQL执行成功',
				rowsAffected: result.rowsAffected
			};
		}
	}

    /**
     * 创建Oracle数据库连接
     */
    private async createConnection(inputs: any): Promise<any> {
        let connectionConfig: any;
        
        // 如果选择了连接源，直接从数据库查询连接配置
        if (inputs?.datasource) {
            try {
                // 使用数据源配置
				const connectConfig = await credentialManager.mediator?.get(inputs.datasource);
                
                if (!connectConfig) {
                    throw new Error(`连接配置不存在: ${inputs.datasource}`);
                }
                
                const configData = connectConfig.config;
                connectionConfig = this.buildConnectionConfig(configData);
            } catch (error: any) {
                throw new Error(`获取连接配置失败: ${error.message}`);
            }
        } else {
            // 使用直接配置的连接信息
            connectionConfig = this.buildConnectionConfig(inputs);
        }
        
        return await oracledb.getConnection(connectionConfig);
    }
    
    /**
     * 构建连接配置
     */
    private buildConnectionConfig(config: any): any {
        return {
            user: config.username || config.user,
            password: config.password || '',
            connectString: this.buildConnectionString(config),
            poolMin: config.poolMin || 1,
            poolMax: config.poolMax || 10,
            poolIncrement: 1,
            connectTimeout: config.connectTimeout ? config.connectTimeout * 1000 : undefined
        };
    }

    /**
     * 构建Oracle连接字符串
     */
    private buildConnectionString(config: any): string {
        const { host, port = 1521, connectType, sid, serviceName, tnsString } = config;
        
        switch (connectType) {
            case 'sid':
                return `${host}:${port}/${sid}`;
            case 'serviceName':
                return `${host}:${port}/${serviceName}`;
            case 'tns':
                return tnsString;
            default:
                throw new Error(`不支持的连接类型: ${connectType}`);
        }
    }
}