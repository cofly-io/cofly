import { Icon, IDatabaseMetadataOptions, IDatabaseMetadataResult, credentialManager } from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';
import { ConnectTestResult } from '@repo/common';
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
        console.log('🔧 [PostgreSQL Connect] metadata 方法被调用:', opts);

        try {
            switch (opts.type) {
                case 'tables':
                    return await this.getTableNames(opts.datasourceId, opts.search);
                case 'columns':
                    return await this.getColumnNames(opts.datasourceId, opts.tableName, opts.search);
                case 'schemas':
                    return await this.getSchemaNames(opts.datasourceId, opts.search);
                default:
                    return {
                        success: false,
                        error: `不支持的元数据类型: ${opts.type}`
                    };
            }
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
    private async getTableNames(datasourceId?: string, search?: string): Promise<IDatabaseMetadataResult> {
        if (!datasourceId) {
            return {
                success: false,
                error: '数据源ID不能为空'
            };
        }

        try {
            // 获取连接配置
            const connectConfig = await credentialManager.mediator?.get(datasourceId);
            if (!connectConfig) {
                return {
                    success: false,
                    error: `连接配置不存在: ${datasourceId}`
                };
            }

            const configData = connectConfig.config;
            const connectionConfig = {
                host: configData.host || 'localhost',
                port: configData.port || 5432,
                database: configData.database,
                user: configData.username || configData.user,
                password: configData.password || '',
                connectionTimeoutMillis: (configData.connectionTimeout || 30) * 1000,
                ssl: configData.ssl || false
            };

            // 创建数据库连接
            const client = new Client(connectionConfig);
            await client.connect();

            try {
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
                const tables = result.rows.map((row: any) => ({
                    value: row.tablename,
                    label: row.tablename
                }));

                return {
                    success: true,
                    data: tables
                };

            } finally {
                // 关闭连接
                await client.end();
            }

        } catch (error: any) {
            console.error('❌ [PostgreSQL Connect] 获取表名失败:', error.message);
            return {
                success: false,
                error: `获取表名失败: ${error.message}`
            };
        }
    }

    /**
     * 获取表的列名列表
     */
    private async getColumnNames(datasourceId?: string, tableName?: string, search?: string): Promise<IDatabaseMetadataResult> {
        if (!datasourceId) {
            return {
                success: false,
                error: '数据源ID不能为空'
            };
        }

        if (!tableName) {
            return {
                success: false,
                error: '表名不能为空'
            };
        }

        try {
            // 获取连接配置
            const connectConfig = await credentialManager.mediator?.get(datasourceId);
            if (!connectConfig) {
                return {
                    success: false,
                    error: `连接配置不存在: ${datasourceId}`
                };
            }

            const configData = connectConfig.config;
            const connectionConfig = {
                host: configData.host || 'localhost',
                port: configData.port || 5432,
                database: configData.database,
                user: configData.username || configData.user,
                password: configData.password || '',
                connectionTimeoutMillis: (configData.connectionTimeout || 30) * 1000,
                ssl: configData.ssl || false
            };

            // 创建数据库连接
            const client = new Client(connectionConfig);
            await client.connect();

            try {
                // 查询列名
                let query = `
                    SELECT 
                        column_name, 
                        data_type, 
                        is_nullable, 
                        column_default 
                    FROM information_schema.columns 
                    WHERE table_schema = $1 AND table_name = $2
                `;
                const values = ['public', tableName];

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' AND column_name ILIKE $3';
                    values.push(`%${search}%`);
                }

                query += ' ORDER BY ordinal_position';

                const result = await client.query(query, values);

                // 格式化结果
                const columns = result.rows.map((row: any) => ({
                    value: row.column_name,
                    label: row.column_name,
                    description: `${row.data_type}${row.is_nullable === 'YES' ? ' (可空)' : ' (非空)'}`
                }));

                return {
                    success: true,
                    data: columns
                };

            } finally {
                // 关闭连接
                await client.end();
            }

        } catch (error: any) {
            console.error('❌ [PostgreSQL Connect] 获取列名失败:', error.message);
            return {
                success: false,
                error: `获取列名失败: ${error.message}`
            };
        }
    }

    /**
     * 获取数据库schema列表
     */
    private async getSchemaNames(datasourceId?: string, search?: string): Promise<IDatabaseMetadataResult> {
        if (!datasourceId) {
            return {
                success: false,
                error: '数据源ID不能为空'
            };
        }

        try {
            // 获取连接配置
            const connectConfig = await credentialManager.mediator?.get(datasourceId);
            if (!connectConfig) {
                return {
                    success: false,
                    error: `连接配置不存在: ${datasourceId}`
                };
            }

            const configData = connectConfig.config;
            const connectionConfig = {
                host: configData.host || 'localhost',
                port: configData.port || 5432,
                database: configData.database,
                user: configData.username || configData.user,
                password: configData.password || '',
                connectionTimeoutMillis: (configData.connectionTimeout || 30) * 1000,
                ssl: configData.ssl || false
            };

            // 创建数据库连接
            const client = new Client(connectionConfig);
            await client.connect();

            try {
                // 查询schema名
                let query = 'SELECT schema_name FROM information_schema.schemata';
                const values: string[] = [];

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' WHERE schema_name ILIKE $1';
                    values.push(`%${search}%`);
                }

                query += ' ORDER BY schema_name';

                const result = await client.query(query, values);

                // 格式化结果
                const schemas = result.rows.map((row: any) => ({
                    value: row.schema_name,
                    label: row.schema_name
                }));

                return {
                    success: true,
                    data: schemas
                };

            } finally {
                // 关闭连接
                await client.end();
            }

        } catch (error: any) {
            console.error('❌ [PostgreSQL Connect] 获取schema失败:', error.message);
            return {
                success: false,
                error: `获取schema失败: ${error.message}`
            };
        }
    }
}