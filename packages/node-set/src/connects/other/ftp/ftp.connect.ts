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
                displayName: '协议类型',
                name: 'protocol',
                type: 'options' as const,
                default: 'ftp',
                description: '选择文件传输协议',
                options: [
                    { name: 'FTP', value: 'ftp' },
                    { name: 'SFTP', value: 'sftp' }
                ],
                required: true,
                controlType: "select"
            },
            {
                displayName: '主机地址',
                name: 'host',
                type: 'string' as const,
                default: '',
                description: 'FTP服务器的主机地址',
                placeholder: 'ftp.example.com 或 IP地址',
                required: true,
                controlType: "input"
            },
            {
                displayName: '端口',
                name: 'port',
                type: 'number' as const,
                default: 21,
                description: 'FTP服务器端口号 (FTP: 21, SFTP: 22)',
                typeOptions: {
                    minValue: 1,
                    maxValue: 65535
                },
                required: true,
                controlType: "input"
            },
            {
                displayName: '用户名',
                name: 'username',
                type: 'string' as const,
                default: '',
                placeholder: "请输入FTP用户名",
                description: 'FTP用户名',
                required: true,
                controlType: "input"
            },
            {
                displayName: '密码',
                name: 'password',
                type: 'string' as const,
                default: '',
                description: 'FTP密码',
                placeholder: "请输入FTP密码",
                typeOptions: {
                    password: true
                },
                isSecure: true,
                controlType: "input"
            },
            {
                displayName: '私钥',
                name: 'privateKey',
                type: 'string' as const,
                default: '',
                description: 'SFTP私钥内容 (仅SFTP需要)',
                placeholder: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
                displayOptions: {
                    showBy: {
                        protocol: ['sftp']
                    }
                },
                controlType: "textarea"
            },
            {
                displayName: '私钥密码',
                name: 'passphrase',
                type: 'string' as const,
                default: '',
                description: '私钥密码 (如果私钥有密码保护)',
                placeholder: "私钥密码",
                typeOptions: {
                    password: true
                },
                isSecure: true,
                displayOptions: {
                    showBy: {
                        protocol: ['sftp']
                    }
                },
                controlType: "input"
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
                displayName: '启用被动模式',
                name: 'passive',
                type: 'boolean' as const,
                default: true,
                description: '是否启用被动模式 (推荐)',
                displayOptions: {
                    showBy: {
                        protocol: ['ftp']
                    }
                },
                controlType: "checkbox"
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