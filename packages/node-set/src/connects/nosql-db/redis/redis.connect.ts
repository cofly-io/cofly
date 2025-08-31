import { Icon, ConnectTestResult } from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';

/**
 * Redis 数据库连接定义
 */
export class RedisConnect extends BaseDatabaseConnect {
    override overview = {
        id: 'redis',
        name: 'Redis',
        type: 'nosql-db' as const,
        provider: 'redis' as const,
        icon: 'redis.svg' as Icon,
        description: 'Redis键值数据库连接',
        version: '1.0.0'
    };

    override detail = {
        defaultPort: 6379,
        supportedFeatures: [
            'transactions' as const,
            'json_support' as const
        ],
        fields: [
            {
                displayName: '主机地址',
                name: 'host',
                type: 'string' as const,
                default: 'localhost',
                description: 'Redis服务器的主机地址',
                placeholder: 'localhost 或 IP地址',
                required: true,
                controlType: "input"
            },
            {
                displayName: '端口',
                name: 'port',
                type: 'number' as const,
                default: 6379,
                description: 'Redis服务器端口号',
                typeOptions: {
                    minValue: 1,
                    maxValue: 65535
                },
                required: true,
                controlType: "input"
            },
            {
                displayName: '密码',
                name: 'password',
                type: 'string' as const,
                default: '',
                description: 'Redis密码（如果设置了AUTH）',
                placeholder: "请输入Redis密码",
                typeOptions: {
                    password: true
                },
                isSecure: true,
                controlType: "input"
            },
            {
                displayName: '数据库索引',
                name: 'database',
                type: 'number' as const,
                default: 0,
                description: 'Redis数据库索引（0-15）',
                typeOptions: {
                    minValue: 0,
                    maxValue: 15
                },
                controlType: "input"
            },
            {
                displayName: '连接超时(秒)',
                name: 'connectTimeout',
                type: 'number' as const,
                default: 10,
                description: '连接超时时间，单位：秒',
                typeOptions: {
                    minValue: 1,
                    maxValue: 300
                },
                controlType: "input"
            }
        ],
        validateConnection: true,
        connectionTimeout: 10000
    };

    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();

        try {
            // 验证必填字段
            const requiredFields = ['host', 'port'];
            for (const field of requiredFields) {
                if (!config[field]) {
                    return {
                        success: false,
                        message: `缺少必填字段: ${field}`
                    };
                }
            }

            // 尝试使用redis驱动进行连接测试
            try {
                const result = await this.testRedisConnection(config);
                return result;
            } catch (redisError: any) {
                return {
                    success: false,
                    message: `Redis连接失败: ${redisError.message}`,
                    latency: Date.now() - startTime,
                    details: {
                        error: redisError.message,
                        driver: 'redis'
                    }
                };
            }

        } catch (error: any) {
            return {
                success: false,
                message: `连接测试异常: ${error.message}`,
                latency: Date.now() - startTime,
                details: {
                    error: error.message
                }
            };
        }
    }

    private async testRedisConnection(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        
        try {
            let redis: any;
            try {
                redis = await import('redis');
            } catch (importError) {
                throw new Error('Redis驱动未安装，请运行: npm install redis');
            }
            
            const client = redis.createClient({
                socket: {
                    host: config.host,
                    port: config.port,
                    connectTimeout: (config.connectTimeout || 10) * 1000
                },
                password: config.password || undefined,
                database: config.database || 0
            });

            await client.connect();
            
            // 执行ping命令测试连接
            const pong = await client.ping();
            
            // 获取服务器信息
            const info = await client.info();
            
            await client.disconnect();
            
            const latency = Date.now() - startTime;
            
            return {
                success: true,
                message: `Redis连接成功！响应: ${pong}`,
                latency,
                details: {
                    driver: 'redis',
                    host: config.host,
                    port: config.port,
                    database: config.database || 0,
                    ping: pong,
                    serverInfo: info.split('\r\n')[1] // 获取版本信息
                }
            };
            
        } catch (redisError: any) {
            return {
                success: false,
                message: `Redis连接失败: ${redisError.message}`,
                latency: Date.now() - startTime,
                details: {
                    error: redisError.message,
                    driver: 'redis'
                }
            };
        }
    }
}