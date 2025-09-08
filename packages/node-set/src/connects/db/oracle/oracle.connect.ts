import {
    Icon,
    IDatabaseMetadataOptions,
    IDatabaseMetadataResult,
    IDatabaseExecutionOptions,
    IDatabaseExecutionResult,
    ConnectTestResult
} from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';

/**
 * Oracle 数据库连接定义
 */
export class OracleConnect extends BaseDatabaseConnect {
    override overview = {
        id: 'oracle',
        name: 'Oracle',
        type: 'db' as const,
        provider: 'oracle' as const,
        icon: 'oracle.svg' as Icon,
        description: 'Oracle关系型数据库连接',
        version: '1.0.0',
    };

    override detail = {
        defaultPort: 1521,
        supportedFeatures: [
            'transactions' as const,
            'stored_procedures' as const,
            'views' as const,
            'triggers' as const,
            'full_text_search' as const
        ],
        fields: [
            {
                label: '主机地址',
                fieldName: 'host',
                description: 'Oracle服务器的主机地址',
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
                description: 'Oracle服务器端口号',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 1521,
                    validation: {
                        required: true
                    }
                }
            },
            {
                label: '连接类型',
                fieldName: 'connectionType',
                description: 'Oracle连接类型',
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'sid',
                    options: [
                        { name: 'SID', value: 'sid' },
                        { name: 'Service Name', value: 'service' },
                        { name: 'TNS', value: 'tns' }
                    ]
                }
            },
            {
                label: 'SID/服务名',
                fieldName: 'sid',
                description: 'Oracle SID或服务名',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: 'ORCL',
                    validation: {
                        required: true
                    },
                    placeholder: 'ORCL, XE, XEPDB1等'
                },
                conditionRules: {
                    showBy: {
                        connectionType: ['sid', 'service']
                    }
                }
            },
            {
                label: 'TNS连接字符串',
                fieldName: 'tnsConnectString',
                description: 'TNS连接字符串',
                control: {
                    name: 'textarea' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SID=ORCL)))'
                },
                conditionRules: {
                    showBy: {
                        connectionType: ['tns']
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
                label: '角色',
                fieldName: 'role',
                description: 'Oracle连接角色',
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'normal',
                    options: [
                        { name: '普通用户', value: 'normal' },
                        { name: 'SYSDBA', value: 'sysdba' },
                        { name: 'SYSOPER', value: 'sysoper' }
                    ]
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
            // {
            //     label: '连接池大小',
            //     fieldName: 'poolSize',
            //     description: '连接池最大连接数',
            //     control: {
            //         name: 'input' as const,
            //         dataType: 'number' as const,
            //         defaultValue: 10
            //     }
            // },
            // {
            //     label: '连接超时(秒)',
            //     fieldName: 'connectionTimeout',
            //     description: '连接超时时间，单位：秒',
            //     control: {
            //         name: 'input' as const,
            //         dataType: 'number' as const,
            //         defaultValue: 30
            //     }
            // },
            // {
            //     label: '语句超时(秒)',
            //     fieldName: 'statementTimeout',
            //     description: 'SQL语句执行超时时间，单位：秒',
            //     control: {
            //         name: 'input' as const,
            //         dataType: 'number' as const,
            //         defaultValue: 30
            //     }
            // }
        ],
        validateConnection: true,
        connectionTimeout: 30000
    };

    /**
     * 测试Oracle连接
     */
    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        try {
            // 验证必填字段
            const requiredFields = ['host', 'port', 'sid', 'username'];
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
                user: opts.user,
                password: opts.password,
                connectString: `${opts.host}:${opts.port}/${opts.database}`,
                connectTimeout: (opts.connectTimeout || 30) * 1000,
            };
            return await this.getTableNames(connectionConfig, opts.search);
        } catch (error: any) {
            console.error('❌ [Oracle Connect] metadata 执行错误:', error.message);
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
            const tables = await this.withConnection(connectionConfig, async (connection) => {
                // 查询表名
                let query = 'SELECT table_name FROM user_tables';
                const values = [];

                // 如果有搜索关键词，添加过滤条件
                if (search) {
                    query += ' WHERE table_name LIKE :search';
                    values.push(`%${search.toUpperCase()}%`);
                }
                query += ' ORDER BY table_name';

                const result = await connection.execute(query, values);
                // 格式化结果
                return (result.rows as any[]).map((row) => ({
                    value: row[0],
                    label: row[0]
                }));
            });

            return {
                success: true,
                data: tables
            };

        } catch (error: any) {
            console.error('❌ [Oracle Connect] 获取表名失败:', error.message);
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
        callback: (connection: any) => Promise<T>
    ): Promise<T> {
        let connection: any = null;
        try {
            // 尝试动态导入 oracledb 驱动
            let oracledb: any;
            try {
                oracledb = await import('oracledb');
            } catch (error) {
                throw new Error(`Oracle驱动(oracledb)未安装: ${error instanceof Error ? error.message : String(error)}`);
            }

            // 创建连接
            connection = await oracledb.getConnection(connectionConfig);
            console.log('✅ [Oracle Connect] 数据库连接已建立');

            // 执行回调函数
            const result = await callback(connection);

            return result;

        } catch (error: any) {
            console.error('❌ [Oracle Connect] 连接操作失败:', error.message);
            throw error;
        } finally {
            // 确保连接总是被正确关闭
            if (connection) {
                try {
                    await connection.close();
                    console.log('✅ [Oracle Connect] 数据库连接已关闭');
                } catch (closeError: any) {
                    console.error('⚠️ [Oracle Connect] 关闭连接时出错:', closeError.message);
                }
            }
        }
    }

    async execute(opts: IDatabaseExecutionOptions): Promise<IDatabaseExecutionResult> {
        try {
            console.log('📍 [Oracle Connect] 执行SQL:', {
                sql: opts.sql,
                params: opts.prams,
                datasourceId: opts.datasourceId
            });

            const rows = await this.withConnection(opts.datasourceId, async (connection) => {
                const result = await connection.execute(opts.sql, Object.values(opts.prams || {}));
                return result.rows;
            });

            console.log('📍 [Oracle Connect] SQL执行成功:', {
                rowCount: Array.isArray(rows) ? rows.length : 0,
                dataType: typeof rows
            });

            return {
                success: true,
                data: rows,
            } as IDatabaseExecutionResult;

        } catch (error: any) {
            console.error('❌ [Oracle Connect] 执行SQL失败:', {
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