import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink, credentialManager } from '@repo/common';

export class Kingbase implements INode {
    node: INodeBasic = {
        kind: 'kingbase',
        name: 'KingbaseES数据库',
        event: "kingbase",
        catalog: 'database',
        version: 1,
        // position: [0, 0],
        description: "连接KingbaseES数据库进行查询、插入、更新和删除操作",
        icon: 'kingbase.svg',
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
                connectType: "kingbase",
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

            // 表名（除了执行SQL操作外都需要）
            {
                displayName: '表名',
                name: 'table',
                type: 'string',
                displayOptions: {
                    hide: {
                        operation: ['executeQuery'],
                    },
                },
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
        ],
    };

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
            await connection.end();

            return result;
        } catch (error: any) {
            console.error('❌ [Kingbase Node] 执行错误:', error.message);
            return {
                error: error.message,
                success: false
            };
        }
    }

    private async createConnection(inputs: any): Promise<any> {
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
                    user: configData.username || configData.user || 'SYSTEM',
                    host: configData.host || 'localhost',
                    database: configData.database,
                    password: configData.password || '',
                    port: configData.port || 54321,
                    ssl: configData.ssl || false,
                    connectionTimeoutMillis: (configData.connectionTimeout || 30) * 1000
                };
            } catch (error: any) {
                console.error('❌ [Kingbase Node] 查询连接配置失败:', error.message);
                throw new Error(`获取连接配置失败: ${error.message}`);
            }
        } else {
            // 使用直接配置的连接信息
            connectionConfig = {
                user: inputs.username || 'SYSTEM',
                host: inputs.host || 'localhost',
                database: inputs.database,
                password: inputs.password || '',
                port: inputs.port || 54321,
                ssl: inputs.ssl || false,
                connectionTimeoutMillis: (inputs.connectionTimeout || 30) * 1000
            };
        }

        try {
            // Try KingbaseES official driver first
            try {
                const kb = await import('kb');
                const {Client} = kb;

                const client = new Client(connectionConfig);
                await client.connect();
                return client;
            } catch (kbError) {
                console.log('⚠️ [Kingbase Node] KingbaseES驱动连接失败，尝试PostgreSQL兼容驱动:', kbError);

                // Fallback to PostgreSQL driver for compatibility
                const pg = await import('pg');
                const {Client} = pg;

                const client = new Client(connectionConfig);
                await client.connect();
                return client;
            }
        } catch (error: any) {
            console.error('📍 [Kingbase Node] 连接错误堆栈:', error.stack);
            throw error;
        }
    }

    private async executeSelect(connection: any, opts: IExecuteOptions): Promise<any> {
        const inputs = opts.inputs;
        if (!inputs) {
            throw new Error('输入参数不能为空');
        }
        const table = inputs.table;
        const columns = inputs.columns || '*';
        const whereCondition = inputs.whereCondition;
        const orderBy = inputs.orderBy;
        const limit = inputs.limit;

        let query = `SELECT ${columns}
                     FROM ${table}`;

        if (whereCondition) {
            query += ` WHERE ${whereCondition}`;
        }

        if (orderBy) {
            query += ` ORDER BY ${orderBy}`;
        }

        if (limit && limit > 0) {
            query += ` LIMIT ${limit}`;
        }

        console.log('🔍 [Kingbase Node] 执行查询:', query);

        try {
            const result = await connection.query(query);
            console.log('✅ [Kingbase Node] 查询成功，返回', result.rows?.length || 0, '条记录');

            return {
                success: true,
                data: result.rows || [],
                count: result.rows?.length || 0
            };
        } catch (error: any) {
            console.error('❌ [Kingbase Node] 查询失败:', error.message);
            throw error;
        }
    }

    private async executeInsert(connection: any, opts: IExecuteOptions): Promise<any> {
        const inputs = opts.inputs;
        if (!inputs) {
            throw new Error('输入参数不能为空');
        }
        const table = inputs.table;
        const insertData = inputs.insertData;

        let parsedData;
        try {
            parsedData = typeof insertData === 'string' ? JSON.parse(insertData) : insertData;
        } catch (error) {
            throw new Error('插入数据格式错误，必须是有效的JSON格式');
        }

        if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('插入数据必须是有效的对象');
        }

        const columns = Object.keys(parsedData);
        const placeholders = columns.map((_, index) => `$${index + 1}`);
        const values = Object.values(parsedData);

        const query = `INSERT INTO ${table} (${columns.join(', ')})
                       VALUES (${placeholders.join(', ')}) RETURNING *`;

        console.log('📝 [Kingbase Node] 执行插入:', query, '数据:', values);

        try {
            const result = await connection.query(query, values);
            console.log('✅ [Kingbase Node] 插入成功，影响行数:', result.rowCount);

            return {
                success: true,
                affectedRows: result.rowCount || 0,
                insertedData: result.rows || []
            };
        } catch (error: any) {
            console.error('❌ [Kingbase Node] 插入失败:', error.message);
            throw error;
        }
    }

    private async executeUpdate(connection: any, opts: IExecuteOptions): Promise<any> {
        const inputs = opts.inputs;
        if (!inputs) {
            throw new Error('输入参数不能为空');
        }
        const table = inputs.table;
        const updateData = inputs.updateData;
        const whereCondition = inputs.whereCondition;

        let parsedData;
        try {
            parsedData = typeof updateData === 'string' ? JSON.parse(updateData) : updateData;
        } catch (error) {
            throw new Error('更新数据格式错误，必须是有效的JSON格式');
        }

        if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('更新数据必须是有效的对象');
        }

        const columns = Object.keys(parsedData);
        const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
        const values = Object.values(parsedData);

        let query = `UPDATE ${table}
                     SET ${setClause}`;

        if (whereCondition) {
            query += ` WHERE ${whereCondition}`;
        }

        query += ' RETURNING *';

        console.log('🔄 [Kingbase Node] 执行更新:', query, '数据:', values);

        try {
            const result = await connection.query(query, values);
            console.log('✅ [Kingbase Node] 更新成功，影响行数:', result.rowCount);

            return {
                success: true,
                affectedRows: result.rowCount || 0,
                updatedData: result.rows || []
            };
        } catch (error: any) {
            console.error('❌ [Kingbase Node] 更新失败:', error.message);
            throw error;
        }
    }

    private async executeDelete(connection: any, opts: IExecuteOptions): Promise<any> {
        const inputs = opts.inputs;
        if (!inputs) {
            throw new Error('输入参数不能为空');
        }
        const table = inputs.table;
        const whereCondition = inputs.whereCondition;

        let query = `DELETE
                     FROM ${table}`;

        if (whereCondition) {
            query += ` WHERE ${whereCondition}`;
        }

        query += ' RETURNING *';

        console.log('🗑️ [Kingbase Node] 执行删除:', query);

        try {
            const result = await connection.query(query);
            console.log('✅ [Kingbase Node] 删除成功，影响行数:', result.rowCount);

            return {
                success: true,
                affectedRows: result.rowCount || 0,
                deletedData: result.rows || []
            };
        } catch (error: any) {
            console.error('❌ [Kingbase Node] 删除失败:', error.message);
            throw error;
        }
    }

    private async executeCustomQuery(connection: any, opts: IExecuteOptions): Promise<any> {
        const inputs = opts.inputs;
        if (!inputs) {
            throw new Error('输入参数不能为空');
        }
        const sqlQuery = inputs.query;

        if (!sqlQuery) {
            throw new Error('SQL查询语句不能为空');
        }

        console.log('🔧 [Kingbase Node] 执行自定义SQL:', sqlQuery);

        try {
            const result = await connection.query(sqlQuery);
            console.log('✅ [Kingbase Node] 自定义SQL执行成功');

            return {
                success: true,
                data: result.rows || [],
                affectedRows: result.rowCount || 0,
                count: result.rows?.length || 0
            };
        } catch (error: any) {
            console.error('❌ [Kingbase Node] 自定义SQL执行失败:', error.message);
            throw error;
        }
    }
}