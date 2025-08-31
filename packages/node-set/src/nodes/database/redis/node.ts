import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink, credentialManager } from '@repo/common';

export class Redis implements INode {
	node: INodeBasic = {
		kind: 'redis',
		name: 'Redis数据库',
		event: "redis",
		catalog: 'database',
		version: 1,
		description: "连接Redis数据库进行键值操作、缓存管理和数据存储",
		icon: 'redis.svg',
		nodeWidth: 600
	};

	detail: INodeDetail = {
		fields: [
			// 数据库连接配置
			{
				displayName: '连接源',
				name: 'datasource',
				type: 'string',
				default: '',
				required: true,
				connectType: "redis",
				controlType: 'selectconnect'
			},
			// 操作类型选择器
			{
				displayName: '操作类型',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: '执行命令',
						value: 'executeCommand',
						description: '执行自定义Redis命令',
					},
					{
						name: '获取值',
						value: 'get',
						description: '根据键获取对应的值',
					},
					{
						name: '设置值',
						value: 'set',
						description: '设置键值对',
					},
					{
						name: '删除键',
						value: 'delete',
						description: '删除指定的键',
					},
					{
						name: '检查键存在',
						value: 'exists',
						description: '检查键是否存在',
					},
					{
						name: '设置过期时间',
						value: 'expire',
						description: '为键设置过期时间',
					},
					{
						name: '获取所有键',
						value: 'keys',
						description: '获取匹配模式的所有键',
					},
					{
						name: 'Hash操作',
						value: 'hash',
						description: 'Hash数据结构操作',
					},
					{
						name: 'List操作',
						value: 'list',
						description: 'List数据结构操作',
					},
					{
						name: 'Set操作',
						value: 'set_ops',
						description: 'Set数据结构操作',
					}
				],
				default: 'executeCommand',
				placeholder: '选择操作类型',
				controlType: 'selectwithdesc'
			},

			// 键名（大部分操作都需要）
			{
				displayName: '键名',
				name: 'key',
				type: 'string',
				displayOptions: {
					hide: {
						operation: ['executeCommand', 'keys'],
					},
				},
				default: '',
				required: true,
				placeholder: '例如: user:123, cache:data',
				controlType: 'input'
			},

			// 值（设置操作需要）
			{
				displayName: '值',
				name: 'value',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['set'],
					},
				},
				default: '',
				required: true,
				placeholder: '要设置的值',
				controlType: 'textarea'
			},

			// 过期时间（设置值和过期时间操作需要）
			{
				displayName: '过期时间(秒)',
				name: 'expireTime',
				type: 'number',
				displayOptions: {
					showBy: {
						operation: ['set', 'expire'],
					},
				},
				default: 0,
				placeholder: '0表示永不过期',
				controlType: 'input'
			},

			// 键模式（获取所有键操作需要）
			{
				displayName: '键模式',
				name: 'pattern',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['keys'],
					},
				},
				default: '*',
				placeholder: '例如: user:*, cache:*, *',
				controlType: 'input'
			},

			// Hash操作相关字段
			{
				displayName: 'Hash操作类型',
				name: 'hashOperation',
				type: 'options',
				displayOptions: {
					showBy: {
						operation: ['hash'],
					},
				},
				options: [
					{ name: '获取字段值', value: 'hget' },
					{ name: '设置字段值', value: 'hset' },
					{ name: '获取所有字段', value: 'hgetall' },
					{ name: '删除字段', value: 'hdel' },
					{ name: '检查字段存在', value: 'hexists' }
				],
				default: 'hget',
				controlType: 'select'
			},

			{
				displayName: 'Hash字段名',
				name: 'hashField',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['hash'],
						hashOperation: ['hget', 'hset', 'hdel', 'hexists']
					},
				},
				default: '',
				placeholder: 'Hash字段名',
				controlType: 'input'
			},

			{
				displayName: 'Hash字段值',
				name: 'hashValue',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['hash'],
						hashOperation: ['hset']
					},
				},
				default: '',
				placeholder: 'Hash字段值',
				controlType: 'input'
			},

			// List操作相关字段
			{
				displayName: 'List操作类型',
				name: 'listOperation',
				type: 'options',
				displayOptions: {
					showBy: {
						operation: ['list'],
					},
				},
				options: [
					{ name: '左侧推入', value: 'lpush' },
					{ name: '右侧推入', value: 'rpush' },
					{ name: '左侧弹出', value: 'lpop' },
					{ name: '右侧弹出', value: 'rpop' },
					{ name: '获取范围', value: 'lrange' },
					{ name: '获取长度', value: 'llen' }
				],
				default: 'lpush',
				controlType: 'select'
			},

			{
				displayName: 'List值',
				name: 'listValue',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['list'],
						listOperation: ['lpush', 'rpush']
					},
				},
				default: '',
				placeholder: 'List元素值',
				controlType: 'input'
			},

			{
				displayName: '开始索引',
				name: 'listStart',
				type: 'number',
				displayOptions: {
					showBy: {
						operation: ['list'],
						listOperation: ['lrange']
					},
				},
				default: 0,
				placeholder: '开始索引',
				controlType: 'input'
			},

			{
				displayName: '结束索引',
				name: 'listEnd',
				type: 'number',
				displayOptions: {
					showBy: {
						operation: ['list'],
						listOperation: ['lrange']
					},
				},
				default: -1,
				placeholder: '结束索引（-1表示最后一个）',
				controlType: 'input'
			},

			// Set操作相关字段
			{
				displayName: 'Set操作类型',
				name: 'setOperation',
				type: 'options',
				displayOptions: {
					showBy: {
						operation: ['set_ops'],
					},
				},
				options: [
					{ name: '添加成员', value: 'sadd' },
					{ name: '移除成员', value: 'srem' },
					{ name: '获取所有成员', value: 'smembers' },
					{ name: '检查成员存在', value: 'sismember' },
					{ name: '获取成员数量', value: 'scard' }
				],
				default: 'sadd',
				controlType: 'select'
			},

			{
				displayName: 'Set成员值',
				name: 'setMember',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['set_ops'],
						setOperation: ['sadd', 'srem', 'sismember']
					},
				},
				default: '',
				placeholder: 'Set成员值',
				controlType: 'input'
			},

			// 自定义命令
			{
				displayName: 'Redis命令',
				name: 'command',
				type: 'string',
				displayOptions: {
					showBy: {
						operation: ['executeCommand'],
					},
				},
				default: '',
				required: true,
				placeholder: '例如: GET user:123, SET cache:data "value", HGET user:123 name',
				controlType: 'textarea'
			},

			// 连接选项
			{
				displayName: '连接超时(秒)',
				name: 'connectionTimeout',
				type: 'number',
				default: 30,
				placeholder: '连接超时时间',
				controlType: 'input'
			}
		],
	};

	/**
	 * 执行Redis操作
	 */
	async execute(opts: IExecuteOptions): Promise<any> {
		console.log('🚀 [Redis Node] execute 方法被调用:', opts);

		try {
			// 获取连接配置
			const datasourceId = opts.inputs?.datasource;
			if (!datasourceId) {
				throw new Error('数据源ID不能为空');
			}

			const connectConfig = await credentialManager.mediator?.get(datasourceId);
			if (!connectConfig) {
				throw new Error(`连接配置不存在: ${datasourceId}`);
			}

			const configData = connectConfig.config;
			const client = await this.createRedisConnection(configData);

			try {
				// 根据操作类型执行相应的Redis操作
				const operation = opts.inputs?.operation;
				let result;

				switch (operation) {
					case 'get':
						result = await this.executeGet(client, opts);
						break;
					case 'set':
						result = await this.executeSet(client, opts);
						break;
					case 'delete':
						result = await this.executeDelete(client, opts);
						break;
					case 'exists':
						result = await this.executeExists(client, opts);
						break;
					case 'expire':
						result = await this.executeExpire(client, opts);
						break;
					case 'keys':
						result = await this.executeKeys(client, opts);
						break;
					case 'hash':
						result = await this.executeHash(client, opts);
						break;
					case 'list':
						result = await this.executeList(client, opts);
						break;
					case 'set_ops':
						result = await this.executeSetOps(client, opts);
						break;
					case 'executeCommand':
						result = await this.executeCustomCommand(client, opts);
						break;
					default:
						throw new Error(`不支持的操作类型: ${operation}`);
				}

				console.log('✅ [Redis Node] 操作执行成功:', result);
				return result;

			} finally {
				// 关闭连接
				await this.closeRedisConnection(client);
			}

		} catch (error: any) {
			console.error('❌ [Redis Node] execute 执行错误:', error.message);
			throw error;
		}
	}

	/**
	 * 创建Redis连接
	 */
	private async createRedisConnection(config: Record<string, any>): Promise<any> {
		let client: any = null;

		try {
			// 首先尝试使用redis驱动
			try {
				const redis = await import('redis');
				client = await this.createRedisClient(redis, config);
				return client;
			} catch (redisError) {
				console.log('Redis驱动不可用，尝试ioredis驱动');
			}

			// 如果redis不可用，尝试ioredis驱动
			try {
				const ioredis = await import('ioredis');
				const Redis = ioredis.default || ioredis;
				client = await this.createIoredisClient(Redis, config);
				return client;
			} catch (ioredisError) {
				throw new Error('Redis和IORedis驱动都不可用，请安装其中一个: npm install redis 或 npm install ioredis');
			}

		} catch (error: any) {
			throw new Error(`创建Redis连接失败: ${error.message}`);
		}
	}

	/**
	 * 创建redis客户端
	 */
	private async createRedisClient(redis: any, config: Record<string, any>): Promise<any> {
		const connectionConfig: any = {
			socket: {
				host: config.host || 'localhost',
				port: config.port || 6379,
				connectTimeout: (config.connectTimeout || 10) * 1000,
				commandTimeout: (config.commandTimeout || 30) * 1000,
				tls: config.tls || false
			},
			database: config.database || 0
		};

		// 添加认证信息
		if (config.password) {
			if (config.username) {
				connectionConfig.username = config.username;
				connectionConfig.password = config.password;
			} else {
				connectionConfig.password = config.password;
			}
		}

		const client = redis.createClient(connectionConfig);
		await client.connect();
		return client;
	}

	/**
	 * 创建ioredis客户端
	 */
	private async createIoredisClient(Redis: any, config: Record<string, any>): Promise<any> {
		const connectionConfig: any = {
			host: config.host || 'localhost',
			port: config.port || 6379,
			db: config.database || 0,
			connectTimeout: (config.connectTimeout || 10) * 1000,
			commandTimeout: (config.commandTimeout || 30) * 1000,
			retryDelayOnFailover: config.retryDelayOnFailover || 100,
			maxRetriesPerRequest: config.maxRetriesPerRequest || 3,
			lazyConnect: true
		};

		// 添加认证信息
		if (config.password) {
			if (config.username) {
				connectionConfig.username = config.username;
				connectionConfig.password = config.password;
			} else {
				connectionConfig.password = config.password;
			}
		}

		// TLS配置
		if (config.tls) {
			connectionConfig.tls = {};
		}

		const client = new Redis(connectionConfig);
		await client.connect();
		return client;
	}

	/**
	 * 关闭Redis连接
	 */
	private async closeRedisConnection(client: any): Promise<void> {
		if (client) {
			try {
				if (typeof client.quit === 'function') {
					await client.quit();
				} else if (typeof client.disconnect === 'function') {
					await client.disconnect();
				}
			} catch (error) {
				console.warn('关闭Redis连接时出现警告:', error);
			}
		}
	}

	// Redis操作方法实现
	private async executeGet(client: any, opts: IExecuteOptions): Promise<any> {
		const key = opts.inputs?.key;
		if (!key) {
			throw new Error('键名不能为空');
		}

		const value = await client.get(key);
		return {
			key,
			value,
			exists: value !== null,
			success: true,
			operation: 'get'
		};
	}

	private async executeSet(client: any, opts: IExecuteOptions): Promise<any> {
		const key = opts.inputs?.key;
		const value = opts.inputs?.value;
		const expireTime = opts.inputs?.expireTime;

		if (!key) {
			throw new Error('键名不能为空');
		}
		if (value === undefined || value === null) {
			throw new Error('值不能为空');
		}

		let result;
		if (expireTime && expireTime > 0) {
			result = await client.setEx(key, expireTime, value);
		} else {
			result = await client.set(key, value);
		}

		return {
			key,
			value,
			expireTime: expireTime || null,
			result,
			success: true,
			operation: 'set'
		};
	}

	private async executeDelete(client: any, opts: IExecuteOptions): Promise<any> {
		const key = opts.inputs?.key;
		if (!key) {
			throw new Error('键名不能为空');
		}

		const deletedCount = await client.del(key);
		return {
			key,
			deletedCount,
			deleted: deletedCount > 0,
			success: true,
			operation: 'delete'
		};
	}

	private async executeExists(client: any, opts: IExecuteOptions): Promise<any> {
		const key = opts.inputs?.key;
		if (!key) {
			throw new Error('键名不能为空');
		}

		const exists = await client.exists(key);
		return {
			key,
			exists: exists === 1,
			success: true,
			operation: 'exists'
		};
	}

	private async executeExpire(client: any, opts: IExecuteOptions): Promise<any> {
		const key = opts.inputs?.key;
		const expireTime = opts.inputs?.expireTime;

		if (!key) {
			throw new Error('键名不能为空');
		}
		if (!expireTime || expireTime <= 0) {
			throw new Error('过期时间必须大于0');
		}

		const result = await client.expire(key, expireTime);
		return {
			key,
			expireTime,
			set: result === 1,
			success: true,
			operation: 'expire'
		};
	}

	private async executeKeys(client: any, opts: IExecuteOptions): Promise<any> {
		const pattern = opts.inputs?.pattern || '*';

		const keys = await client.keys(pattern);
		return {
			pattern,
			keys,
			count: keys.length,
			success: true,
			operation: 'keys'
		};
	}

	private async executeHash(client: any, opts: IExecuteOptions): Promise<any> {
		const key = opts.inputs?.key;
		const hashOperation = opts.inputs?.hashOperation;
		const hashField = opts.inputs?.hashField;
		const hashValue = opts.inputs?.hashValue;

		if (!key) {
			throw new Error('键名不能为空');
		}

		let result;
		switch (hashOperation) {
			case 'hget':
				if (!hashField) throw new Error('Hash字段名不能为空');
				result = await client.hGet(key, hashField);
				return { key, field: hashField, value: result, success: true, operation: 'hget' };

			case 'hset':
				if (!hashField) throw new Error('Hash字段名不能为空');
				if (hashValue === undefined) throw new Error('Hash字段值不能为空');
				result = await client.hSet(key, hashField, hashValue);
				return { key, field: hashField, value: hashValue, created: result === 1, success: true, operation: 'hset' };

			case 'hgetall':
				result = await client.hGetAll(key);
				return { key, data: result, success: true, operation: 'hgetall' };

			case 'hdel':
				if (!hashField) throw new Error('Hash字段名不能为空');
				result = await client.hDel(key, hashField);
				return { key, field: hashField, deleted: result === 1, success: true, operation: 'hdel' };

			case 'hexists':
				if (!hashField) throw new Error('Hash字段名不能为空');
				result = await client.hExists(key, hashField);
				return { key, field: hashField, exists: result === 1, success: true, operation: 'hexists' };

			default:
				throw new Error(`不支持的Hash操作: ${hashOperation}`);
		}
	}

	private async executeList(client: any, opts: IExecuteOptions): Promise<any> {
		const key = opts.inputs?.key;
		const listOperation = opts.inputs?.listOperation;
		const listValue = opts.inputs?.listValue;
		const listStart = opts.inputs?.listStart;
		const listEnd = opts.inputs?.listEnd;

		if (!key) {
			throw new Error('键名不能为空');
		}

		let result;
		switch (listOperation) {
			case 'lpush':
				if (!listValue) throw new Error('List值不能为空');
				result = await client.lPush(key, listValue);
				return { key, value: listValue, length: result, success: true, operation: 'lpush' };

			case 'rpush':
				if (!listValue) throw new Error('List值不能为空');
				result = await client.rPush(key, listValue);
				return { key, value: listValue, length: result, success: true, operation: 'rpush' };

			case 'lpop':
				result = await client.lPop(key);
				return { key, value: result, success: true, operation: 'lpop' };

			case 'rpop':
				result = await client.rPop(key);
				return { key, value: result, success: true, operation: 'rpop' };

			case 'lrange':
				const start = listStart !== undefined ? listStart : 0;
				const end = listEnd !== undefined ? listEnd : -1;
				result = await client.lRange(key, start, end);
				return { key, start, end, data: result, count: result.length, success: true, operation: 'lrange' };

			case 'llen':
				result = await client.lLen(key);
				return { key, length: result, success: true, operation: 'llen' };

			default:
				throw new Error(`不支持的List操作: ${listOperation}`);
		}
	}

	private async executeSetOps(client: any, opts: IExecuteOptions): Promise<any> {
		const key = opts.inputs?.key;
		const setOperation = opts.inputs?.setOperation;
		const setMember = opts.inputs?.setMember;

		if (!key) {
			throw new Error('键名不能为空');
		}

		let result;
		switch (setOperation) {
			case 'sadd':
				if (!setMember) throw new Error('Set成员值不能为空');
				result = await client.sAdd(key, setMember);
				return { key, member: setMember, added: result === 1, success: true, operation: 'sadd' };

			case 'srem':
				if (!setMember) throw new Error('Set成员值不能为空');
				result = await client.sRem(key, setMember);
				return { key, member: setMember, removed: result === 1, success: true, operation: 'srem' };

			case 'smembers':
				result = await client.sMembers(key);
				return { key, members: result, count: result.length, success: true, operation: 'smembers' };

			case 'sismember':
				if (!setMember) throw new Error('Set成员值不能为空');
				result = await client.sIsMember(key, setMember);
				return { key, member: setMember, exists: result === 1, success: true, operation: 'sismember' };

			case 'scard':
				result = await client.sCard(key);
				return { key, count: result, success: true, operation: 'scard' };

			default:
				throw new Error(`不支持的Set操作: ${setOperation}`);
		}
	}

	private async executeCustomCommand(client: any, opts: IExecuteOptions): Promise<any> {
		const command = opts.inputs?.command;
		if (!command) {
			throw new Error('Redis命令不能为空');
		}

		// 解析命令
		const parts = command.trim().split(/\s+/);
		const cmd = parts[0].toLowerCase();
		const args = parts.slice(1);

		console.log('执行自定义Redis命令:', cmd, args);

		// 执行命令
		let result;
		if (args.length === 0) {
			result = await client[cmd]();
		} else {
			result = await client[cmd](...args);
		}

		return {
			command: command,
			result: result,
			success: true,
			operation: 'executeCommand'
		};
	}
}