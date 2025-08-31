import { Icon, ConnectTestResult } from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';

/**
 * MongoDB 数据库连接定义
 */
export class MongoDBConnect extends BaseDatabaseConnect {
    override overview = {
        id: 'mongodb',
        name: 'MongoDB',
        type: 'nosql-db' as const,
        provider: 'mongodb' as const,
        icon: 'mongodb.svg' as Icon,
        description: 'MongoDB是一个基于分布式文件存储的NoSQL数据库，支持文档存储、索引查询和水平扩展',
        version: '1.0.0'
    };

    override detail = {
        defaultPort: 27017,
        supportedFeatures: [
            'json_support' as const,
            'full_text_search' as const,
            'array_support' as const
        ],
        fields: [
            {
                displayName: '主机地址',
                name: 'host',
                type: 'string' as const,
                default: 'localhost',
                description: 'MongoDB服务器地址',
                placeholder: 'localhost, 192.168.1.100等',
                required: true,
                controlType: "input"
            },
            {
                displayName: '端口',
                name: 'port',
                type: 'number' as const,
                default: 27017,
                description: 'MongoDB服务器端口号',
                placeholder: '默认端口: 27017',
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
                placeholder: 'myapp, test, admin等',
                required: true,
                controlType: "input"
            },
            {
                displayName: '用户名',
                name: 'username',
                type: 'string' as const,
                default: '',
                placeholder: "请输入数据库用户名",
                description: '数据库用户名（可选，如果启用了认证）',
                required: false,
                controlType: "input"
            },
            {
                displayName: '密码',
                name: 'password',
                type: 'string' as const,
                default: '',
                description: '数据库密码（可选，如果启用了认证）',
                placeholder: "请输入数据库密码",
                typeOptions: {
                    password: true
                },
                isSecure: true,
                controlType: "input"
            }
        ],
        validateConnection: true,
        connectionTimeout: 30000
    };

    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();

        try {
            // 验证必填字段
            if (!config.host) {
                return {
                    success: false,
                    message: '主机地址不能为空',
                    latency: Date.now() - startTime
                };
            }

            if (!config.database) {
                return {
                    success: false,
                    message: '数据库名不能为空',
                    latency: Date.now() - startTime
                };
            }

            // 尝试使用mongodb驱动进行连接测试
            try {
                const result = await this.testMongoDBConnection(config);
                return result;
            } catch (mongodbError: any) {
                return {
                    success: false,
                    message: `MongoDB连接失败: ${mongodbError.message}`,
                    latency: Date.now() - startTime,
                    details: {
                        error: mongodbError.message,
                        driver: 'mongodb'
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

    private async testMongoDBConnection(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        
        try {
            let MongoClient: any;
            try {
                const mongoModule = await import('mongodb');
                MongoClient = mongoModule.MongoClient;
            } catch (importError) {
                throw new Error('MongoDB驱动未安装，请运行: npm install mongodb');
            }

            // 构建连接URI
            let uri = 'mongodb://';
            
            // 添加认证信息
            if (config.username && config.password) {
                uri += `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@`;
            }
            
            // 添加主机和端口
            uri += `${config.host}:${config.port || 27017}`;
            
            // 添加数据库名
            uri += `/${config.database}`;
            
            // 构建连接选项
            const options: any = {
                connectTimeoutMS: (config.connectTimeout || 30) * 1000,
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 30000
            };

            const client = new MongoClient(uri, options);

            try {
                // 连接到MongoDB
                await client.connect();
                
                // 获取数据库实例
                const db = client.db(config.database);
                
                // 执行ping命令测试连接
                await db.admin().ping();
                
                const latency = Date.now() - startTime;
                
                return {
                    success: true,
                    message: 'MongoDB连接成功！',
                    latency,
                    details: {
                        driver: 'mongodb',
                        database: config.database,
                        host: config.host,
                        port: config.port || 27017
                    }
                };
                
            } finally {
                // 关闭连接
                await client.close();
            }
        } catch (error: any) {
            throw error;
        }
    }
}