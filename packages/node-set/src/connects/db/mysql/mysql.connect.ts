import { credentialManager, Icon, IDatabaseMetadataOptions, IDatabaseMetadataResult } from '@repo/common';
import { ConnectTestResult } from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';
import mysql from "mysql2/promise";
import { IDatabaseExecutionOptions, IDatabaseExecutionResult } from "@repo/common";

/**
 * 连接操作回调函数类型
 */
type ConnectionCallback<T> = (connection: mysql.Connection) => Promise<T>;

/**
 * MySQL 数据库连接器类
 */
export class MySQLConnect extends BaseDatabaseConnect {

    override overview = {
        id: 'mysql',
        name: 'MySQL',
        type: 'db' as const,
        provider: 'mysql' as const,
        icon: 'mysql.svg' as Icon,
        description: 'MySQL关系型数据库连接',
        version: '1.0.0'
    };
    override detail = {
        defaultPort: 3306,
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
                displayName: '主机地址',
                name: 'host',
                type: 'string' as const,
                default: 'localhost',
                description: 'MySQL服务器的主机地址',
                placeholder: 'localhost 或 IP地址',
                required: true,
                controlType: "input"
            },
            {
                displayName: '数据库名',
                name: 'database',
                type: 'string' as const,
                default: '',
                description: '要连接的数据库名称',
                required: true,
                controlType: "input"
            },
            {
                displayName: '用户名',
                name: 'username',
                type: 'string' as const,
                default: '',
                placeholder: "请输入数据库用户名",
                description: '数据库用户名',
                required: true,
                controlType: "input"
            },
            {
                displayName: '密码',
                name: 'password',
                type: 'string' as const,
                default: '',
                description: '数据库密码',
                placeholder: "请输入数据库密码",
                typeOptions: {
                    password: true
                },
                isSecure: true,
                controlType: "input"
            },
            {
                displayName: '端口',
                name: 'port',
                type: 'number' as const,
                default: 3306,
                description: 'MySQL服务器端口号',
                typeOptions: {
                    minValue: 1,
                    maxValue: 65535
                },
                required: true,
                controlType: "input"
            },
            {
                displayName: '查询超时(秒)',
                name: 'queryTimeout',
                type: 'number' as const,
                default: 30,
                description: '查询超时时间，单位：秒',
                typeOptions: {
                    minValue: 1,
                    maxValue: 3600
                },
                controlType: "input"
            },
            {
                displayName: '启用SSL',
                name: 'ssl',
                type: 'boolean' as const,
                default: false,
                description: '是否启用SSL连接',
                controlType: "checkbox"
            },
            // {
            //     displayName: '字符集',
            //     name: 'charset',
            //     type: 'options' as const,
            //     default: 'utf8mb4',
            //     description: '数据库字符集',
            //     options: [
            //         { name: 'UTF-8 (推荐)', value: 'utf8mb4' },
            //         { name: 'UTF-8', value: 'utf8' },
            //         { name: 'Latin1', value: 'latin1' },
            //         { name: 'ASCII', value: 'ascii' }
            //     ],
            //     controlType: "select"
            // },

            // {
            //     displayName: '连接池大小',
            //     name: 'poolSize',
            //     type: 'number' as const,
            //     default: 10,
            //     description: '连接池最大连接数',
            //     typeOptions: {
            //         minValue: 1,
            //         maxValue: 100
            //     },
            //     controlType: "input"
            // }
        ],
        validateConnection: true,
        connectionTimeout: 10000
    };

    /**
     * 测试MySQL连接
     */
    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        try {
            // 验证必填字段
            const requiredFields = ['host', 'port', 'username', 'database'];
            for (const field of requiredFields) {
                if (!config[field]) {
                    return {
                        success: false,
                        message: `缺少必填字段: ${field}`
                    };
                }
            }

            // 尝试使用mysql2或mysql驱动
            let connectionResult;

            try {
                // 首先尝试使用推荐的mysql2驱动
                connectionResult = await testWithMysql2Driver(config);
            } catch (mysql2Error) {
                try {
                    // 如果mysql2不可用，尝试使用经典mysql驱动
                    connectionResult = await testWithMysqlDriver(config);
                } catch (mysqlError) {
                    // 如果两个驱动都不可用，返回详细错误信息
                    return {
                        success: false,
                        message: `MySQL连接失败。尝试的驱动程序都不可用:\n` +
                            `MySQL2驱动(mysql2): ${mysql2Error instanceof Error ? mysql2Error.message : String(mysql2Error)}\n` +
                            `MySQL经典驱动(mysql): ${mysqlError instanceof Error ? mysqlError.message : String(mysqlError)}`,
                        details: {
                            mysql2DriverError: mysql2Error instanceof Error ? mysql2Error.message : String(mysql2Error),
                            mysqlDriverError: mysqlError instanceof Error ? mysqlError.message : String(mysqlError),
                            suggestion: "请安装MySQL2驱动 'npm install mysql2' 或经典MySQL驱动 'npm install mysql'"
                        }
                    };
                }
            }

            const latency = Date.now() - startTime;

            return {
                success: true,
                message: `MySQL连接测试成功 (${connectionResult.driverUsed})`,
                latency,
                details: {
                    host: config.host,
                    port: config.port,
                    database: config.database,
                    charset: config.charset || 'utf8mb4',
                    ssl: config.ssl || false,
                    poolSize: config.poolSize || 10,
                    connectionTimeout: config.connectionTimeout || 10,
                    queryTimeout: config.queryTimeout || 30,
                    driverUsed: connectionResult.driverUsed,
                    serverVersion: connectionResult.serverVersion
                }
            };

        } catch (error) {
            return {
                success: false,
                message: `MySQL连接失败: ${error instanceof Error ? error.message : String(error)}`,
                latency: Date.now() - startTime
            };
        }
    }

    async metadata(opts: IDatabaseMetadataOptions): Promise<IDatabaseMetadataResult> {
        console.log('🔧 [MySQL Node] metadata 方法被调用:', opts);
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
            console.error('❌ [MySQL Node] metadata 执行错误:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

     /**
     * 统一的连接管理函数
     * 自动处理连接的创建、使用和关闭
     */
     private async withConnection<T>(
        datasourceId: string,
        callback: ConnectionCallback<T>
    ): Promise<T> {
        let connection: mysql.Connection | null = null;

        try {
            // 获取连接配置
            const connectConfig = await credentialManager.mediator?.get(datasourceId);
            if (!connectConfig) {
                throw new Error(`连接配置不存在: ${datasourceId}`);
            }

            const configData = connectConfig.config;
            const connectionConfig = {
                host: configData.host || 'localhost',
                port: configData.port || 3306,
                database: configData.database,
                user: configData.username || configData.user,
                password: configData.password || '',
                connectTimeout: (configData.connectionTimeout || 30) * 1000,
                ssl: configData.ssl || false
            };

            // 创建连接
            connection = await mysql.createConnection(connectionConfig);
            console.log('✅ [MySQL Connect] 数据库连接已建立');

            // 执行回调函数
            const result = await callback(connection);

            return result;

        } catch (error: any) {
            console.error('❌ [MySQL Connect] 连接操作失败:', error.message);
            throw error;
        } finally {
            // 确保连接总是被正确关闭
            if (connection) {
                try {
                    await connection.end();
                    console.log('✅ [MySQL Connect] 数据库连接已关闭');
                } catch (closeError: any) {
                    console.error('⚠️ [MySQL Connect] 关闭连接时出错:', closeError.message);
                }
            }
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
            const tables = await this.withConnection(datasourceId, async (connection) => {
                // 获取数据库名称（用于查询）
                const connectConfig = await credentialManager.mediator?.get(datasourceId);
                const databaseName = connectConfig?.config?.database;

                // 查询表名
                let query = 'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = ?';
                const values = [databaseName];

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' AND TABLE_NAME LIKE ?';
                    values.push(`%${search}%`);
                }

                query += ' ORDER BY TABLE_NAME';

                const [rows] = await connection.execute(query, values);

                // 格式化结果
                return (rows as any[]).map((row) => ({
                    value: row.TABLE_NAME || row.table_name,
                    label: row.TABLE_NAME || row.table_name
                }));
            });

            return {
                success: true,
                data: tables
            };

        } catch (error: any) {
            console.error('❌ [MySQL Node] 获取表名失败:', error.message);
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
            const columns = await this.withConnection(datasourceId, async (connection) => {
                // 获取数据库名称（用于查询）
                const connectConfig = await credentialManager.mediator?.get(datasourceId);
                const databaseName = connectConfig?.config?.database;

                // 查询列名
                let query = 'SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = ? AND table_name = ?';
                const values = [databaseName, tableName];

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' AND COLUMN_NAME LIKE ?';
                    values.push(`%${search}%`);
                }

                query += ' ORDER BY ORDINAL_POSITION';

                const [rows] = await connection.execute(query, values);

                // 格式化结果
                return (rows as any[]).map((row) => ({
                    value: row.COLUMN_NAME || row.column_name,
                    label: row.COLUMN_NAME || row.column_name,
                    description: `${row.DATA_TYPE || row.data_type}${row.IS_NULLABLE === 'YES' ? ' (可空)' : ' (非空)'}`
                }));
            });

            return {
                success: true,
                data: columns
            };

        } catch (error: any) {
            console.error('❌ [MySQL Node] 获取列名失败:', error.message);
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
            const schemas = await this.withConnection(datasourceId, async (connection) => {
                // 查询schema名
                let query = 'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA';
                const values: string[] = [];

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' WHERE SCHEMA_NAME LIKE ?';
                    values.push(`%${search}%`);
                }

                query += ' ORDER BY SCHEMA_NAME';

                const [rows] = await connection.execute(query, values);

                // 格式化结果
                return (rows as any[]).map((row) => ({
                    value: row.SCHEMA_NAME || row.schema_name,
                    label: row.SCHEMA_NAME || row.schema_name
                }));
            });

            return {
                success: true,
                data: schemas
            };

        } catch (error: any) {
            console.error('❌ [MySQL Node] 获取schema失败:', error.message);
            return {
                success: false,
                error: `获取schema失败: ${error.message}`
            };
        }
    }

    async execute(opts: IDatabaseExecutionOptions): Promise<IDatabaseExecutionResult> {
        try {
            console.log('📍 [MySQL Connect] 执行SQL:', {
                sql: opts.sql,
                params: opts.prams,
                datasourceId: opts.datasourceId
            });

            const rows = await this.withConnection(opts.datasourceId, async (connection) => {
                const [result] = await connection.execute(opts.sql, Object.values(opts.prams || {}));
                return result;
            });

            console.log('📍 [MySQL Connect] SQL执行成功:', {
                rowCount: Array.isArray(rows) ? rows.length : 0,
                dataType: typeof rows
            });

            return {
                success: true,
                data: rows,
            } as IDatabaseExecutionResult;

        } catch (error: any) {
            console.error('❌ [MySQL Connect] 执行SQL失败:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
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

/**
 * 使用mysql2驱动测试连接
 */
async function testWithMysql2Driver(config: Record<string, any>): Promise<{ driverUsed: string; serverVersion?: string }> {
    // 动态导入mysql2驱动
    let mysql: any;
    try {
        mysql = await import('mysql2/promise');
    } catch (error) {
        throw new Error(`MySQL2驱动(mysql2)未安装: ${error instanceof Error ? error.message : String(error)}`);
    }

    const connectionConfig = {
        host: config.host,
        port: parseInt(config.port),
        user: config.username,
        password: config.password,
        database: config.database,
        charset: config.charset || 'utf8mb4',
        ssl: config.ssl ? {} : false,
        connectTimeout: (config.connectionTimeout || 10) * 1000,
        acquireTimeout: (config.connectionTimeout || 10) * 1000,
        timeout: (config.queryTimeout || 30) * 1000,
        // 防止连接挂起
        socketPath: undefined
    };

    let connection: any = null;
    try {
        // 创建连接
        connection = await mysql.createConnection(connectionConfig);

        // 执行简单查询测试连接并获取版本信息
        const [rows] = await connection.execute('SELECT VERSION() as version');

        return {
            driverUsed: 'MySQL2驱动(mysql2)',
            serverVersion: rows[0]?.version || '未知版本'
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * 使用mysql经典驱动测试连接
 */
async function testWithMysqlDriver(config: Record<string, any>): Promise<{ driverUsed: string; serverVersion?: string }> {
    // 动态导入mysql驱动
    let mysql: any;
    try {
        mysql = await import('mysql');
    } catch (error) {
        throw new Error(`MySQL经典驱动(mysql)未安装: ${error instanceof Error ? error.message : String(error)}`);
    }

    const connectionConfig = {
        host: config.host,
        port: parseInt(config.port),
        user: config.username,
        password: config.password,
        database: config.database,
        charset: config.charset || 'utf8mb4',
        ssl: config.ssl ? {} : false,
        connectTimeout: (config.connectionTimeout || 10) * 1000,
        acquireTimeout: (config.connectionTimeout || 10) * 1000,
        timeout: (config.queryTimeout || 30) * 1000
    };

    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(connectionConfig);

        // 设置总超时时间
        const timeout = setTimeout(() => {
            connection.destroy();
            reject(new Error('连接超时'));
        }, (config.connectionTimeout || 10) * 1000);

        connection.connect((err: any) => {
            if (err) {
                clearTimeout(timeout);
                connection.destroy();
                reject(new Error(`MySQL经典驱动连接失败: ${err.message}`));
                return;
            }

            // 执行简单查询测试连接
            connection.query('SELECT VERSION() as version', (queryErr: any, results: any) => {
                clearTimeout(timeout);
                connection.end();

                if (queryErr) {
                    reject(new Error(`查询失败: ${queryErr.message}`));
                    return;
                }

                resolve({
                    driverUsed: 'MySQL经典驱动(mysql)',
                    serverVersion: results[0]?.version || '未知版本'
                });
            });
        });
    });
}