import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';
import { 
	S3Client, 
	ListBucketsCommand, 
	CreateBucketCommand, 
	DeleteBucketCommand,
	ListObjectsV2Command,
	GetObjectCommand,
	PutObjectCommand,
	DeleteObjectCommand,
	CopyObjectCommand,
	HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

export class S3 implements INode {
	node: INodeBasic = {
		kind: 's3',
		name: 'S3存储',
		event: "s3",
		catalog: 'files',
		version: 1,
		description: "与S3兼容的对象存储服务进行交互，支持文件上传、下载、管理等操作",
		icon: 's3.svg',
		nodeWidth: 650
	};

	detail: INodeDetail = {
        fields: [
            // S3连接配置
            {
                label: '连接配置',
                fieldName: 'connection',
                connectType: 'llm',
                control: {
                    name: 'selectconnect',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    }
                }
            },

            // 资源类型
            {
                label: '资源类型',
                fieldName: 'resource',
                control: {
                    name: 'selectwithdesc',
                    dataType: 'string',
                    defaultValue: 'file',
                    validation: {
                        required: true
                    },
                    options: [
                        {
                            name: '存储桶',
                            value: 'bucket',
                            description: '管理S3存储桶',
                        },
                        {
                            name: '文件',
                            value: 'file',
                            description: '管理S3文件对象',
                        },
                        {
                            name: '文件夹',
                            value: 'folder',
                            description: '管理S3文件夹',
                        },
                    ]
                }
            },

            // 操作类型 - 存储桶
            {
                label: '操作',
                fieldName: 'operation',
                conditionRules: {
                    showBy: {
                        resource: ['bucket']
                    }
                },
                control: {
                    name: 'selectwithdesc',
                    dataType: 'string',
                    defaultValue: 'list',
                    options: [
                        {
                            name: '创建',
                            value: 'create',
                            description: '创建新的存储桶',
                        },
                        {
                            name: '列表',
                            value: 'list',
                            description: '获取所有存储桶列表',
                        },
                        {
                            name: '删除',
                            value: 'delete',
                            description: '删除存储桶',
                        },
                    ]
                }
            },

            // 操作类型 - 文件
            {
                label: '操作',
                fieldName: 'operation',
                conditionRules: {
                    showBy: {
                        resource: ['file']
                    }
                },
                control: {
                    name: 'selectwithdesc',
                    dataType: 'string',
                    defaultValue: 'upload',
                    options: [
                        {
                            name: '上传',
                            value: 'upload',
                            description: '上传文件到S3',
                        },
                        {
                            name: '下载',
                            value: 'download',
                            description: '从S3下载文件',
                        },
                        {
                            name: '删除',
                            value: 'delete',
                            description: '删除S3文件',
                        },
                        {
                            name: '复制',
                            value: 'copy',
                            description: '复制S3文件',
                        },
                        {
                            name: '列表',
                            value: 'list',
                            description: '列出文件',
                        },
                        {
                            name: '获取信息',
                            value: 'info',
                            description: '获取文件信息',
                        },
                        {
                            name: '生成预签名URL',
                            value: 'presignedUrl',
                            description: '生成预签名访问URL',
                        },
                    ]
                }
            },

            // 操作类型 - 文件夹
            {
                label: '操作',
                fieldName: 'operation',
                conditionRules: {
                    showBy: {
                        resource: ['folder']
                    }
                },
                control: {
                    name: 'selectwithdesc',
                    dataType: 'string',
                    defaultValue: 'create',
                    options: [
                        {
                            name: '创建',
                            value: 'create',
                            description: '创建文件夹',
                        },
                        {
                            name: '删除',
                            value: 'delete',
                            description: '删除文件夹',
                        },
                        {
                            name: '列表',
                            value: 'list',
                            description: '列出文件夹内容',
                        },
                    ]
                }
            },

            // 存储桶名称 - 存储桶操作
            {
                label: '存储桶名称',
                fieldName: 'bucketName',
                conditionRules: {
                    showBy: {
                        resource: ['bucket'],
                        operation: ['create', 'delete']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '例如: my-bucket'
                }
            },

            // 存储桶名称 - 文件和文件夹操作
            {
                label: '存储桶名称',
                fieldName: 'bucketName',
                conditionRules: {
                    showBy: {
                        resource: ['file', 'folder']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '例如: my-bucket'
                }
            },

            // 文件键名 - 下载、删除、信息、预签名URL
            {
                label: '文件键名',
                fieldName: 'fileKey',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['download', 'delete', 'info', 'presignedUrl']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '例如: folder/file.txt'
                }
            },

            // 文件键名 - 上传
            {
                label: '文件键名',
                fieldName: 'fileKey',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['upload']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    placeholder: '例如: folder/file.txt (留空则使用原文件名)'
                }
            },

            // 数据类型
            {
                label: '数据类型',
                fieldName: 'dataType',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['upload']
                    }
                },
                control: {
                    name: 'selectwithdesc',
                    dataType: 'string',
                    defaultValue: 'binary',
                    options: [
                        {
                            name: '二进制数据',
                            value: 'binary',
                            description: '从输入的二进制数据上传',
                        },
                        {
                            name: '文本内容',
                            value: 'text',
                            description: '从文本内容上传',
                        },
                        {
                            name: '本地文件',
                            value: 'file',
                            description: '从本地文件路径上传',
                        },
                    ]
                }
            },

            // 二进制数据字段
            {
                label: '二进制数据字段',
                fieldName: 'binaryField',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['upload'],
                        dataType: ['binary']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: 'data',
                    validation: {
                        required: true
                    },
                    placeholder: '包含二进制数据的字段名'
                }
            },

            // 文本内容
            {
                label: '文本内容',
                fieldName: 'textContent',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['upload'],
                        dataType: ['text']
                    }
                },
                control: {
                    name: 'textarea',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '要上传的文本内容'
                }
            },

            // 本地文件路径
            {
                label: '本地文件路径',
                fieldName: 'filePath',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['upload'],
                        dataType: ['file']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '例如: /path/to/file.txt'
                }
            },

            // 源文件键名
            {
                label: '源文件键名',
                fieldName: 'sourceKey',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['copy']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '例如: source/file.txt'
                }
            },

            // 目标文件键名
            {
                label: '目标文件键名',
                fieldName: 'targetKey',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['copy']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '例如: target/file.txt'
                }
            },

            // 文件夹路径
            {
                label: '文件夹路径',
                fieldName: 'folderPath',
                conditionRules: {
                    showBy: {
                        resource: ['folder'],
                        operation: ['create', 'delete', 'list']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    placeholder: '例如: my-folder/ (留空表示根目录)'
                }
            },

            // 前缀过滤
            {
                label: '前缀过滤',
                fieldName: 'prefix',
                conditionRules: {
                    showBy: {
                        resource: ['file', 'folder'],
                        operation: ['list']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    placeholder: '例如: folder/ (过滤特定前缀的对象)'
                }
            },

            // 最大数量
            {
                label: '最大数量',
                fieldName: 'maxKeys',
                conditionRules: {
                    showBy: {
                        resource: ['file', 'folder'],
                        operation: ['list']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'number',
                    defaultValue: 1000,
                    placeholder: '返回的最大对象数量'
                }
            },

            // 过期时间
            {
                label: '过期时间(秒)',
                fieldName: 'expiresIn',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['presignedUrl']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'number',
                    defaultValue: 3600,
                    placeholder: 'URL过期时间，默认1小时'
                }
            },

            // 内容类型
            {
                label: '内容类型',
                fieldName: 'contentType',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['upload']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: '',
                    placeholder: '例如: image/jpeg, text/plain'
                }
            },

            // 存储类别
            {
                label: '存储类别',
                fieldName: 'storageClass',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['upload']
                    }
                },
                control: {
                    name: 'select',
                    dataType: 'string',
                    defaultValue: 'STANDARD',
                    options: [
                        {
                            name: '标准',
                            value: 'STANDARD',
                            description: '标准存储类别',
                        },
                        {
                            name: '低频访问',
                            value: 'STANDARD_IA',
                            description: '标准-低频访问',
                        },
                        {
                            name: '单区域低频',
                            value: 'ONEZONE_IA',
                            description: '单区域-低频访问',
                        },
                        {
                            name: '归档',
                            value: 'GLACIER',
                            description: 'Glacier归档',
                        },
                        {
                            name: '深度归档',
                            value: 'DEEP_ARCHIVE',
                            description: 'Glacier深度归档',
                        },
                    ]
                }
            },

            // 服务器端加密
            {
                label: '服务器端加密',
                fieldName: 'serverSideEncryption',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['upload']
                    }
                },
                control: {
                    name: 'selectwithdesc',
                    dataType: 'string',
                    defaultValue: 'none',
                    options: [
                        {
                            name: '无',
                            value: 'none',
                            description: '不使用服务器端加密',
                        },
                        {
                            name: 'AES256',
                            value: 'AES256',
                            description: 'S3管理的加密密钥',
                        },
                        {
                            name: 'KMS',
                            value: 'aws:kms',
                            description: 'AWS KMS管理的密钥',
                        },
                    ]
                }
            },

            // 下载到字段
            {
                label: '下载到字段',
                fieldName: 'downloadField',
                conditionRules: {
                    showBy: {
                        resource: ['file'],
                        operation: ['download']
                    }
                },
                control: {
                    name: 'input',
                    dataType: 'string',
                    defaultValue: 'data',
                    placeholder: '下载的文件将存储到此字段'
                }
            },

            // 出错时继续
            {
                label: '出错时继续',
                fieldName: 'continueOnFail',
                control: {
                    name: 'checkbox',
                    dataType: 'boolean',
                    defaultValue: false
                }
            }
        ],
	};

	// async metadata(opts: IMetadataOptions): Promise<IMetadataResult> {
	// 	// S3节点通常不需要元数据查询
	// 	return {
	// 		success: false,
	// 		error: 'S3存储节点不支持元数据查询'
	// 	};
	// }

	async execute(opts: IExecuteOptions): Promise<any> {
		console.log('🪣 [S3 Node] 开始执行S3操作:', opts.inputs);

		try {
			const resource = opts.inputs?.resource || 'file';
			const operation = opts.inputs?.operation || 'upload';

			// 创建S3客户端
			const s3Client = await this.createS3Client(opts.inputs);

			console.log('📍 [S3 Node] S3客户端创建成功:', {
				resource,
				operation
			});

			let result;
			switch (resource) {
				case 'bucket':
					result = await this.executeBucketOperation(s3Client, operation, opts.inputs);
					break;
				case 'file':
					result = await this.executeFileOperation(s3Client, operation, opts.inputs);
					break;
				case 'folder':
					result = await this.executeFolderOperation(s3Client, operation, opts.inputs);
					break;
				default:
					throw new Error(`不支持的资源类型: ${resource}`);
			}

			console.log('✅ [S3 Node] S3操作完成:', {
				resource,
				operation,
				success: result.success
			});

			return result;

		} catch (error: any) {
			console.error('❌ [S3 Node] 执行失败:', error.message);
			
			if (opts.inputs?.continueOnFail) {
				return {
					success: false,
					error: error.message,
					data: []
				};
			} else {
				return {
					success: false,
					error: `S3操作失败: ${error.message}`
				};
			}
		}
	}

	/**
	 * 创建S3客户端
	 */
	private async createS3Client(inputs: any): Promise<S3Client> {
		// 这里应该从连接配置中获取S3配置
		// 暂时使用输入参数中的配置
		const config: any = {
			region: inputs.region || 'us-east-1',
			credentials: {
				accessKeyId: inputs.accessKeyId || process.env.AWS_ACCESS_KEY_ID || '',
				secretAccessKey: inputs.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || ''
			}
		};

		// 如果有自定义端点（如MinIO）
		if (inputs.endpoint) {
			config.endpoint = inputs.endpoint;
			config.forcePathStyle = true;
		}

		return new S3Client(config);
	}

	/**
	 * 执行存储桶操作
	 */
	private async executeBucketOperation(s3Client: S3Client, operation: string, inputs: any): Promise<any> {
		switch (operation) {
			case 'create':
				return await this.createBucket(s3Client, inputs);
			case 'list':
				return await this.listBuckets(s3Client, inputs);
			case 'delete':
				return await this.deleteBucket(s3Client, inputs);
			default:
				throw new Error(`不支持的存储桶操作: ${operation}`);
		}
	}

	/**
	 * 执行文件操作
	 */
	private async executeFileOperation(s3Client: S3Client, operation: string, inputs: any): Promise<any> {
		switch (operation) {
			case 'upload':
				return await this.uploadFile(s3Client, inputs);
			case 'download':
				return await this.downloadFile(s3Client, inputs);
			case 'delete':
				return await this.deleteFile(s3Client, inputs);
			case 'copy':
				return await this.copyFile(s3Client, inputs);
			case 'list':
				return await this.listFiles(s3Client, inputs);
			case 'info':
				return await this.getFileInfo(s3Client, inputs);
			case 'presignedUrl':
				return await this.generatePresignedUrl(s3Client, inputs);
			default:
				throw new Error(`不支持的文件操作: ${operation}`);
		}
	}

	/**
	 * 执行文件夹操作
	 */
	private async executeFolderOperation(s3Client: S3Client, operation: string, inputs: any): Promise<any> {
		switch (operation) {
			case 'create':
				return await this.createFolder(s3Client, inputs);
			case 'delete':
				return await this.deleteFolder(s3Client, inputs);
			case 'list':
				return await this.listFolderContents(s3Client, inputs);
			default:
				throw new Error(`不支持的文件夹操作: ${operation}`);
		}
	}

	/**
	 * 创建存储桶
	 */
	private async createBucket(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		
		const command = new CreateBucketCommand({
			Bucket: bucketName
		});

		await s3Client.send(command);

		return {
			success: true,
			data: [{
				bucketName,
				message: '存储桶创建成功'
			}]
		};
	}

	/**
	 * 列出存储桶
	 */
	private async listBuckets(s3Client: S3Client, inputs: any): Promise<any> {
		const command = new ListBucketsCommand({});
		const response = await s3Client.send(command);

		const buckets = response.Buckets?.map(bucket => ({
			name: bucket.Name,
			creationDate: bucket.CreationDate
		})) || [];

		return {
			success: true,
			data: buckets
		};
	}

	/**
	 * 删除存储桶
	 */
	private async deleteBucket(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		
		const command = new DeleteBucketCommand({
			Bucket: bucketName
		});

		await s3Client.send(command);

		return {
			success: true,
			data: [{
				bucketName,
				message: '存储桶删除成功'
			}]
		};
	}

	/**
	 * 上传文件
	 */
	private async uploadFile(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		const fileKey = inputs.fileKey;
		const dataType = inputs.dataType || 'binary';

		let body: Buffer | string;
		let contentType = inputs.contentType;
		let finalFileKey = fileKey;

		// 根据数据类型获取文件内容
		switch (dataType) {
			case 'binary':
				const binaryField = inputs.binaryField || 'data';
				const inputData = inputs.data || inputs.input || {};
				
				if (!inputData[binaryField]) {
					throw new Error(`输入数据中未找到字段: ${binaryField}`);
				}

				body = Buffer.isBuffer(inputData[binaryField]) 
					? inputData[binaryField] 
					: Buffer.from(inputData[binaryField], 'base64');
				
				// 如果没有指定文件键名，尝试从输入数据获取文件名
				if (!finalFileKey && inputData.filename) {
					finalFileKey = inputData.filename;
				}
				break;

			case 'text':
				body = inputs.textContent || '';
				contentType = contentType || 'text/plain';
				break;

			case 'file':
				const filePath = inputs.filePath;
				if (!fs.existsSync(filePath)) {
					throw new Error(`文件不存在: ${filePath}`);
				}
				body = fs.readFileSync(filePath);
				
				// 如果没有指定文件键名，使用文件名
				if (!finalFileKey) {
					finalFileKey = path.basename(filePath);
				}
				break;

			default:
				throw new Error(`不支持的数据类型: ${dataType}`);
		}

		if (!finalFileKey) {
			throw new Error('必须指定文件键名');
		}

		const uploadParams: any = {
			Bucket: bucketName,
			Key: finalFileKey,
			Body: body
		};

		if (contentType) {
			uploadParams.ContentType = contentType;
		}

		if (inputs.storageClass && inputs.storageClass !== 'STANDARD') {
			uploadParams.StorageClass = inputs.storageClass;
		}

		if (inputs.serverSideEncryption && inputs.serverSideEncryption !== 'none') {
			uploadParams.ServerSideEncryption = inputs.serverSideEncryption;
		}

		const command = new PutObjectCommand(uploadParams);
		const response = await s3Client.send(command);

		return {
			success: true,
			data: [{
				bucketName,
				fileKey: finalFileKey,
				etag: response.ETag,
				message: '文件上传成功'
			}]
		};
	}

	/**
	 * 下载文件
	 */
	private async downloadFile(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		const fileKey = inputs.fileKey;
		const downloadField = inputs.downloadField || 'data';

		const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: fileKey
		});

		const response = await s3Client.send(command);
		
		if (!response.Body) {
			throw new Error('文件内容为空');
		}

		// 将流转换为Buffer
		const bodyBytes = await response.Body?.transformToByteArray();
		const buffer = bodyBytes ? Buffer.from(bodyBytes) : Buffer.alloc(0);

		return {
			success: true,
			data: [{
				bucketName,
				fileKey,
				[downloadField]: buffer,
				contentType: response.ContentType,
				contentLength: response.ContentLength,
				lastModified: response.LastModified,
				etag: response.ETag,
				message: '文件下载成功'
			}]
		};
	}

	/**
	 * 删除文件
	 */
	private async deleteFile(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		const fileKey = inputs.fileKey;

		const command = new DeleteObjectCommand({
			Bucket: bucketName,
			Key: fileKey
		});

		await s3Client.send(command);

		return {
			success: true,
			data: [{
				bucketName,
				fileKey,
				message: '文件删除成功'
			}]
		};
	}

	/**
	 * 复制文件
	 */
	private async copyFile(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		const sourceKey = inputs.sourceKey;
		const targetKey = inputs.targetKey;

		const command = new CopyObjectCommand({
			Bucket: bucketName,
			CopySource: `${bucketName}/${sourceKey}`,
			Key: targetKey
		});

		const response = await s3Client.send(command);

		return {
			success: true,
			data: [{
				bucketName,
				sourceKey,
				targetKey,
				etag: response.CopyObjectResult?.ETag,
				message: '文件复制成功'
			}]
		};
	}

	/**
	 * 列出文件
	 */
	private async listFiles(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		const prefix = inputs.prefix || '';
		const maxKeys = inputs.maxKeys || 1000;

		const command = new ListObjectsV2Command({
			Bucket: bucketName,
			Prefix: prefix,
			MaxKeys: maxKeys
		});

		const response = await s3Client.send(command);

		const files = response.Contents?.map(obj => ({
			key: obj.Key,
			size: obj.Size,
			lastModified: obj.LastModified,
			etag: obj.ETag,
			storageClass: obj.StorageClass
		})) || [];

		return {
			success: true,
			data: files,
			metadata: {
				bucketName,
				prefix,
				count: files.length,
				isTruncated: response.IsTruncated
			}
		};
	}

	/**
	 * 获取文件信息
	 */
	private async getFileInfo(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		const fileKey = inputs.fileKey;

		const command = new HeadObjectCommand({
			Bucket: bucketName,
			Key: fileKey
		});

		const response = await s3Client.send(command);

		return {
			success: true,
			data: [{
				bucketName,
				fileKey,
				contentType: response.ContentType,
				contentLength: response.ContentLength,
				lastModified: response.LastModified,
				etag: response.ETag,
				storageClass: response.StorageClass,
				serverSideEncryption: response.ServerSideEncryption
			}]
		};
	}

	/**
	 * 生成预签名URL
	 */
	private async generatePresignedUrl(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		const fileKey = inputs.fileKey;
		const expiresIn = inputs.expiresIn || 3600;

		const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: fileKey
		});

		const url = await getSignedUrl(s3Client, command, { expiresIn });

		return {
			success: true,
			data: [{
				bucketName,
				fileKey,
				presignedUrl: url,
				expiresIn,
				expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
				message: '预签名URL生成成功'
			}]
		};
	}

	/**
	 * 创建文件夹
	 */
	private async createFolder(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		let folderPath = inputs.folderPath || '';

		// 确保文件夹路径以/结尾
		if (folderPath && !folderPath.endsWith('/')) {
			folderPath += '/';
		}

		const command = new PutObjectCommand({
			Bucket: bucketName,
			Key: folderPath,
			Body: ''
		});

		await s3Client.send(command);

		return {
			success: true,
			data: [{
				bucketName,
				folderPath,
				message: '文件夹创建成功'
			}]
		};
	}

	/**
	 * 删除文件夹
	 */
	private async deleteFolder(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		let folderPath = inputs.folderPath || '';

		// 确保文件夹路径以/结尾
		if (folderPath && !folderPath.endsWith('/')) {
			folderPath += '/';
		}

		// 首先列出文件夹中的所有对象
		const listCommand = new ListObjectsV2Command({
			Bucket: bucketName,
			Prefix: folderPath
		});

		const listResponse = await s3Client.send(listCommand);
		const objects = listResponse.Contents || [];

		// 删除所有对象
		const deletePromises = objects.map(obj => {
			const deleteCommand = new DeleteObjectCommand({
				Bucket: bucketName,
				Key: obj.Key!
			});
			return s3Client.send(deleteCommand);
		});

		await Promise.all(deletePromises);

		return {
			success: true,
			data: [{
				bucketName,
				folderPath,
				deletedCount: objects.length,
				message: '文件夹删除成功'
			}]
		};
	}

	/**
	 * 列出文件夹内容
	 */
	private async listFolderContents(s3Client: S3Client, inputs: any): Promise<any> {
		const bucketName = inputs.bucketName;
		let folderPath = inputs.folderPath || '';
		const maxKeys = inputs.maxKeys || 1000;

		// 确保文件夹路径以/结尾（如果不为空）
		if (folderPath && !folderPath.endsWith('/')) {
			folderPath += '/';
		}

		const command = new ListObjectsV2Command({
			Bucket: bucketName,
			Prefix: folderPath,
			Delimiter: '/',
			MaxKeys: maxKeys
		});

		const response = await s3Client.send(command);

		// 文件夹
		const folders = response.CommonPrefixes?.map(prefix => ({
			type: 'folder',
			name: prefix.Prefix?.replace(folderPath, '').replace('/', ''),
			fullPath: prefix.Prefix
		})) || [];

		// 文件
		const files = response.Contents?.filter(obj => obj.Key !== folderPath).map(obj => ({
			type: 'file',
			name: obj.Key?.replace(folderPath, ''),
			fullPath: obj.Key,
			size: obj.Size,
			lastModified: obj.LastModified,
			etag: obj.ETag
		})) || [];

		const contents = [...folders, ...files];

		return {
			success: true,
			data: contents,
			metadata: {
				bucketName,
				folderPath,
				count: contents.length,
				fileCount: files.length,
				folderCount: folders.length
			}
		};
	}
}