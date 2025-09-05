import { Icon, ConnectTestResult } from '@repo/common';
import { BaseOthersConnect } from '../../base/BaseOthersConnect';

/**
 * FTP 连接器类
 */
export class FTPConnect extends BaseOthersConnect {
    override overview = {
        id: 'ftp',
        name: 'FTP',
        type: 'other' as const,
        provider: 'ftp' as const,
        icon: 'ftp.svg' as Icon,
        description: 'FTP文件传输协议连接',
        version: '1.0.0'
    };

    override detail = {
        defaultPort: 21,
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
                label: '协议类型',
                fieldName: 'protocol',
                description: '选择文件传输协议',
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'ftp',
                    validation: {
                        required: true
                    },
                    options: [
                        { name: 'FTP', value: 'ftp' },
                        { name: 'SFTP', value: 'sftp' }
                    ]
                }
            },
            {
                label: '主机地址',
                fieldName: 'host',
                description: 'FTP服务器的主机地址',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: 'ftp.example.com 或 IP地址'
                }
            },
            {
                label: '端口',
                fieldName: 'port',
                description: 'FTP服务器端口号 (FTP: 21, SFTP: 22)',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 21,
                    validation: {
                        required: true,
                        min: 1,
                        max: 65535
                    },
                    placeholder: '21'
                }
            },
            {
                label: '用户名',
                fieldName: 'username',
                description: 'FTP用户名',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '请输入FTP用户名'
                }
            },
            {
                label: '密码',
                fieldName: 'password',
                description: 'FTP密码',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: false
                    },
                    placeholder: '请输入FTP密码',
                    attributes: [{
                        type: 'password'
                    }]
                }
            },
            {
                label: '私钥',
                fieldName: 'privateKey',
                description: 'SFTP私钥内容 (仅SFTP需要)',
                conditionRules: {
                    showBy: {
                        protocol: ['sftp']
                    }
                },
                control: {
                    name: 'textarea' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    placeholder: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'
                }
            },
            {
                label: '私钥密码',
                fieldName: 'passphrase',
                description: '私钥密码 (如果私钥有密码保护)',
                conditionRules: {
                    showBy: {
                        protocol: ['sftp']
                    }
                },
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: false
                    },
                    placeholder: '私钥密码',
                    attributes: [{
                        type: 'password'
                    }]
                }
            },
            {
                label: '连接超时(秒)',
                fieldName: 'connectionTimeout',
                description: '连接超时时间，单位：秒',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 30,
                    validation: {
                        min: 1,
                        max: 300
                    },
                    placeholder: '30'
                }
            },
            {
                label: '启用被动模式',
                fieldName: 'passive',
                description: '是否启用被动模式 (推荐)',
                conditionRules: {
                    showBy: {
                        protocol: ['ftp']
                    }
                },
                control: {
                    name: 'checkbox' as const,
                    dataType: 'boolean' as const,
                    defaultValue: true
                }
            }
        ],
        validateConnection: true,
        connectionTimeout: 30000
    };

    /**
     * 测试FTP连接
     */
    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        try {
            // 验证必填字段
            const requiredFields = ['host', 'port', 'username'];
            for (const field of requiredFields) {
                if (!config[field]) {
                    return {
                        success: false,
                        message: `缺少必填字段: ${field}`
                    };
                }
            }

            const protocol = config.protocol || 'ftp';
            let connectionResult;

            if (protocol === 'sftp') {
                connectionResult = await this.testSftpConnection(config);
            } else {
                connectionResult = await this.testFtpConnection(config);
            }

            const latency = Date.now() - startTime;

            return {
                success: true,
                message: `${protocol.toUpperCase()}连接测试成功`,
                latency,
                details: {
                    protocol,
                    host: config.host,
                    port: config.port,
                    username: config.username,
                    passive: config.passive,
                    connectionTimeout: config.connectionTimeout || 30,
                    ...connectionResult
                }
            };

        } catch (error) {
            return {
                success: false,
                message: `FTP连接失败: ${error instanceof Error ? error.message : String(error)}`,
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * 测试FTP连接
     */
    private async testFtpConnection(config: Record<string, any>): Promise<{ serverInfo?: string }> {
        let ftpClient: any;

        try {
            // 动态导入ftp客户端
            ftpClient = await import('promise-ftp');
        } catch (error) {
            throw new Error(`FTP客户端库未安装: ${error instanceof Error ? error.message : String(error)}。请安装 'npm install promise-ftp'`);
        }

        const client = new ftpClient.default();

        try {
            await client.connect({
                host: config.host,
                port: parseInt(config.port),
                user: config.username,
                password: config.password || '',
                connTimeout: (config.connectionTimeout || 30) * 1000,
                pasvTimeout: (config.connectionTimeout || 30) * 1000,
                keepalive: (config.connectionTimeout || 30) * 1000,
                secure: false, // 如果需要FTPS，可以设置为true
                secureOptions: undefined,
                passive: config.passive !== false // 默认启用被动模式
            });

            // 获取服务器信息
            const serverInfo = await client.system();

            return {
                serverInfo: serverInfo || 'FTP服务器'
            };
        } finally {
            try {
                await client.end();
            } catch (e) {
                // 忽略关闭连接时的错误
            }
        }
    }

    /**
     * 测试SFTP连接
     */
    private async testSftpConnection(config: Record<string, any>): Promise<{ serverInfo?: string }> {
        let sftpClient: any;

        try {
            // 动态导入sftp客户端
            sftpClient = await import('ssh2-sftp-client');
        } catch (error) {
            throw new Error(`SFTP客户端库未安装: ${error instanceof Error ? error.message : String(error)}。请安装 'npm install ssh2-sftp-client'`);
        }

        const client = new sftpClient.default();

        try {
            const connectConfig: any = {
                host: config.host,
                port: parseInt(config.port),
                username: config.username,
                readyTimeout: (config.connectionTimeout || 30) * 1000
            };

            // 如果提供了私钥，使用私钥认证
            if (config.privateKey) {
                connectConfig.privateKey = config.privateKey;
                if (config.passphrase) {
                    connectConfig.passphrase = config.passphrase;
                }
                // 如果有私钥，密码是可选的
                if (config.password) {
                    connectConfig.password = config.password;
                }
            } else {
                // 使用密码认证
                connectConfig.password = config.password || '';
            }

            await client.connect(connectConfig);

            // 测试基本操作 - 列出根目录
            await client.list('/');

            return {
                serverInfo: 'SFTP服务器'
            };
        } finally {
            try {
                await client.end();
            } catch (e) {
                // 忽略关闭连接时的错误
            }
        }
    }
}