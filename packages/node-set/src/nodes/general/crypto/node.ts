import type { BinaryToTextEncoding } from 'crypto';
import { createHash, createHmac, createSign, getHashes, randomBytes } from 'crypto';
import { v4 as uuid } from 'uuid';
import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

const unsupportedAlgorithms = [
	'RSA-MD4',
	'RSA-MDC2',
	'md4',
	'md4WithRSAEncryption',
	'mdc2',
	'mdc2WithRSA',
];

const supportedAlgorithms = getHashes()
	.filter((algorithm) => !unsupportedAlgorithms.includes(algorithm))
	.map((algorithm) => ({ name: algorithm, value: algorithm }));

export class Crypto implements INode {
	node: INodeBasic = {
		kind: 'crypto',
		name: '加密工具',
		event: 'crypto',
		catalog: 'general',
		version: 1,
		description: '提供加密、哈希、签名等密码学功能',
		icon: 'crypto.svg',
		nodeWidth: 400
	};

	detail: INodeDetail = {
		fields: [
			{
				label: '操作类型',
				fieldName: 'action',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'hash',
					placeholder: '选择操作类型',
					options: [
						{
							name: '生成随机字符串',
							value: 'generate',
							description: '生成UUID、HEX、BASE64等格式的随机字符串',
						},
						{
							name: '哈希',
							value: 'hash',
							description: '使用MD5、SHA256等算法生成哈希值',
						},
						{
							name: 'HMAC',
							value: 'hmac',
							description: '使用密钥生成HMAC哈希值',
						},
						{
							name: '数字签名',
							value: 'sign',
							description: '使用私钥对数据进行数字签名',
						}
					]
				}
			},
			{
				label: '哈希类型',
				fieldName: 'hashType',
				conditionRules: {
					showBy: {
						action: ['hash', 'hmac']
					}
				},
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'SHA256',
					placeholder: '选择哈希算法',
					options: [
						{
							name: 'MD5',
							value: 'MD5',
						},
						{
							name: 'SHA256',
							value: 'SHA256',
						},
						{
							name: 'SHA3-256',
							value: 'SHA3-256',
						},
						{
							name: 'SHA3-384',
							value: 'SHA3-384',
						},
						{
							name: 'SHA3-512',
							value: 'SHA3-512',
						},
						{
							name: 'SHA384',
							value: 'SHA384',
						},
						{
							name: 'SHA512',
							value: 'SHA512',
						}
					]
				}
			},
			{
				label: '输入值',
				fieldName: 'value',
				conditionRules: {
					showBy: {
						action: ['hash', 'hmac', 'sign']
					}
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '要处理的文本内容',
					validation: { required: true }
				}
			},
			{
				label: '密钥',
				fieldName: 'secret',
				conditionRules: {
					showBy: {
						action: ['hmac']
					}
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '用于HMAC的密钥',
					validation: { required: true }
				}
			},
			{
				label: '私钥',
				fieldName: 'privateKey',
				conditionRules: {
					showBy: {
						action: ['sign']
					}
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '用于签名的私钥',
					validation: { required: true }
				}
			},
			{
				label: '签名算法',
				fieldName: 'algorithm',
				conditionRules: {
					showBy: {
						action: ['sign']
					}
				},
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'RSA-SHA256',
					placeholder: '选择签名算法',
					options: supportedAlgorithms.map(alg => ({
						name: alg.name,
						value: alg.value,
					}))
				}
			},
			{
				label: '编码格式',
				fieldName: 'encoding',
				conditionRules: {
					showBy: {
						action: ['hash', 'hmac', 'sign']
					}
				},
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'hex',
					placeholder: '选择编码格式',
					options: [
						{
							name: 'HEX',
							value: 'hex',
						},
						{
							name: 'BASE64',
							value: 'base64',
						}
					]
				}
			},
			{
				label: '生成类型',
				fieldName: 'generateType',
				conditionRules: {
					showBy: {
						action: ['generate']
					}
				},
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'uuid',
					placeholder: '选择生成类型',
					options: [
						{
							name: 'UUID',
							value: 'uuid',
						},
						{
							name: 'HEX',
							value: 'hex',
						},
						{
							name: 'BASE64',
							value: 'base64',
						},
						{
							name: 'ASCII',
							value: 'ascii',
						}
					]
				}
			},
			{
				label: '字符串长度',
				fieldName: 'stringLength',
				conditionRules: {
					showBy: {
						action: ['generate'],
						generateType: ['hex', 'base64', 'ascii']
					}
				},
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 32,
					placeholder: '生成字符串的长度',
					validation: { required: true }
				}
			},
			{
				label: '输出属性名',
				fieldName: 'outputProperty',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'result',
					placeholder: '结果存储的属性名',
					validation: { required: true }
				}
			}
		]
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		const action = opts.inputs?.action || 'hash';

		try {
			const outputProperty = opts.inputs?.outputProperty || 'result';
			let result: string;

			switch (action) {
				case 'generate':
					result = await this.generateRandom(opts.inputs);
					break;
				case 'hash':
					result = await this.createHash(opts.inputs);
					break;
				case 'hmac':
					result = await this.createHmac(opts.inputs);
					break;
				case 'sign':
					result = await this.createSignature(opts.inputs);
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
			console.error('❌ [Crypto Node] 执行错误:', error.message);
			return {
				error: error.message,
				success: false,
				action
			};
		}
	}

	private async generateRandom(inputs: any): Promise<string> {
		const generateType = inputs?.generateType || 'uuid';
		
		if (generateType === 'uuid') {
			return uuid();
		}

		const stringLength = parseInt(inputs?.stringLength) || 32;
		const bytes = randomBytes(stringLength);

		switch (generateType) {
			case 'base64':
				return bytes.toString('base64').replace(/\W/g, '').slice(0, stringLength);
			case 'hex':
				return bytes.toString('hex').slice(0, stringLength);
			case 'ascii':
				return bytes.toString('ascii').slice(0, stringLength);
			default:
				throw new Error(`不支持的生成类型: ${generateType}`);
		}
	}

	private async createHash(inputs: any): Promise<string> {
		const hashType = inputs?.hashType || 'SHA256';
		const value = inputs?.value || '';
		const encoding = (inputs?.encoding || 'hex') as BinaryToTextEncoding;

		const hash = createHash(hashType);
		hash.update(value);
		return hash.digest(encoding);
	}

	private async createHmac(inputs: any): Promise<string> {
		const hashType = inputs?.hashType || 'SHA256';
		const value = inputs?.value || '';
		const secret = inputs?.secret || '';
		const encoding = (inputs?.encoding || 'hex') as BinaryToTextEncoding;

		if (!secret) {
			throw new Error('HMAC操作需要提供密钥');
		}

		const hmac = createHmac(hashType, secret);
		hmac.update(value);
		return hmac.digest(encoding);
	}

	private async createSignature(inputs: any): Promise<string> {
		const algorithm = inputs?.algorithm || 'RSA-SHA256';
		const value = inputs?.value || '';
		const privateKey = inputs?.privateKey || '';
		const encoding = (inputs?.encoding || 'hex') as BinaryToTextEncoding;

		if (!privateKey) {
			throw new Error('数字签名需要提供私钥');
		}

		const sign = createSign(algorithm);
		sign.write(value);
		sign.end();
		return sign.sign(privateKey, encoding);
	}
}