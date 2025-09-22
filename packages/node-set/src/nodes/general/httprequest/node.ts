import { IExecuteOptions, INode, INodeBasic, INodeDetail, credentialManager } from '@repo/common';
import { NodeLink } from '@repo/common';
import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import * as https from 'https';
import { execSync, ExecSyncOptions } from 'child_process';
import * as iconv from 'iconv-lite';

export class HttpRequest implements INode {
	node: INodeBasic = {
		kind: 'httprequest',
		name: 'HTTP请求',
		event: "httprequest",
		catalog: 'general',
		version: 1,
		description: "发送HTTP请求并返回响应数据",
		icon: 'httprequest.svg',
		nodeWidth: 600
	};

	detail: INodeDetail = {
		fields: [
			// HTTP方法选择
			{
				label: '请求方法',
				fieldName: 'method',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'GET',
					validation: { required: true },
					options: [
						{
							name: 'GET',
							value: 'GET',
							description: '获取数据',
						},
						{
							name: 'POST',
							value: 'POST',
							description: '提交数据',
						},
						{
							name: 'PUT',
							value: 'PUT',
							description: '更新数据',
						},
						{
							name: 'DELETE',
							value: 'DELETE',
							description: '删除数据',
						},
						{
							name: 'PATCH',
							value: 'PATCH',
							description: '部分更新数据',
						},
						{
							name: 'HEAD',
							value: 'HEAD',
							description: '获取响应头',
						},
						{
							name: 'OPTIONS',
							value: 'OPTIONS',
							description: '获取支持的方法',
						},
						{
							name: 'cURL(bash)',
							value: 'curl',
							description: '发送HTTP请求的命令行',
						},
					]
				}
			},
			// URL地址
			{
				label: '请求URL',
				fieldName: 'url',
				conditionRules: {
					showBy: {
						method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
					}
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'https://api.example.com/data',
					validation: { required: true }
				}
			},
			// cURL命令
			{
				label: 'cURL命令(bash)',
				fieldName: 'curlcmd',
				conditionRules: {
					showBy: {
						method: ['curl']
					}
				},
				control: {
					name: 'cmdcode',
					dataType: 'string',
					defaultValue: '',
					placeholder: `curl 'https://xxxx.com/index/list' \\
-H 'accept: application/json, text/plain, */*' \\
-H 'accept-language: zh-CN,zh;q=0.9,en;q=0.8' \\
-H 'client-request-id: undefined' \\
-H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'`,
					validation: { required: true }
				}
			},
			{
				label: '是否鉴权',
				fieldName: 'isAuth',
				conditionRules: {
					showBy: {
						method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
					}
				},
				control: {
					name: 'switch',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '鉴权方式',
				fieldName: 'auth',
				conditionRules: {
					showBy: {
						isAuth: [true]
					},
				},
				control: {
					name: 'select',
					dataType: 'string',
					dataSourceType: 'http',
				}
			},
			// 请求头设置
			{
				label: '发送请求头(Headers)',
				fieldName: 'sendHeaders',
				conditionRules: {
					showBy: {
						method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
					}
				},
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '请求头配置方式',
				fieldName: 'headersType',
				conditionRules: {
					showBy: {
						sendHeaders: [true]
					},
				},
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'keyvalue',
					options: [
						{
							name: 'JSON',
							value: 'json',
							description: '使用JSON格式配置',
						},
						{
							name: '键值对',
							value: 'keyvalue',
							description: '使用键值对形式配置',
						},
					]
				}
			},
			{
				label: '请求头JSON',
				fieldName: 'headersJson',
				conditionRules: {
					showBy: {
						headersType: ['json']
					},
				},
				control: {
					name: 'jsoncode',
					dataType: 'json',
					defaultValue: '{}',
					placeholder: '{"Content-Type": "application/json", "Authorization": "Bearer token"}'
				}
			},
			{
				label: '请求头',
				fieldName: 'headers',
				conditionRules: {
					showBy: {
						headersType: ['keyvalue']
					},
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'Content-Type: application/json\nAuthorization: Bearer token'
				}
			},
			// 查询参数设置
			{
				label: '发送参数',
				fieldName: 'sendQuery',
				conditionRules: {
					showBy: {
						method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
					}
				},
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '查询参数配置方式',
				fieldName: 'queryType',
				conditionRules: {
					showBy: {
						sendQuery: [true]
					},
				},
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'keyvalue',
					options: [
						{
							name: '键值对',
							value: 'keyvalue',
							description: '使用键值对形式配置',
						},
						{
							name: 'JSON',
							value: 'json',
							description: '使用JSON格式配置',
						},
					]
				}
			},
			{
				label: '查询参数',
				fieldName: 'queryParams',
				conditionRules: {
					showBy: {
						queryType: ['keyvalue']
					},
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'page=1\nlimit=10\nstatus=active'
				}
			},
			{
				label: '查询参数JSON',
				fieldName: 'queryParamsJson',
				conditionRules: {
					showBy: {
						queryType: ['json']
					},
				},
				control: {
					name: 'jsoncode',
					dataType: 'string',
					defaultValue: '{}',
					placeholder: '{"page": 1, "limit": 10, "status": "active"}'
				}
			},
			// 请求体设置
			{
				label: '发送请求体(Body)',
				fieldName: 'sendBody',
				conditionRules: {
					showBy: {
						method: ['POST', 'PUT', 'PATCH'],
					},
				},
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '请求体类型',
				fieldName: 'bodyType',
				conditionRules: {
					showBy: {
						method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
					},
				},
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'none',
					options: [
						{
							name: 'None',
							value: 'none',
							description: '没有请求体',
						},
						{
							name: 'JSON',
							value: 'json',
							description: 'JSON格式数据',
						},
						{
							name: '表单数据',
							value: 'form',
							description: 'application/x-www-form-urlencoded',
						},
						{
							name: '原始数据',
							value: 'raw',
							description: '原始文本数据',
						},
					]
				}
			},
			{
				label: '请求体数据',
				fieldName: 'bodyData',
				conditionRules: {
					showBy: {
						bodyType: ['json'],
					},
				},
				control: {
					name: 'jscode',
					dataType: 'string',
					defaultValue: '{}',
					placeholder: '{"name": "张三", "age": 25}'
				}
			},
			{
				label: '表单数据',
				fieldName: 'formData',
				conditionRules: {
					showBy: {
						bodyType: ['form'],
					},
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'name=张三\nage=25\nemail=zhang@example.com'
				}
			},
			{
				label: '原始数据',
				fieldName: 'rawData',
				conditionRules: {
					showBy: {
						bodyType: ['raw'],
					},
				},
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '原始文本内容'
				}
			},
			{
				label: '内容类型',
				fieldName: 'contentType',
				conditionRules: {
					showBy: {
						method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'text/plain',
					placeholder: 'text/plain, text/html, application/xml等'
				}
			},
			// 高级选项
			{
				label: '请求超时(秒)',
				fieldName: 'timeout',
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 20,
					placeholder: '请求超时时间'
				}
			},
			{
				label: '跟随重定向',
				fieldName: 'followRedirects',
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: true
				}
			},
			{
				label: '最大重定向次数',
				fieldName: 'maxRedirects',

				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 5
				}
			},
			{
				label: '忽略SSL证书错误',
				fieldName: 'rejectUnauthorized',
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: true
				}
			},
			{
				label: '返回完整响应',
				fieldName: 'fullResponse',
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			}
		]
	}

	/**
	 * 执行HTTP请求
	 */
	async execute(opts: IExecuteOptions): Promise<any> {
		try {
			// 检查是否是 cURL 命令
			if (opts.inputs?.method === 'curl') {
				return await this.executeCurlCommand(opts.inputs);
			}

			// 构建请求配置
			const config = await this.buildRequestConfig(opts.inputs);

			// 发送HTTP请求
			const response = await axios.request(config);

			// 处理响应数据
			return this.processResponse(response, opts.inputs);
		} catch (error: any) {
			console.error('❌ [HTTP Request Node] 请求失败:', error.message);
			// 返回错误信息
			return {
				error: error.message,
				statusCode: error.response?.status,
				statusText: error.response?.statusText,
				data: error.response?.data
			};
		}
	}

	/**
	 * 构建axios请求配置
	 */
	private async buildRequestConfig(inputs: any): Promise<AxiosRequestConfig> {
		// Log inputs for debugging
		const config: AxiosRequestConfig = {
			method: (inputs.method || 'GET').toUpperCase() as Method,
			url: inputs.url,
			timeout: (inputs.timeout || 30) * 1000,
			maxRedirects: inputs.followRedirects ? (inputs.maxRedirects || 5) : 0,
			httpsAgent: new https.Agent({
				rejectUnauthorized: inputs.rejectUnauthorized !== false
			})
		};

		// 设置请求头
		if (inputs.sendHeaders) {
			config.headers = this.parseHeaders(inputs);
		}

		// 设置查询参数
		if (inputs.sendQuery) {
			config.params = this.parseQueryParams(inputs);
		}

		// 设置请求体
		if (inputs.sendBody && ['POST', 'PUT', 'PATCH'].includes(config.method!)) {
			const { data, contentType } = this.parseBody(inputs);
			config.data = data;

			if (contentType) {
				config.headers = {
					...config.headers,
					'Content-Type': contentType
				};
			}
		}

		// 设置认证
		await this.setAuthentication(config, inputs);

		return config;
	}

	/**
	 * 解析请求头
	 */
	private parseHeaders(inputs: any): Record<string, string> {
		const headers: Record<string, string> = {};

		if (inputs.headersType === 'json') {
			try {
				const headersJson = JSON.parse(inputs.headersJson || '{}');
				Object.assign(headers, headersJson);
			} catch (error) {
				throw new Error('请求头JSON格式错误');
			}
		} else {
			// 键值对格式
			const headerLines = (inputs.headers || '').split('\n');
			for (const line of headerLines) {
				const trimmedLine = line.trim();
				if (trimmedLine) {
					const colonIndex = trimmedLine.indexOf(':');
					if (colonIndex > 0) {
						const key = trimmedLine.substring(0, colonIndex).trim();
						const value = trimmedLine.substring(colonIndex + 1).trim();
						headers[key] = value;
					}
				}
			}
		}

		return headers;
	}

	/**
	 * 解析查询参数
	 */
	private parseQueryParams(inputs: any): Record<string, any> {
		const params: Record<string, any> = {};

		if (inputs.queryType === 'json') {
			try {
				const paramsJson = JSON.parse(inputs.queryParamsJson || '{}');
				Object.assign(params, paramsJson);
			} catch (error) {
				throw new Error('查询参数JSON格式错误');
			}
		} else {
			// 键值对格式
			const paramLines = (inputs.queryParams || '').split('\n');
			for (const line of paramLines) {
				const trimmedLine = line.trim();
				if (trimmedLine) {
					const equalIndex = trimmedLine.indexOf('=');
					if (equalIndex > 0) {
						const key = trimmedLine.substring(0, equalIndex).trim();
						const value = trimmedLine.substring(equalIndex + 1).trim();
						params[key] = value;
					}
				}
			}
		}

		return params;
	}

	/**
	 * 解析请求体
	 */
	private parseBody(inputs: any): { data: any; contentType?: string } {
		switch (inputs.bodyType) {
			case 'json':
				try {
					const jsonData = JSON.parse(inputs.bodyData || '{}');
					return {
						data: jsonData,
						contentType: 'application/json'
					};
				} catch (error) {
					throw new Error('请求体JSON格式错误');
				}

			case 'form':
				const formData: Record<string, string> = {};
				const formLines = (inputs.formData || '').split('\n');
				for (const line of formLines) {
					const trimmedLine = line.trim();
					if (trimmedLine) {
						const equalIndex = trimmedLine.indexOf('=');
						if (equalIndex > 0) {
							const key = trimmedLine.substring(0, equalIndex).trim();
							const value = trimmedLine.substring(equalIndex + 1).trim();
							formData[key] = value;
						}
					}
				}
				return {
					data: new URLSearchParams(formData).toString(),
					contentType: 'application/x-www-form-urlencoded'
				};

			case 'raw':
				return {
					data: inputs.rawData || '',
					contentType: inputs.contentType || 'text/plain'
				};

			default:
				return { data: null };
		}
	}

	/**
	 * 设置认证
	 */
	private async setAuthentication(config: AxiosRequestConfig, inputs: any): Promise<void> {
		// 检查是否需要认证

		if (inputs.isAuth && inputs.auth) {
			// 获取认证配置
			const connectConfig = await credentialManager.mediator?.get(inputs.auth);
			if (connectConfig && connectConfig.config) {
				const authConfig = connectConfig.config;

				// 根据认证类型设置认证信息
				// 如果有baseUrl且请求URL是相对路径，则组合成完整URL
				if (authConfig.baseUrl && config.url && !config.url.startsWith('http')) {
					config.url = `${authConfig.baseUrl.replace(/\/$/, '')}/${config.url.replace(/^\//, '')}`;
				}

				switch (authConfig.authType) {
					case 'basic':
						config.auth = {
							username: authConfig.username,
							password: authConfig.password
						};
						break;

					case 'bearer':
						const bearerToken = authConfig.token && authConfig.token.startsWith('Bearer ') ? authConfig.token : `Bearer ${authConfig.token}`;
						console.log('🔑 [HTTP Request Node] Setting Bearer Token:', bearerToken);
						console.log('📋 [HTTP Request Node] Existing headers before Bearer auth:', config.headers);
						config.headers = {
							...config.headers,
							'Authorization': bearerToken
						};
						console.log('📋 [HTTP Request Node] Headers after Bearer auth:', config.headers);
						break;

					case 'digest':
						// Digest认证通常需要在服务器端处理，这里添加Authorization头
						// 注意：客户端实现digest认证比较复杂，通常由HTTP库处理
						config.headers = {
							...config.headers,
							'Authorization': `Digest username="${authConfig.username}", realm="${authConfig.realm}", nonce="${authConfig.nonce}", uri="${authConfig.uri}", response="${authConfig.response}"`
						};
						break;

					case 'header':
						// Header认证 - 直接添加自定义头部
						config.headers = {
							...config.headers,
							[authConfig.headerName || 'Authorization']: authConfig.headerValue
						};
						break;

					case 'oauth2':
						// OAuth 2.0认证 - 通常使用Bearer token
						const oauthToken = authConfig.token || authConfig.accessToken;
						console.log('🔑 [HTTP Request Node] Setting OAuth2 Token:', oauthToken);
						config.headers = {
							...config.headers,
							'Authorization': `Bearer ${oauthToken}`
						};
						break;

					case 'apikey':
						config.headers = {
							...config.headers,
							[authConfig.apiKeyName || 'X-API-Key']: authConfig.apiKeyValue
						};
						break;

					case 'custom':
						// 自定义认证 - 添加自定义头部
						if (authConfig.customHeaders) {
							// 如果提供了自定义头部对象
							config.headers = {
								...config.headers,
								...authConfig.customHeaders
							};
						} else if (authConfig.headerName && authConfig.headerValue) {
							// 如果提供了单个头部名称和值
							config.headers = {
								...config.headers,
								[authConfig.headerName]: authConfig.headerValue
							};
						}
						break;

					default:
						// 无认证或未知认证类型
						break;
				}
			}
		}
	}

	/**
	 * 处理响应数据
	 */
	private processResponse(response: AxiosResponse, inputs: any): any {
		const method = inputs.method?.toUpperCase();

		if (inputs.fullResponse) {
			// 返回完整响应
			return {
				statusCode: response.status,
				statusText: response.statusText,
				headers: response.headers,
				data: response.data,
				config: {
					method: response.config.method?.toUpperCase(),
					url: response.config.url
				}
			};
		} else {
			// 对于 HEAD 和 OPTIONS 请求，主要关注响应头和状态码
			if (method === 'HEAD' || method === 'OPTIONS') {
				return {
					statusCode: response.status,
					statusText: response.statusText,
					headers: response.headers,
					data: response.data || null,
					// 对于 OPTIONS 请求，特别提取允许的方法
					...(method === 'OPTIONS' && {
						allowedMethods: response.headers['allow'] || response.headers['Access-Control-Allow-Methods']
					})
				};
			} else {
				// 其他请求类型只返回响应数据
				return {
					data: response.data,
					statusCode: response.status,
					statusText: response.statusText
				};
			}
		}
	}

	/**
	 * 执行 cURL 命令
	 */
	private async executeCurlCommand(inputs: any): Promise<any> {
		try {
			const curlCommand = inputs.curlcmd;
			if (!curlCommand || typeof curlCommand !== 'string') {
				throw new Error('cURL命令不能为空');
			}

			console.log('🚀 [HTTP Request Node] Executing cURL command:', curlCommand);

			// 清理和规范化 cURL 命令
			let cleanedCommand = this.cleanCurlCommand(curlCommand);

			console.log('🔧 [HTTP Request Node] Cleaned command:', cleanedCommand);

			// 执行命令
			const result = execSync(cleanedCommand, {
				encoding: 'buffer',
				timeout: 30000, // 30秒超时
				maxBuffer: 10 * 1024 * 1024, // 10MB 缓冲区
				shell: process.platform === 'win32' ? 'cmd' : '/bin/bash', // 使用系统 shell
				windowsHide: true // Windows 下隐藏命令窗口
			});

			// 尝试解码输出
			let output: string;
			try {
				// 首先尝试 UTF-8
				output = result.toString('utf8');
			} catch (error) {
				try {
					// 如果 UTF-8 失败，尝试 GBK（中文Windows系统）
					output = iconv.decode(result, 'gbk');
				} catch (error2) {
					// 最后尝试 latin1
					output = result.toString('latin1');
				}
			}

			// 解析 cURL 输出（包含响应头和响应体）
			const parsed = this.parseCurlOutput(output);
			if (!inputs.fullResponse)
				delete parsed.headers;
			return {
				...parsed,
				// rawOutput: output,
				// executedCommand: cleanedCommand
			};

		} catch (error: any) {
			return {
				error: error.message,
				//command: inputs.curlcmd,
				// 如果是超时错误
				...(error.message.includes('timeout') && {
					statusCode: 408,
					statusText: 'Request Timeout'
				})
			};
		}
	}

	/**
	 * 解析 cURL 输出
	 */
	private parseCurlOutput(output: string): any {
		try {
			// 分离响应头和响应体
			const parts = output.split('\r\n\r\n');
			if (parts.length < 2) {
				// 如果没有找到标准分隔符，尝试其他分隔符
				const altParts = output.split('\n\n');
				if (altParts.length >= 2) {
					parts[0] = altParts[0] as string;
					parts[1] = altParts.slice(1).join('\n\n');
				}
			}

			let headerSection = parts[0] || '';
			let bodySection = parts.slice(1).join('\r\n\r\n') || '';

			// 解析状态行
			const statusLineMatch = headerSection.match(/^HTTP\/[\d.]+\s+(\d+)\s+(.*)$/m);
			const statusCode = statusLineMatch ? parseInt(statusLineMatch[1] || '') : 200;
			const statusText = statusLineMatch ? statusLineMatch[2] || ''.trim() : 'OK';

			// 解析响应头
			const headers: Record<string, string> = {};
			const headerLines = headerSection.split('\n').slice(1); // 跳过状态行

			for (const line of headerLines) {
				const trimmedLine = line.trim();
				if (trimmedLine) {
					const colonIndex = trimmedLine.indexOf(':');
					if (colonIndex > 0) {
						const key = trimmedLine.substring(0, colonIndex).trim().toLowerCase();
						const value = trimmedLine.substring(colonIndex + 1).trim();
						headers[key] = value;
					}
				}
			}

			// 尝试解析响应体为 JSON
			let data: any = bodySection;
			const contentType = headers['content-type'] || '';

			if (contentType.includes('application/json') && bodySection.trim()) {
				try {
					data = JSON.parse(bodySection);
				} catch (jsonError) {
					// 如果 JSON 解析失败，保持原始字符串
					data = bodySection;
				}
			}

			return {
				statusCode,
				statusText,
				headers,
				data,
				// rawHeaders: headerSection,
				// rawBody: bodySection
			};

		} catch (error) {
			return {
				statusCode: 200,
				statusText: 'OK',
				headers: {},
				data: output,
				rawOutput: output
			};
		}
	}

	/**
	 * 清理和规范化 cURL 命令
	 */
	private cleanCurlCommand(command: string): string {
		// 移除多余的空白字符和换行符
		let cleaned = command.replace(/\s+/g, ' ').trim();

		// 处理行尾的反斜杠续行符
		cleaned = cleaned.replace(/\\\s*\n\s*/g, ' ');
		cleaned = cleaned.replace(/\\\s+/g, ' ');

		// 确保命令以 curl 开头
		if (!cleaned.startsWith('curl')) {
			throw new Error('命令必须以 curl 开头');
		}

		// 添加必要的参数
		if (!cleaned.includes(' -i ') && !cleaned.includes(' -i')) {
			// 在 curl 后面添加 -i 参数来获取响应头
			cleaned = cleaned.replace(/^curl\s+/, 'curl -i -s -S ');
		} else if (!cleaned.includes(' -s ')) {
			// 如果有 -i 但没有 -s，添加 -s -S
			cleaned = cleaned.replace(/^curl\s+/, 'curl -s -S ');
		}

		// 处理 Windows 下的引号问题
		if (process.platform === 'win32') {
			// 在 Windows 下，将单引号替换为双引号
			cleaned = this.convertQuotesForWindows(cleaned);
		}

		return cleaned;
	}

	/**
	 * 为 Windows 环境转换引号
	 */
	private convertQuotesForWindows(command: string): string {
		// 在 Windows 下，cmd 不能很好地处理单引号，需要转换为双引号
		// 但要小心处理嵌套的引号

		let result = '';
		let inSingleQuote = false;
		let inDoubleQuote = false;

		for (let i = 0; i < command.length; i++) {
			const char = command[i];
			const prevChar = i > 0 ? command[i - 1] : '';

			if (char === "'" && !inDoubleQuote && prevChar !== '\\') {
				if (!inSingleQuote) {
					// 开始单引号，转换为双引号
					result += '"';
					inSingleQuote = true;
				} else {
					// 结束单引号，转换为双引号
					result += '"';
					inSingleQuote = false;
				}
			} else if (char === '"' && !inSingleQuote && prevChar !== '\\') {
				// 处理原有的双引号
				if (!inDoubleQuote) {
					result += '"';
					inDoubleQuote = true;
				} else {
					result += '"';
					inDoubleQuote = false;
				}
			} else if (char === '"' && inSingleQuote) {
				// 在单引号内的双引号需要转义
				result += '\\"';
			} else {
				result += char;
			}
		}

		return result;
	}
}