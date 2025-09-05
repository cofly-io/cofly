import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import * as fs from 'fs';
import * as path from 'path';

export class FTP implements INode {
    node: INodeBasic = {
        kind: 'ftp',
        name: 'FTP文件传输',
        event: "ftp",
        catalog: 'files',
        version: 1,
        description: "通过FTP/SFTP协议进行文件传输操作",
        icon: 'ftp.svg',
        nodeWidth: 400
    };

    detail: INodeDetail = {
        fields: [
            // FTP连接配置
            {
                label: '连接配置',
                fieldName: 'connection',
                connectType: "llm", // 使用other类型的连接
                control: {
                    name: 'selectconnect',
                    dataType: 'string',
                    defaultValue: '',
                    validation: { required: true }
                }
            },

            // 操作类型
            {
                label: '操作类型',
                fieldName: 'operation',
                control: {
                    name: 'selectwithdesc',
                    dataType: 'string',
                    defaultValue: 'list',
                    validation: { required: true },
                    options: [
                        {
                            name: '列出文件',
                            value: 'list',
                            description: '列出指定目录下的文件和文件夹',
                        },
                        {
                            name: '下载文件',
                            value: 'download',
                            description: '从FTP服务器下载文件',
                        },
                        {
                            name: '上传文件',
                            value: 'upload',
                            description: '上传文件到FTP服务器',
                        },
                        {
                            name: '删除文件',
                            value: 'delete',
                            description: '删除FTP服务器上的文件或文件夹',
                        },
                        {
                            name: '重命名/移动',
                            value: 'rename',
                            description: '重命名或移动FTP服务器上的文件',
                        },
                        {
                            name: '创建目录',
                            value: 'mkdir',
                            description: '在FTP服务器上创建目录',
                        }
                    ]
                }
            },

            // 路径字段 - 用于list, download, delete, mkdir操作
            {
                label: '路径',
                fieldName: 'path',
                conditionRules: {
                    showBy: {
                        operation: ['list', 'download', 'delete', 'mkdir'],
                    },
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '/',
                    placeholder: '例如: /home/user/documents',
                    validation: { required: true }
                }
            },

            // 上传文件路径
            {
                label: '远程文件路径',
                fieldName: 'remotePath',
                conditionRules: {
                    showBy: {
                        operation: ['upload'],
                    },
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    placeholder: '例如: /home/user/upload/file.txt',
                    validation: { required: true }
                }
            },

            // 本地文件路径 - 用于上传
            {
                label: '本地文件路径',
                fieldName: 'localPath',
                conditionRules: {
                    showBy: {
                        operation: ['upload'],
                    },
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    placeholder: '例如: /local/path/to/file.txt',
                    validation: { required: true }
                }
            },

            // 下载文件保存路径
            {
                label: '保存路径',
                fieldName: 'savePath',
                conditionRules: {
                    showBy: {
                        operation: ['download'],
                    },
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    placeholder: '例如: /local/save/path/file.txt (留空则返回文件内容)'
                }
            },

            // 重命名操作的旧路径
            {
                label: '原路径',
                fieldName: 'oldPath',
                conditionRules: {
                    showBy: {
                        operation: ['rename'],
                    },
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    placeholder: '例如: /old/path/file.txt',
                    validation: { required: true }
                }
            },

            // 重命名操作的新路径
            {
                label: '新路径',
                fieldName: 'newPath',
                conditionRules: {
                    showBy: {
                        operation: ['rename'],
                    },
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    placeholder: '例如: /new/path/file.txt',
                    validation: { required: true }
                }
            },

            // 递归选项
            {
                label: '递归操作',
                fieldName: 'recursive',
                conditionRules: {
                    showBy: {
                        operation: ['list', 'delete'],
                    },
                },
                control: {
                    name: 'checkbox',
                    dataType: 'boolean',
                    defaultValue: false
                }
            },

            // 是否为文件夹
            {
                label: '删除文件夹',
                fieldName: 'isFolder',
                conditionRules: {
                    showBy: {
                        operation: ['delete'],
                    },
                },
                control: {
                    name: 'checkbox',
                    dataType: 'boolean',
                    defaultValue: false
                }
            },

            // 创建父目录
            {
                label: '创建父目录',
                fieldName: 'createParentDirs',
                conditionRules: {
                    showBy: {
                        operation: ['upload', 'rename'],
                    },
                },
                control: {
                    name: 'checkbox',
                    dataType: 'boolean',
                    defaultValue: false
                }
            },

            // 超时设置
            {
                label: '操作超时(秒)',
                fieldName: 'timeout',
                control: {
                    name: 'input',
                    dataType: 'number',
                    defaultValue: 30,
                    placeholder: '操作超时时间'
                }
            },

            // 错误处理
            {
                label: '出错时继续',
                fieldName: 'continueOnFail',
                control: {
                    name: 'checkbox',
                    dataType: 'boolean',
                    defaultValue: false
                }
            },
        ],
    };

 
    async execute(opts: IExecuteOptions): Promise<any> {
        console.log('📁 [FTP Node] 开始执行FTP操作:', opts.inputs);

        try {
            const operation = opts.inputs?.operation || 'list';
            const timeout = (opts.inputs?.timeout || 30) * 1000;

            // 获取连接配置
            const connectionConfig = await this.getConnectionConfig(opts.inputs);

            console.log('📍 [FTP Node] 连接配置获取成功:', {
                operation,
                protocol: connectionConfig.protocol,
                host: connectionConfig.host,
                port: connectionConfig.port
            });

            // 执行对应的操作
            let result;
            switch (operation) {
                case 'list':
                    result = await this.listFiles(connectionConfig, opts.inputs, timeout);
                    break;
                case 'download':
                    result = await this.downloadFile(connectionConfig, opts.inputs, timeout);
                    break;
                case 'upload':
                    result = await this.uploadFile(connectionConfig, opts.inputs, timeout);
                    break;
                case 'delete':
                    result = await this.deleteFile(connectionConfig, opts.inputs, timeout);
                    break;
                case 'rename':
                    result = await this.renameFile(connectionConfig, opts.inputs, timeout);
                    break;
                case 'mkdir':
                    result = await this.createDirectory(connectionConfig, opts.inputs, timeout);
                    break;
                default:
                    throw new Error(`不支持的操作类型: ${operation}`);
            }

            console.log('✅ [FTP Node] FTP操作完成:', {
                operation,
                success: true
            });

            return {
                success: true,
                data: result,
                metadata: {
                    operation,
                    protocol: connectionConfig.protocol,
                    host: connectionConfig.host
                }
            };

        } catch (error: any) {
            console.error('❌ [FTP Node] 执行失败:', error.message);
            
            if (opts.inputs?.continueOnFail) {
                return {
                    success: false,
                    error: error.message,
                    data: []
                };
            } else {
                return {
                    success: false,
                    error: `FTP操作失败: ${error.message}`
                };
            }
        }
    }

    /**
     * 获取连接配置
     */
    private async getConnectionConfig(inputs: any): Promise<any> {
        // 这里应该从连接管理器获取配置
        // 暂时使用输入参数中的配置
        const config = {
            protocol: inputs.protocol || 'ftp',
            host: inputs.host || 'localhost',
            port: inputs.port || (inputs.protocol === 'sftp' ? 22 : 21),
            username: inputs.username || '',
            password: inputs.password || '',
            privateKey: inputs.privateKey || '',
            passphrase: inputs.passphrase || '',
            connectionTimeout: inputs.connectionTimeout || 30,
            passive: inputs.passive !== false
        };

        return config;
    }

    /**
     * 列出文件
     */
    private async listFiles(config: any, inputs: any, timeout: number): Promise<any[]> {
        const path = inputs.path || '/';
        const recursive = inputs.recursive || false;

        if (config.protocol === 'sftp') {
            return await this.listFilesSftp(config, path, recursive, timeout);
        } else {
            return await this.listFilesFtp(config, path, recursive, timeout);
        }
    }

    /**
     * SFTP列出文件
     */
    private async listFilesSftp(config: any, path: string, recursive: boolean, timeout: number): Promise<any[]> {
        let sftpClient: any;
        
        try {
            sftpClient = await import('ssh2-sftp-client');
        } catch (error) {
            throw new Error('SFTP客户端库未安装，请安装 ssh2-sftp-client');
        }

        const client = new sftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                username: config.username,
                password: config.password,
                privateKey: config.privateKey || undefined,
                passphrase: config.passphrase || undefined,
                readyTimeout: timeout
            });

            const files = await client.list(path);
            
            return files.map((file: any) => ({
                name: file.name,
                type: file.type === 'd' ? 'directory' : 'file',
                size: file.size,
                modifyTime: new Date(file.modifyTime),
                accessTime: new Date(file.accessTime),
                path: `${path}${path.endsWith('/') ? '' : '/'}${file.name}`,
                permissions: file.rights
            }));

        } finally {
            try {
                await client.end();
            } catch (e) {
                // 忽略关闭连接时的错误
            }
        }
    }

    /**
     * FTP列出文件
     */
    private async listFilesFtp(config: any, path: string, recursive: boolean, timeout: number): Promise<any[]> {
        let ftpClient: any;
        
        try {
            ftpClient = await import('promise-ftp');
        } catch (error) {
            throw new Error('FTP客户端库未安装，请安装 promise-ftp');
        }

        const client = new ftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                user: config.username,
                password: config.password,
                connTimeout: timeout,
                pasvTimeout: timeout,
                keepalive: timeout,
                passive: config.passive
            });

            const files = await client.list(path);
            
            return files.map((file: any) => ({
                name: file.name,
                type: file.type === 'd' ? 'directory' : 'file',
                size: file.size,
                modifyTime: file.date,
                path: `${path}${path.endsWith('/') ? '' : '/'}${file.name}`,
                permissions: file.rights
            }));

        } finally {
            try {
                await client.end();
            } catch (e) {
                // 忽略关闭连接时的错误
            }
        }
    }

    /**
     * 下载文件
     */
    private async downloadFile(config: any, inputs: any, timeout: number): Promise<any> {
        const remotePath = inputs.path;
        const savePath = inputs.savePath;

        if (config.protocol === 'sftp') {
            return await this.downloadFileSftp(config, remotePath, savePath, timeout);
        } else {
            return await this.downloadFileFtp(config, remotePath, savePath, timeout);
        }
    }

    /**
     * SFTP下载文件
     */
    private async downloadFileSftp(config: any, remotePath: string, savePath: string, timeout: number): Promise<any> {
        let sftpClient: any;
        
        try {
            sftpClient = await import('ssh2-sftp-client');
        } catch (error) {
            throw new Error('SFTP客户端库未安装，请安装 ssh2-sftp-client');
        }

        const client = new sftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                username: config.username,
                password: config.password,
                privateKey: config.privateKey || undefined,
                passphrase: config.passphrase || undefined,
                readyTimeout: timeout
            });

            if (savePath) {
                // 下载到本地文件
                await client.get(remotePath, savePath);
                return {
                    success: true,
                    message: `文件已下载到: ${savePath}`,
                    localPath: savePath,
                    remotePath: remotePath
                };
            } else {
                // 返回文件内容
                const buffer = await client.get(remotePath);
                return {
                    success: true,
                    message: '文件内容获取成功',
                    content: buffer.toString(),
                    remotePath: remotePath,
                    size: buffer.length
                };
            }

        } finally {
            try {
                await client.end();
            } catch (e) {
                // 忽略关闭连接时的错误
            }
        }
    }

    /**
     * FTP下载文件
     */
    private async downloadFileFtp(config: any, remotePath: string, savePath: string, timeout: number): Promise<any> {
        let ftpClient: any;
        
        try {
            ftpClient = await import('promise-ftp');
        } catch (error) {
            throw new Error('FTP客户端库未安装，请安装 promise-ftp');
        }

        const client = new ftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                user: config.username,
                password: config.password,
                connTimeout: timeout,
                pasvTimeout: timeout,
                keepalive: timeout,
                passive: config.passive
            });

            if (savePath) {
                // 下载到本地文件
                const stream = await client.get(remotePath);
                const writeStream = fs.createWriteStream(savePath);
                
                return new Promise((resolve, reject) => {
                    stream.pipe(writeStream);
                    stream.on('end', () => {
                        resolve({
                            success: true,
                            message: `文件已下载到: ${savePath}`,
                            localPath: savePath,
                            remotePath: remotePath
                        });
                    });
                    stream.on('error', reject);
                    writeStream.on('error', reject);
                });
            } else {
                // 返回文件内容
                const stream = await client.get(remotePath);
                const chunks: Buffer[] = [];
                
                return new Promise((resolve, reject) => {
                    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
                    stream.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        resolve({
                            success: true,
                            message: '文件内容获取成功',
                            content: buffer.toString(),
                            remotePath: remotePath,
                            size: buffer.length
                        });
                    });
                    stream.on('error', reject);
                });
            }

        } finally {
            try {
                await client.end();
            } catch (e) {
                // 忽略关闭连接时的错误
            }
        }
    }

    /**
     * 上传文件
     */
    private async uploadFile(config: any, inputs: any, timeout: number): Promise<any> {
        const localPath = inputs.localPath;
        const remotePath = inputs.remotePath;
        const createParentDirs = inputs.createParentDirs || false;

        if (!fs.existsSync(localPath)) {
            throw new Error(`本地文件不存在: ${localPath}`);
        }

        if (config.protocol === 'sftp') {
            return await this.uploadFileSftp(config, localPath, remotePath, createParentDirs, timeout);
        } else {
            return await this.uploadFileFtp(config, localPath, remotePath, createParentDirs, timeout);
        }
    }

    /**
     * SFTP上传文件
     */
    private async uploadFileSftp(config: any, localPath: string, remotePath: string, createParentDirs: boolean, timeout: number): Promise<any> {
        let sftpClient: any;
        
        try {
            sftpClient = await import('ssh2-sftp-client');
        } catch (error) {
            throw new Error('SFTP客户端库未安装，请安装 ssh2-sftp-client');
        }

        const client = new sftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                username: config.username,
                password: config.password,
                privateKey: config.privateKey || undefined,
                passphrase: config.passphrase || undefined,
                readyTimeout: timeout
            });

            if (createParentDirs) {
                const remoteDir = path.dirname(remotePath);
                await client.mkdir(remoteDir, true);
            }

            await client.put(localPath, remotePath);

            return {
                success: true,
                message: `文件已上传: ${localPath} -> ${remotePath}`,
                localPath: localPath,
                remotePath: remotePath
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
     * FTP上传文件
     */
    private async uploadFileFtp(config: any, localPath: string, remotePath: string, createParentDirs: boolean, timeout: number): Promise<any> {
        let ftpClient: any;
        
        try {
            ftpClient = await import('promise-ftp');
        } catch (error) {
            throw new Error('FTP客户端库未安装，请安装 promise-ftp');
        }

        const client = new ftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                user: config.username,
                password: config.password,
                connTimeout: timeout,
                pasvTimeout: timeout,
                keepalive: timeout,
                passive: config.passive
            });

            if (createParentDirs) {
                const remoteDir = path.dirname(remotePath);
                await client.mkdir(remoteDir, true);
            }

            await client.put(localPath, remotePath);

            return {
                success: true,
                message: `文件已上传: ${localPath} -> ${remotePath}`,
                localPath: localPath,
                remotePath: remotePath
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
     * 删除文件
     */
    private async deleteFile(config: any, inputs: any, timeout: number): Promise<any> {
        const path = inputs.path;
        const isFolder = inputs.isFolder || false;
        const recursive = inputs.recursive || false;

        if (config.protocol === 'sftp') {
            return await this.deleteFileSftp(config, path, isFolder, recursive, timeout);
        } else {
            return await this.deleteFileFtp(config, path, isFolder, recursive, timeout);
        }
    }

    /**
     * SFTP删除文件
     */
    private async deleteFileSftp(config: any, path: string, isFolder: boolean, recursive: boolean, timeout: number): Promise<any> {
        let sftpClient: any;
        
        try {
            sftpClient = await import('ssh2-sftp-client');
        } catch (error) {
            throw new Error('SFTP客户端库未安装，请安装 ssh2-sftp-client');
        }

        const client = new sftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                username: config.username,
                password: config.password,
                privateKey: config.privateKey || undefined,
                passphrase: config.passphrase || undefined,
                readyTimeout: timeout
            });

            if (isFolder) {
                await client.rmdir(path, recursive);
            } else {
                await client.delete(path);
            }

            return {
                success: true,
                message: `${isFolder ? '目录' : '文件'}已删除: ${path}`,
                path: path,
                type: isFolder ? 'directory' : 'file'
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
     * FTP删除文件
     */
    private async deleteFileFtp(config: any, path: string, isFolder: boolean, recursive: boolean, timeout: number): Promise<any> {
        let ftpClient: any;
        
        try {
            ftpClient = await import('promise-ftp');
        } catch (error) {
            throw new Error('FTP客户端库未安装，请安装 promise-ftp');
        }

        const client = new ftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                user: config.username,
                password: config.password,
                connTimeout: timeout,
                pasvTimeout: timeout,
                keepalive: timeout,
                passive: config.passive
            });

            if (isFolder) {
                await client.rmdir(path, recursive);
            } else {
                await client.delete(path);
            }

            return {
                success: true,
                message: `${isFolder ? '目录' : '文件'}已删除: ${path}`,
                path: path,
                type: isFolder ? 'directory' : 'file'
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
     * 重命名文件
     */
    private async renameFile(config: any, inputs: any, timeout: number): Promise<any> {
        const oldPath = inputs.oldPath;
        const newPath = inputs.newPath;
        const createParentDirs = inputs.createParentDirs || false;

        if (config.protocol === 'sftp') {
            return await this.renameFileSftp(config, oldPath, newPath, createParentDirs, timeout);
        } else {
            return await this.renameFileFtp(config, oldPath, newPath, createParentDirs, timeout);
        }
    }

    /**
     * SFTP重命名文件
     */
    private async renameFileSftp(config: any, oldPath: string, newPath: string, createParentDirs: boolean, timeout: number): Promise<any> {
        let sftpClient: any;
        
        try {
            sftpClient = await import('ssh2-sftp-client');
        } catch (error) {
            throw new Error('SFTP客户端库未安装，请安装 ssh2-sftp-client');
        }

        const client = new sftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                username: config.username,
                password: config.password,
                privateKey: config.privateKey || undefined,
                passphrase: config.passphrase || undefined,
                readyTimeout: timeout
            });

            if (createParentDirs) {
                const newDir = path.dirname(newPath);
                await client.mkdir(newDir, true);
            }

            await client.rename(oldPath, newPath);

            return {
                success: true,
                message: `文件已重命名: ${oldPath} -> ${newPath}`,
                oldPath: oldPath,
                newPath: newPath
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
     * FTP重命名文件
     */
    private async renameFileFtp(config: any, oldPath: string, newPath: string, createParentDirs: boolean, timeout: number): Promise<any> {
        let ftpClient: any;
        
        try {
            ftpClient = await import('promise-ftp');
        } catch (error) {
            throw new Error('FTP客户端库未安装，请安装 promise-ftp');
        }

        const client = new ftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                user: config.username,
                password: config.password,
                connTimeout: timeout,
                pasvTimeout: timeout,
                keepalive: timeout,
                passive: config.passive
            });

            if (createParentDirs) {
                const newDir = path.dirname(newPath);
                await client.mkdir(newDir, true);
            }

            await client.rename(oldPath, newPath);

            return {
                success: true,
                message: `文件已重命名: ${oldPath} -> ${newPath}`,
                oldPath: oldPath,
                newPath: newPath
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
     * 创建目录
     */
    private async createDirectory(config: any, inputs: any, timeout: number): Promise<any> {
        const path = inputs.path;

        if (config.protocol === 'sftp') {
            return await this.createDirectorySftp(config, path, timeout);
        } else {
            return await this.createDirectoryFtp(config, path, timeout);
        }
    }

    /**
     * SFTP创建目录
     */
    private async createDirectorySftp(config: any, path: string, timeout: number): Promise<any> {
        let sftpClient: any;
        
        try {
            sftpClient = await import('ssh2-sftp-client');
        } catch (error) {
            throw new Error('SFTP客户端库未安装，请安装 ssh2-sftp-client');
        }

        const client = new sftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                username: config.username,
                password: config.password,
                privateKey: config.privateKey || undefined,
                passphrase: config.passphrase || undefined,
                readyTimeout: timeout
            });

            await client.mkdir(path, true);

            return {
                success: true,
                message: `目录已创建: ${path}`,
                path: path
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
     * FTP创建目录
     */
    private async createDirectoryFtp(config: any, path: string, timeout: number): Promise<any> {
        let ftpClient: any;
        
        try {
            ftpClient = await import('promise-ftp');
        } catch (error) {
            throw new Error('FTP客户端库未安装，请安装 promise-ftp');
        }

        const client = new ftpClient.default();
        
        try {
            await client.connect({
                host: config.host,
                port: config.port,
                user: config.username,
                password: config.password,
                connTimeout: timeout,
                pasvTimeout: timeout,
                keepalive: timeout,
                passive: config.passive
            });

            await client.mkdir(path, true);

            return {
                success: true,
                message: `目录已创建: ${path}`,
                path: path
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