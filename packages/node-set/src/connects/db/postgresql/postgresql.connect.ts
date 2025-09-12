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
                    defaultValue: 'postgres',
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
            }
        ],
        validateConnection: true,
        connectionTimeout: 10000
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

            // 实际连接测试
            const connectionConfig = {
                host: config.host,
                port: parseInt(config.port),
                user: config.username,
                password: config.password,
                database: config.database,
                ssl: config.ssl ? { rejectUnauthorized: false } : false,
                connectionTimeoutMillis: (config.connectionTimeout || 10) * 1000,
            };

            let client: Client | null = null;
            try {
                client = new Client(connectionConfig);
                await client.connect();

                // 执行简单查询测试连接并获取版本信息
                const result = await client.query('SELECT version() as version');
                const serverVersion = result.rows[0]?.version || '未知版本';

                const latency = Date.now() - startTime;

                return {
                    success: true,
                    message: 'PostgreSQL连接测试成功',
                    latency,
                    details: {
                        host: config.host,
                        port: config.port,
                        database: config.database,
                        schema: config.schema || 'public',
                        ssl: config.ssl || false,
                        connectionTimeout: config.connectionTimeout || 10,
                        connectionLimit: config.connectionLimit || 10,
                        serverVersion: serverVersion
                    }
                };
            } finally {
                if (client) {
                    await client.end();
                }
            }

        } catch (error) {
            return {
                success: false,
                message: `PostgreSQL连接失败: ${error instanceof Error ? error.message : String(error)}`,
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
                schema: opts.schema || 'public',
                ssl: opts.ssl ? { rejectUnauthorized: false } : false,
                connectionTimeoutMillis: (opts.connectTimeout || 10) * 1000,
                // 确保使用UTF-8编码
                client_encoding: 'UTF8'
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
                let query = `
                    SELECT 
                        schemaname as schema_name,
                        tablename as object_name,
                        'table' as object_type,
                        schemaname || '.' || tablename as full_name
                    FROM pg_tables 
                    WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                    
                    UNION ALL
                    
                    SELECT 
                        schemaname as schema_name,
                        viewname as object_name,
                        'view' as object_type,
                        schemaname || '.' || viewname as full_name
                    FROM pg_views 
                    WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                `;
                const values: any[] = [];

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' AND object_name ILIKE $1';
                    values.push(`%${search}%`);
                }
                query += ' ORDER BY schema_name, object_type, object_name';

                const result = await client.query(query, values);

                // 格式化结果 - 如果对象在 public schema 中，只显示对象名，否则显示 schema.object
                return result.rows.map((row: any) => ({
                    value: row.schema_name === 'public' ? row.object_name : row.full_name,
                    label: row.schema_name === 'public'
                        // ? `${row.object_name} (${row.object_type})`
                        // : `${row.schema_name}.${row.object_name} (${row.object_type})`
                        ? `${row.object_name}`
                        : `${row.schema_name}.${row.object_name}`
                }));
            });

            return {
                success: true,
                data: tables
            };

        } catch (error: any) {
            // 处理常见的PostgreSQL错误
            let errorMessage = error.message;
            if (error.code === '28P01') {
                errorMessage = '用户名或密码认证失败，请检查数据库连接配置';
            } else if (error.code === '3D000') {
                errorMessage = '数据库不存在，请检查数据库名称';
            } else if (error.code === 'ECONNREFUSED') {
                errorMessage = '无法连接到数据库服务器，请检查主机地址和端口';
            } else if (error.code === 'ENOTFOUND') {
                errorMessage = '无法解析主机地址，请检查主机名';
            }
            return {
                success: false,
                error: `获取表名失败: ${errorMessage}`
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
            // 执行回调函数
            const result = await callback(client);

            return result;

        } catch (error: any) {
            throw error;
        } finally {
            // 确保连接总是被正确关闭
            if (client) {
                try {
                    await client.end();
                } catch (closeError: any) {
                    console.error('⚠️ [PostgreSQL Connect] 关闭连接时出错:', closeError.message);
                }
            }
        }
    }

    async execute(opts: IDatabaseExecutionOptions): Promise<IDatabaseExecutionResult> {
        try {
            const rows = await this.withConnection(opts.datasourceId, async (client) => {
                const result = await client.query(opts.sql, Object.values(opts.prams || {}));
                return result.rows;
            });

            return {
                success: true,
                data: rows,
            } as IDatabaseExecutionResult;

        } catch (error: any) {
            return {
                success: false,
                error: `执行SQL失败: ${error.message}`
            } as IDatabaseExecutionResult;
        }
    }
}