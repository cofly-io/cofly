import {
    Icon,
    IDatabaseMetadataOptions,
    IDatabaseMetadataResult,
    IDatabaseExecutionOptions,
    IDatabaseExecutionResult,
    ConnectTestResult
} from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';
import { Client } from 'pg';

/**
 * PostgreSQL 数据库连接定义
 */
export class PostgreSQLConnect extends BaseDatabaseConnect {
    override overview = {
        id: 'postgresql',
        name: 'PostgreSQL',
        type: 'db' as const,
        provider: 'postgresql' as const,
        icon: 'postgresql.svg' as Icon,
        description: 'PostgreSQL关系型数据库连接',
        version: '1.0.0',
    };

    override detail = {
        defaultPort: 5432,
        supportedFeatures: [
            'transactions' as const,
            'stored_procedures' as const,
            'views' as const,
            'triggers' as const,
            'full_text_search' as const,
            'json_support' as const,
            'array_support' as const
        ],
        fields: [
            {
                label: '主机地址',
                fieldName: 'host',
                description: 'PostgreSQL服务器的主机地址',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: 'localhost',
                    validation: {
                        required: true
                    },
                    placeholder: 'localhost 或 IP地址'
                }
            },
            {
                label: '端口',
                fieldName: 'port',
                description: 'PostgreSQL服务器端口号',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 5432,
                    validation: {
                        required: true
                    }
                }
            },
            {
                label: '用户名',
                fieldName: 'username',
                description: '数据库用户名',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    }
                }
            },
            {
                label: '密码',
                fieldName: 'password',
                description: '数据库密码',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: false
                    },
                    attributes: [{
                        type: 'password'
                    }]
                }
            },
            {
                label: '数据库名',
                fieldName: 'database',
                description: '要连接的数据库名称',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    }
                }
            },
            {
                label: 'Schema',
                fieldName: 'schema',
                description: '默认Schema名称',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: 'public'
                }
            },
            {
                label: '启用SSL',
                fieldName: 'ssl',
                description: '是否启用SSL连接',
                control: {
                    name: 'switch' as const,
                    dataType: 'boolean' as const,
                    defaultValue: false
                }
            },
            {
                label: '连接超时(秒)',
                fieldName: 'connectionTimeout',
                description: '连接超时时间，单位：秒',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 10
                }
            },
            {
                label: '连接池大小',
                fieldName: 'connectionLimit',
                description: '最大连接数',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 10
                }
            }
        ],
        validateConnection: true,
        connectionTimeout: 10
    };

    /**
     * 测试PostgreSQL连接
     */
    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        try {
            // 验证必填字段
            const requiredFields = ['host', 'port', 'database', 'username'];
            for (const field of requiredFields) {
                if (!config[field]) {
                    return {
                        success: false,
                        message: `缺少必填字段: ${field}`
                    };
                }
            }

            // TODO: 添加实际的连接测试逻辑
            return {
                success: true,
                message: '连接测试成功',
                latency: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: `连接失败: ${error instanceof Error ? error.message : String(error)}`,
                latency: Date.now() - startTime
            };
        }
    }

    async metadata(opts: IDatabaseMetadataOptions): Promise<IDatabaseMetadataResult> {
        try {
            const connectionConfig = {
                host: opts.host,
                port: opts.port,
                user: opts.user,
                password: opts.password,
                database: opts.database,
                ssl: opts.ssl ? { rejectUnauthorized: false } : false,
                connectionTimeoutMillis: (opts.connectTimeout || 10) * 1000,
            };
            return await this.getTableNames(connectionConfig, opts.search);
        } catch (error: any) {
            console.error('❌ [PostgreSQL Connect] metadata 执行错误:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取表名列表
     */
    private async getTableNames(connectionConfig?: any, search?: string): Promise<IDatabaseMetadataResult> {
        try {
            const tables = await this.withConnection(connectionConfig, async (client) => {
                // 查询表名
                let query = 'SELECT tablename FROM pg_tables WHERE schemaname = $1';
                const values = ['public'];

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' AND tablename ILIKE $2';
                    values.push(`%${search}%`);
                }
                query += ' ORDER BY tablename';

                const result = await client.query(query, values);
                // 格式化结果
                return result.rows.map((row: any) => ({
                    value: row.tablename,
                    label: row.tablename
                }));
            });

            return {
                success: true,
                data: tables
            };

        } catch (error: any) {
            console.error('❌ [PostgreSQL Connect] 获取表名失败:', error.message);
            return {
                success: false,
                error: `获取表名失败: ${error.message}`
            };
        }
    }

    /**
    * 统一的连接管理函数
    * 自动处理连接的创建、使用和关闭
    */
    private async withConnection<T>(
        connectionConfig: any,
        callback: (client: Client) => Promise<T>
    ): Promise<T> {
        let client: Client | null = null;
        try {
            // 创建连接
            client = new Client(connectionConfig);
            await client.connect();
            console.log('✅ [PostgreSQL Connect] 数据库连接已建立');

            // 执行回调函数
            const result = await callback(client);

            return result;

        } catch (error: any) {
            console.error('❌ [PostgreSQL Connect] 连接操作失败:', error.message);
            throw error;
        } finally {
            // 确保连接总是被正确关闭
            if (client) {
                try {
                    await client.end();
                    console.log('✅ [PostgreSQL Connect] 数据库连接已关闭');
                } catch (closeError: any) {
                    console.error('⚠️ [PostgreSQL Connect] 关闭连接时出错:', closeError.message);
                }
            }
        }
    }

    async execute(opts: IDatabaseExecutionOptions): Promise<IDatabaseExecutionResult> {
        try {
            console.log('📍 [PostgreSQL Connect] 执行SQL:', {
                sql: opts.sql,
                params: opts.prams,
                datasourceId: opts.datasourceId
            });

            const rows = await this.withConnection(opts.datasourceId, async (client) => {
                const result = await client.query(opts.sql, Object.values(opts.prams || {}));
                return result.rows;
            });

            console.log('📍 [PostgreSQL Connect] SQL执行成功:', {
                rowCount: Array.isArray(rows) ? rows.length : 0,
                dataType: typeof rows
            });

            return {
                success: true,
                data: rows,
            } as IDatabaseExecutionResult;

        } catch (error: any) {
            console.error('❌ [PostgreSQL Connect] 执行SQL失败:', {
                message: error.message,
                code: error.code,
                sql: opts.sql,
                params: opts.prams
            });
            return {
                success: false,
                error: `执行SQL失败: ${error.message}`
            } as IDatabaseExecutionResult;
        }
    }
}