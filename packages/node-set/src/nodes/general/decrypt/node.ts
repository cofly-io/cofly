import type { BinaryToTextEncoding } from 'crypto';
import { createDecipheriv, createVerify, privateDecrypt, publicDecrypt } from 'crypto';
import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class Decrypt implements INode {
	node: INodeBasic = {
		kind: 'decrypt',
		name: '解密工具',
		event: 'decrypt',
		catalog: 'general',
		version: 1,
		description: '提供解密、验签、解码等密码学功能',
		icon: 'decrypt.svg',
		nodeWidth: 400
	};

	detail: INodeDetail = {
		fields: [
			{
				displayName: '操作类型',
				name: 'action',
				type: 'options',
				options: [
					{
						name: 'Base64解码',
						value: 'base64decode',
						description: '将Base64编码的字符串解码为原始文本',
					},
					{
						name: 'HEX解码',
						value: 'hexdecode',
						description: '将HEX编码的字符串解码为原始文本',
					},
					{
						name: 'AES解密',
						value: 'aes',
						description: '使用AES算法进行对称解密',
					},
					{
						name: 'RSA私钥解密',
						value: 'rsa_private',
						description: '使用RSA私钥解密数据',
					},
					{
						name: 'RSA公钥解密',
						value: 'rsa_public',
						description: '使用RSA公钥解密数据',
					},
					{
						name: '数字签名验证',
						value: 'verify',
						description: '使用公钥验证数字签名',
					}
				],
				default: 'base64decode',
				placeholder: '选择操作类型',
				controlType: 'selectwithdesc'
			},
			{
				displayName: '加密数据',
				name: 'encryptedData',
				type: 'string',
				default: '',
				required: true,
				placeholder: '要解密的数据',
				controlType: 'textarea'
			},
			{
				displayName: 'AES算法',
				name: 'aesAlgorithm',
				type: 'options',
				options: [
					{
						name: 'AES-256-CBC',
						value: 'aes-256-cbc',
					},
					{
						name: 'AES-192-CBC',
						value: 'aes-192-cbc',
					},
					{
						name: 'AES-128-CBC',
						value: 'aes-128-cbc',
					},
					{
						name: 'AES-256-GCM',
						value: 'aes-256-gcm',
					},
					{
						name: 'AES-192-GCM',
						value: 'aes-192-gcm',
					},
					{
						name: 'AES-128-GCM',
						value: 'aes-128-gcm',
					}
				],
				default: 'aes-256-cbc',
				placeholder: '选择AES算法',
				controlType: 'select',
				displayOptions: {
					showBy: {
						action: ['aes']
					}
				}
			},
			{
				displayName: '密钥',
				name: 'key',
				type: 'string',
				default: '',
				required: true,
				placeholder: '解密密钥',
				controlType: 'password',
				displayOptions: {
					showBy: {
						action: ['aes']
					}
				}
			},
			{
				displayName: '初始化向量(IV)',
				name: 'iv',
				type: 'string',
				default: '',
				placeholder: '初始化向量（可选）',
				controlType: 'input',
				displayOptions: {
					showBy: {
						action: ['aes']
					}
				}
			},
			{
				displayName: '私钥',
				name: 'privateKey',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'RSA私钥（PEM格式）',
				controlType: 'textarea',
				displayOptions: {
					showBy: {
						action: ['rsa_private']
					}
				}
			},
			{
				displayName: '公钥',
				name: 'publicKey',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'RSA公钥（PEM格式）',
				controlType: 'textarea',
				displayOptions: {
					showBy: {
						action: ['rsa_public', 'verify']
					}
				}
			},
			{
				displayName: '原始数据',
				name: 'originalData',
				type: 'string',
				default: '',
				required: true,
				placeholder: '用于验证签名的原始数据',
				controlType: 'textarea',
				displayOptions: {
					showBy: {
						action: ['verify']
					}
				}
			},
			{
				displayName: '签名数据',
				name: 'signature',
				type: 'string',
				default: '',
				required: true,
				placeholder: '要验证的签名数据',
				controlType: 'textarea',
				displayOptions: {
					showBy: {
						action: ['verify']
					}
				}
			},
			{
				displayName: '签名算法',
				name: 'algorithm',
				type: 'options',
				options: [
					{
						name: 'RSA-SHA256',
						value: 'RSA-SHA256',
					},
					{
						name: 'RSA-SHA1',
						value: 'RSA-SHA1',
					},
					{
						name: 'RSA-SHA512',
						value: 'RSA-SHA512',
					}
				],
				default: 'RSA-SHA256',
				placeholder: '选择签名算法',
				controlType: 'select',
				displayOptions: {
					showBy: {
						action: ['verify']
					}
				}
			},
			{
				displayName: '输入编码格式',
				name: 'inputEncoding',
				type: 'options',
				options: [
					{
						name: 'BASE64',
						value: 'base64',
					},
					{
						name: 'HEX',
						value: 'hex',
					}
				],
				default: 'base64',
				placeholder: '选择输入编码格式',
				controlType: 'select',
				displayOptions: {
					showBy: {
						action: ['aes', 'rsa_private', 'rsa_public', 'verify']
					}
				}
			},
			{
				displayName: '输出属性名',
				name: 'outputProperty',
				type: 'string',
				default: 'result',
				required: true,
				placeholder: '结果存储的属性名',
				controlType: 'input'
			}
		]
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const action = opts.inputs?.action || 'base64decode';

		try {
			const outputProperty = opts.inputs?.outputProperty || 'result';
			let result: string | boolean;

			switch (action) {
				case 'base64decode':
					result = await this.base64Decode(opts.inputs);
					break;
				case 'hexdecode':
					result = await this.hexDecode(opts.inputs);
					break;
				case 'aes':
					result = await this.aesDecrypt(opts.inputs);
					break;
				case 'rsa_private':
					result = await this.rsaPrivateDecrypt(opts.inputs);
					break;
				case 'rsa_public':
					result = await this.rsaPublicDecrypt(opts.inputs);
					break;
				case 'verify':
					result = await this.verifySignature(opts.inputs);
					break;
				default:
					throw new Error(`不支持的操作类型: ${action}`);
			}

			return {
				[outputProperty]: result,
				action,
				success: true,
				timestamp: new Date().toISOString()
			};
		} catch (error: any) {
			console.error('❌ [Decrypt Node] 执行错误:', error.message);
			return {
				error: error.message,
				success: false,
				action
			};
		}
	}

	private async base64Decode(inputs: any): Promise<string> {
		const encryptedData = inputs?.encryptedData || '';
		
		if (!encryptedData) {
			throw new Error('请提供要解码的Base64数据');
		}

		try {
			return Buffer.from(encryptedData, 'base64').toString('utf8');
		} catch (error) {
			throw new Error('Base64解码失败，请检查输入数据格式');
		}
	}

	private async hexDecode(inputs: any): Promise<string> {
		const encryptedData = inputs?.encryptedData || '';
		
		if (!encryptedData) {
			throw new Error('请提供要解码的HEX数据');
		}

		try {
			return Buffer.from(encryptedData, 'hex').toString('utf8');
		} catch (error) {
			throw new Error('HEX解码失败，请检查输入数据格式');
		}
	}

	private async aesDecrypt(inputs: any): Promise<string> {
		const encryptedData = inputs?.encryptedData || '';
		const key = inputs?.key || '';
		const iv = inputs?.iv || '';
		const algorithm = inputs?.aesAlgorithm || 'aes-256-cbc';
		const inputEncoding = (inputs?.inputEncoding || 'base64') as BinaryToTextEncoding;

		if (!encryptedData || !key) {
			throw new Error('AES解密需要提供加密数据和密钥');
		}

		try {
			const keyBuffer = Buffer.from(key, 'utf8');
			const ivBuffer = iv ? Buffer.from(iv, 'hex') : Buffer.alloc(16, 0);
			const encryptedBuffer = Buffer.from(encryptedData, inputEncoding);

			const decipher = createDecipheriv(algorithm, keyBuffer, ivBuffer);
			let decrypted = decipher.update(encryptedBuffer);
			decrypted = Buffer.concat([decrypted, decipher.final()]);

			return decrypted.toString('utf8');
		} catch (error: any) {
			throw new Error(`AES解密失败: ${error.message}`);
		}
	}

	private async rsaPrivateDecrypt(inputs: any): Promise<string> {
		const encryptedData = inputs?.encryptedData || '';
		const privateKey = inputs?.privateKey || '';
		const inputEncoding = (inputs?.inputEncoding || 'base64') as BinaryToTextEncoding;

		if (!encryptedData || !privateKey) {
			throw new Error('RSA私钥解密需要提供加密数据和私钥');
		}

		try {
			const encryptedBuffer = Buffer.from(encryptedData, inputEncoding);
			const decryptedBuffer = privateDecrypt(privateKey, encryptedBuffer);
			return decryptedBuffer.toString('utf8');
		} catch (error: any) {
			throw new Error(`RSA私钥解密失败: ${error.message}`);
		}
	}

	private async rsaPublicDecrypt(inputs: any): Promise<string> {
		const encryptedData = inputs?.encryptedData || '';
		const publicKey = inputs?.publicKey || '';
		const inputEncoding = (inputs?.inputEncoding || 'base64') as BinaryToTextEncoding;

		if (!encryptedData || !publicKey) {
			throw new Error('RSA公钥解密需要提供加密数据和公钥');
		}

		try {
			const encryptedBuffer = Buffer.from(encryptedData, inputEncoding);
			const decryptedBuffer = publicDecrypt(publicKey, encryptedBuffer);
			return decryptedBuffer.toString('utf8');
		} catch (error: any) {
			throw new Error(`RSA公钥解密失败: ${error.message}`);
		}
	}

	private async verifySignature(inputs: any): Promise<boolean> {
		const originalData = inputs?.originalData || '';
		const signature = inputs?.signature || '';
		const publicKey = inputs?.publicKey || '';
		const algorithm = inputs?.algorithm || 'RSA-SHA256';
		const inputEncoding = (inputs?.inputEncoding || 'base64') as BinaryToTextEncoding;

		if (!originalData || !signature || !publicKey) {
			throw new Error('签名验证需要提供原始数据、签名和公钥');
		}

		try {
			const verify = createVerify(algorithm);
			verify.write(originalData);
			verify.end();

			const signatureBuffer = Buffer.from(signature, inputEncoding);
			return verify.verify(publicKey, signatureBuffer);
		} catch (error: any) {
			throw new Error(`签名验证失败: ${error.message}`);
		}
	}
}