import {
    Icon,
    IDatabaseMetadataOptions,
    IDatabaseMetadataResult,
    IDatabaseExecutionOptions,
    IDatabaseExecutionResult,
    ConnectTestResult
} from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';
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
        try {
            const connectionConfig = this.buildConnectionConfig({
                host: opts.host,
                port: opts.port,
                database: opts.database,
                username: opts.user,
                password: opts.password,
                ssl: opts.ssl,
                connectionTimeout: opts.connectTimeout || 15
            });
            return await this.getTableNames(connectionConfig, opts.search);
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
    private async getTableNames(connectionConfig?: any, search?: string): Promise<IDatabaseMetadataResult> {
        try {
            const tables = await this.withConnection(connectionConfig, async (pool) => {
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
                request.input('database', sql.VarChar, connectionConfig.database);
                if (search) {
                    request.input('search', sql.VarChar, `%${search}%`);
                }

                const result = await request.query(query);
                // 格式化结果
                return result.recordset.map((row: any) => ({
                    value: row.TABLE_NAME,
                    label: row.TABLE_NAME
                }));
            });

            return {
                success: true,
                data: tables
            };

        } catch (error: any) {
            console.error('❌ [SQL Server Connect] 获取表名失败:', error.message);
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
        callback: (pool: any) => Promise<T>
    ): Promise<T> {
        let pool: any = null;
        try {
            // 创建连接
            pool = await sql.connect(connectionConfig);
            console.log('✅ [SQL Server Connect] 数据库连接已建立');

            // 执行回调函数
            const result = await callback(pool);

            return result;

        } catch (error: any) {
            console.error('❌ [SQL Server Connect] 连接操作失败:', error.message);
            throw error;
        } finally {
            // 确保连接总是被正确关闭
            if (pool) {
                try {
                    await pool.close();
                    console.log('✅ [SQL Server Connect] 数据库连接已关闭');
                } catch (closeError: any) {
                    console.error('⚠️ [SQL Server Connect] 关闭连接时出错:', closeError.message);
                }
            }
        }
    }

    async execute(opts: IDatabaseExecutionOptions): Promise<IDatabaseExecutionResult> {
        try {
            console.log('📍 [SQL Server Connect] 执行SQL:', {
                sql: opts.sql,
                params: opts.prams,
                datasourceId: opts.datasourceId
            });

            const rows = await this.withConnection(opts.datasourceId, async (pool) => {
                const request = pool.request();
                const result = await request.query(opts.sql);
                return result.recordset;
            });

            console.log('📍 [SQL Server Connect] SQL执行成功:', {
                rowCount: Array.isArray(rows) ? rows.length : 0,
                dataType: typeof rows
            });

            return {
                success: true,
                data: rows,
            } as IDatabaseExecutionResult;

        } catch (error: any) {
            console.error('❌ [SQL Server Connect] 执行SQL失败:', {
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