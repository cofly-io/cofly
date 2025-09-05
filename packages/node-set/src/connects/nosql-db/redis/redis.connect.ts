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
                label: '主机地址',
                fieldName: 'host',
                description: 'Redis服务器的主机地址',
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
                description: 'Redis服务器端口号',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 6379,
                    validation: {
                        required: true,
                        min: 1,
                        max: 65535
                    },
                    placeholder: '6379'
                }
            },
            {
                label: '密码',
                fieldName: 'password',
                description: 'Redis密码（如果设置了AUTH）',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: false
                    },
                    placeholder: '请输入Redis密码',
                    attributes: [{
                        type: 'password'
                    }]
                }
            },
            {
                label: '数据库索引',
                fieldName: 'database',
                description: 'Redis数据库索引（0-15）',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 0,
                    validation: {
                        min: 0,
                        max: 15
                    },
                    placeholder: '0'
                }
            },
            {
                label: '连接超时(秒)',
                fieldName: 'connectTimeout',
                description: '连接超时时间，单位：秒',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 10,
                    validation: {
                        min: 1,
                        max: 300
                    },
                    placeholder: '10'
                }
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