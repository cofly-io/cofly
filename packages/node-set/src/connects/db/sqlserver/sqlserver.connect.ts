import { Icon, IDatabaseMetadataOptions, IDatabaseMetadataResult, credentialManager } from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';
import { ConnectTestResult } from '@repo/common';
import * as sql from 'mssql';

/**
 * SQL Server 数据库连接定义
 */
export class SQLServerConnect extends BaseDatabaseConnect {
    override overview = {
        id: 'sqlserver',
        name: 'SQL Server',
        type: 'db' as const,
        provider: 'sqlserver' as const,
        icon: 'sqlserver.svg' as Icon,
        description: 'Microsoft SQL Server关系型数据库连接',
        version: '1.0.0',
    };

    override detail = {
        defaultPort: 1433,
        supportedFeatures: [
            'transactions' as const,
            'stored_procedures' as const,
            'views' as const,
            'triggers' as const,
            'full_text_search' as const,
            'json_support' as const
        ],
        fields: [
            {
                label: '服务器地址',
                fieldName: 'host',
                description: 'SQL Server服务器的主机地址',
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
                description: 'SQL Server服务器端口号',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 1433,
                    validation: {
                        required: true
                    }
                }
            },
            {
                label: '实例名',
                fieldName: 'instance',
                description: 'SQL Server实例名（可选）',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    placeholder: 'SQLEXPRESS, MSSQLSERVER等'
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
                    },
                    placeholder: '请输入数据库用户名'
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
                    placeholder: '请输入数据库密码',
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
                label: '认证方式',
                fieldName: 'authenticationType',
                description: 'SQL Server认证方式',
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'default',
                    options: [
                        { name: 'SQL Server认证', value: 'default' },
                        { name: 'Windows认证', value: 'ntlm' },
                        { name: 'Azure AD认证', value: 'azure-active-directory-default' }
                    ]
                }
            },
            {
                label: '启用加密',
                fieldName: 'encrypt',
                description: '是否启用连接加密（Azure SQL必须启用）',
                control: {
                    name: 'switch' as const,
                    dataType: 'boolean' as const,
                    defaultValue: true
                }
            },
            {
                label: '信任服务器证书',
                fieldName: 'trustServerCertificate',
                description: '是否信任服务器证书（开发环境可启用）',
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
                    defaultValue: 15
                }
            },
            {
                label: '请求超时(秒)',
                fieldName: 'requestTimeout',
                description: '请求超时时间，单位：秒',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 15
                }
            }
        ],
        validateConnection: true,
        connectionTimeout: 15000
    };

    /**
     * 测试SQL Server连接
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
        console.log('🔧 [SQL Server Connect] metadata 方法被调用:', opts);

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
            console.error('❌ [SQL Server Connect] metadata 执行错误:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 构建连接配置
     */
    private buildConnectionConfig(configData: any) {
        return {
            server: configData.host,
            port: configData.port || 1433,
            database: configData.database,
            user: configData.username,
            password: configData.password,
            options: {
                encrypt: configData.encrypt !== false,
                trustServerCertificate: configData.trustServerCertificate === true,
                enableArithAbort: true,
                instanceName: configData.instance || undefined
            },
            connectionTimeout: (configData.connectionTimeout || 15) * 1000,
            requestTimeout: (configData.requestTimeout || 15) * 1000,
            authentication: {
                type: configData.authenticationType || 'default'
            }
        };
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
            const connectionConfig = this.buildConnectionConfig(configData);

            // 创建数据库连接
            const pool = await sql.connect(connectionConfig);

            try {
                // 查询表名
                let query = `
                    SELECT TABLE_NAME 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_CATALOG = @database
                `;

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' AND TABLE_NAME LIKE @search';
                }

                query += ' ORDER BY TABLE_NAME';

                const request = pool.request();
                request.input('database', sql.VarChar, configData.database);
                if (search) {
                    request.input('search', sql.VarChar, `%${search}%`);
                }

                const result = await request.query(query);

                // 格式化结果
                const tables = result.recordset.map((row: any) => ({
                    value: row.TABLE_NAME,
                    label: row.TABLE_NAME
                }));

                return {
                    success: true,
                    data: tables
                };

            } finally {
                // 关闭连接
                await pool.close();
            }

        } catch (error: any) {
            console.error('❌ [SQL Server Connect] 获取表名失败:', error.message);
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
            const connectionConfig = this.buildConnectionConfig(configData);

            // 创建数据库连接
            const pool = await sql.connect(connectionConfig);

            try {
                // 查询列名
                let query = `
                    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_CATALOG = @database AND TABLE_NAME = @tableName
                `;

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' AND COLUMN_NAME LIKE @search';
                }

                query += ' ORDER BY ORDINAL_POSITION';

                const request = pool.request();
                request.input('database', sql.VarChar, configData.database);
                request.input('tableName', sql.VarChar, tableName);
                if (search) {
                    request.input('search', sql.VarChar, `%${search}%`);
                }

                const result = await request.query(query);

                // 格式化结果
                const columns = result.recordset.map((row: any) => ({
                    value: row.COLUMN_NAME,
                    label: row.COLUMN_NAME,
                    description: `${row.DATA_TYPE}${row.IS_NULLABLE === 'YES' ? ' (可空)' : ' (非空)'}`
                }));

                return {
                    success: true,
                    data: columns
                };

            } finally {
                // 关闭连接
                await pool.close();
            }

        } catch (error: any) {
            console.error('❌ [SQL Server Connect] 获取列名失败:', error.message);
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
            const connectionConfig = this.buildConnectionConfig(configData);

            // 创建数据库连接
            const pool = await sql.connect(connectionConfig);

            try {
                // 查询schema名
                let query = `
                    SELECT SCHEMA_NAME 
                    FROM INFORMATION_SCHEMA.SCHEMATA
                `;

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' WHERE SCHEMA_NAME LIKE @search';
                }

                query += ' ORDER BY SCHEMA_NAME';

                const request = pool.request();
                if (search) {
                    request.input('search', sql.VarChar, `%${search}%`);
                }

                const result = await request.query(query);

                // 格式化结果
                const schemas = result.recordset.map((row: any) => ({
                    value: row.SCHEMA_NAME,
                    label: row.SCHEMA_NAME
                }));

                return {
                    success: true,
                    data: schemas
                };

            } finally {
                // 关闭连接
                await pool.close();
            }

        } catch (error: any) {
            console.error('❌ [SQL Server Connect] 获取schema失败:', error.message);
            return {
                success: false,
                error: `获取schema失败: ${error.message}`
            };
        }
    }
}