import { Icon } from '@repo/common';
import { ConnectTestResult } from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';

/**
 * 人大金仓（KingbaseES）数据库连接定义
 */
export class KingbaseConnect extends BaseDatabaseConnect {
    override overview = {
        id: 'kingbase',
        name: '人大金仓 KingbaseES',
        type: 'db' as const,
        provider: 'kingbase' as const,
        icon: 'kingbase.svg' as Icon,
        description: '人大金仓KingbaseES关系型数据库连接',
        version: '1.0.0',
    };

    override detail = {
        defaultPort: 54321,
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
                displayName: '主机地址',
                name: 'host',
                type: 'string' as const,
                default: 'localhost',
                description: 'KingbaseES服务器的主机地址',
                placeholder: 'localhost 或 IP地址',
                required: true,
                controlType: "input"
            },
            {
                displayName: '端口',
                name: 'port',
                type: 'number' as const,
                default: 54321,
                description: 'KingbaseES服务器端口号',
                typeOptions: {
                    minValue: 1,
                    maxValue: 65535
                },
                required: true,
                controlType: "input"
            },
            {
                displayName: '数据库名',
                name: 'database',
                type: 'string' as const,
                default: '',
                description: '要连接的数据库名称',
                placeholder: 'TEST, SAMPLE等',
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
                displayName: 'Schema',
                name: 'schema',
                type: 'string' as const,
                default: 'public',
                description: '默认Schema名称',
                placeholder: 'public, dbo等',
                controlType: "input"
            },
            {
                displayName: '兼容模式',
                name: 'compatibilityMode',
                type: 'options' as const,
                default: 'oracle',
                description: 'KingbaseES兼容模式',
                options: [
                    { name: 'Oracle兼容', value: 'oracle' },
                    { name: 'PostgreSQL兼容', value: 'postgresql' },
                    { name: 'MySQL兼容', value: 'mysql' }
                ],
                controlType: "select"
            },
            {
                displayName: '启用SSL',
                name: 'ssl',
                type: 'boolean' as const,
                default: false,
                description: '是否启用SSL连接',
                controlType: "CheckBox"
            },
            {
                displayName: '字符编码',
                name: 'charset',
                type: 'options' as const,
                default: 'UTF8',
                description: '数据库字符编码',
                options: [
                    { name: 'UTF-8', value: 'UTF8' },
                    { name: 'GBK', value: 'GBK' },
                    { name: 'GB18030', value: 'GB18030' },
                    { name: 'Latin1', value: 'LATIN1' }
                ],
                controlType: "select"
            },
            {
                displayName: '连接超时(秒)',
                name: 'connectionTimeout',
                type: 'number' as const,
                default: 30,
                description: '连接超时时间，单位：秒',
                typeOptions: {
                    minValue: 1,
                    maxValue: 300
                },
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
                displayName: '连接池大小',
                name: 'poolSize',
                type: 'number' as const,
                default: 10,
                description: '连接池最大连接数',
                typeOptions: {
                    minValue: 1,
                    maxValue: 100
                },
                controlType: "input"
            }
        ],
        validateConnection: true,
        connectionTimeout: 30000
    };

    /**
     * 测试KingbaseES连接
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

            // 尝试使用官方KingbaseES驱动或PostgreSQL兼容驱动
            let connectionResult;
            
            try {
                // 首先尝试使用官方KingbaseES驱动 'kb'
                connectionResult = await testWithKingbaseDriver(config);
            } catch (kbError) {
                try {
                    // 如果官方驱动不可用，尝试使用PostgreSQL兼容驱动
                    connectionResult = await testWithPostgreSQLDriver(config);
                } catch (pgError) {
                    // 如果两个驱动都不可用，返回详细错误信息
                    return {
                        success: false,
                        message: `KingbaseES连接失败。尝试的驱动程序都不可用:\n` +
                               `官方驱动(kb): ${kbError instanceof Error ? kbError.message : String(kbError)}\n` +
                               `PostgreSQL兼容驱动(pg): ${pgError instanceof Error ? pgError.message : String(pgError)}`,
                        details: {
                            officialDriverError: kbError instanceof Error ? kbError.message : String(kbError),
                            pgDriverError: pgError instanceof Error ? pgError.message : String(pgError),
                            suggestion: "请安装KingbaseES官方驱动 'npm install kb' 或PostgreSQL驱动 'npm install pg'"
                        }
                    };
                }
            }

            const latency = Date.now() - startTime;

            return {
                success: true,
                message: `KingbaseES连接测试成功 (${connectionResult.driverUsed})`,
                latency,
                details: {
                    host: config.host,
                    port: config.port,
                    database: config.database,
                    schema: config.schema || 'public',
                    compatibilityMode: config.compatibilityMode || 'oracle',
                    charset: config.charset || 'UTF8',
                    ssl: config.ssl || false,
                    poolSize: config.poolSize || 10,
                    connectionTimeout: config.connectionTimeout || 30,
                    queryTimeout: config.queryTimeout || 30,
                    driverUsed: connectionResult.driverUsed,
                    serverVersion: connectionResult.serverVersion
                }
            };

        } catch (error) {
            return {
                success: false,
                message: `KingbaseES连接失败: ${error instanceof Error ? error.message : String(error)}`,
                latency: Date.now() - startTime
            };
        }
    }
};


/**
 * 使用官方KingbaseES驱动测试连接
 */
async function testWithKingbaseDriver(config: Record<string, any>): Promise<{ driverUsed: string; serverVersion?: string }> {
    // 动态导入KingbaseES官方驱动
    let Client: any;
    try {
        const kbModule = await import('kb');
        Client = (kbModule as any).Client;
    } catch (error) {
        throw new Error(`KingbaseES官方驱动(kb)未安装: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    const client = new Client({
        user: config.username,
        host: config.host,
        database: config.database,
        password: config.password,
        port: parseInt(config.port),
        ssl: config.ssl || false,
        statement_timeout: (config.queryTimeout || 30) * 1000,
        query_timeout: (config.queryTimeout || 30) * 1000,
        connectionTimeoutMillis: (config.connectionTimeout || 30) * 1000
    });

    return new Promise((resolve, reject) => {
        // 设置总超时时间
        const timeout = setTimeout(() => {
            client.end();
            reject(new Error('连接超时'));
        }, (config.connectionTimeout || 30) * 1000);

        client.connect((err: any) => {
            clearTimeout(timeout);
            
            if (err) {
                client.end();
                reject(new Error(`KingbaseES官方驱动连接失败: ${err.message}`));
                return;
            }

            // 执行简单查询测试连接
            client.query('SELECT version() as version', (queryErr: any, result: any) => {
                client.end();
                
                if (queryErr) {
                    reject(new Error(`查询失败: ${queryErr.message}`));
                    return;
                }

                resolve({
                    driverUsed: 'KingbaseES官方驱动(kb)',
                    serverVersion: result.rows?.[0]?.version || '未知版本'
                });
            });
        });
    });
}

/**
 * 使用PostgreSQL兼容驱动测试连接
 */
async function testWithPostgreSQLDriver(config: Record<string, any>): Promise<{ driverUsed: string; serverVersion?: string }> {
    // 动态导入PostgreSQL驱动
    let Client: any;
    try {
        const pgModule = await import('pg');
        Client = (pgModule as any).Client;
    } catch (error) {
        throw new Error(`PostgreSQL驱动(pg)未安装: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    const client = new Client({
        user: config.username,
        host: config.host,
        database: config.database,
        password: config.password,
        port: parseInt(config.port),
        ssl: config.ssl ? { rejectUnauthorized: false } : false,
        statement_timeout: (config.queryTimeout || 30) * 1000,
        query_timeout: (config.queryTimeout || 30) * 1000,
        connectionTimeoutMillis: (config.connectionTimeout || 30) * 1000
    });

    return new Promise((resolve, reject) => {
        // 设置总超时时间
        const timeout = setTimeout(() => {
            client.end();
            reject(new Error('连接超时'));
        }, (config.connectionTimeout || 30) * 1000);

        client.connect()
            .then(() => {
                clearTimeout(timeout);
                
                // 执行简单查询测试连接
                return client.query('SELECT version() as version');
            })
            .then((result: any) => {
                client.end();
                resolve({
                    driverUsed: 'PostgreSQL兼容驱动(pg)',
                    serverVersion: result.rows?.[0]?.version || '未知版本'
                });
            })
            .catch((err: any) => {
                clearTimeout(timeout);
                client.end();
                reject(new Error(`PostgreSQL兼容驱动连接失败: ${err.message}`));
            });
    });
}


