import { IExecuteOptions, INode, INodeBasic, INodeDetail} from '@repo/common';
import { NodeLink } from '@repo/common';
import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import * as https from 'https';

export class WebService implements INode {
	node: INodeBasic = {
		kind: 'webservice',
		name: 'Web服务',
		event: "webservice",
		catalog: 'general',
		version: 1,
		description: "调用Web服务API，支持REST、SOAP等多种服务类型",
		icon: 'webservice.svg',
		nodeWidth: 650
	};

	detail: INodeDetail = {
		fields: [
			// 服务类型选择
			{
				label: '服务类型',
				fieldName: 'serviceType',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'rest',
					validation: { required: true },
					options: [
						{
							name: 'REST API',
							value: 'rest',
							description: 'RESTful Web服务',
						},
						{
							name: 'SOAP服务',
							value: 'soap',
							description: 'SOAP Web服务',
						},
						{
							name: 'GraphQL',
							value: 'graphql',
							description: 'GraphQL API服务',
						},
						{
							name: '自定义服务',
							value: 'custom',
							description: '自定义Web服务',
						},
					]
				}
			},

			// REST API配置
			{
				label: '请求方法',
				fieldName: 'method',
				conditionRules: {
					showBy: {
						serviceType: ['rest', 'custom'],
					},
				},
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'GET',
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
					]
				}
			},

			// 服务端点URL
			{
				label: '服务端点',
				fieldName: 'endpoint',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'https://api.example.com/v1/users',
					validation: { required: true }
				}
			},

			// SOAP特定配置
			{
				label: 'SOAP Action',
				fieldName: 'soapAction',
				conditionRules: {
					showBy: {
						serviceType: ['soap'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'http://tempuri.org/GetUserInfo'
				}
			},
			{
				label: 'SOAP信封',
				fieldName: 'soapEnvelope',
				conditionRules: {
					showBy: {
						serviceType: ['soap'],
					},
				},
				control: {
					name: 'jscode',
					dataType: 'string',
					defaultValue: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <!-- SOAP请求内容 -->
  </soap:Body>
</soap:Envelope>`
				}
			},

			// GraphQL特定配置
			{
				label: 'GraphQL查询',
				fieldName: 'graphqlQuery',
				conditionRules: {
					showBy: {
						serviceType: ['graphql'],
					},
				},
				control: {
					name: 'jscode',
					dataType: 'string',
					defaultValue: `query {
  users {
    id
    name
    email
  }
}`
				}
			},
			{
				label: 'GraphQL变量',
				fieldName: 'graphqlVariables',
				conditionRules: {
					showBy: {
						serviceType: ['graphql'],
					},
				},
				control: {
					name: 'jscode',
					dataType: 'string',
					defaultValue: '{}',
					placeholder: '{"userId": 123, "limit": 10}'
				}
			},

			// 服务认证配置
			{
				label: '认证方式',
				fieldName: 'authentication',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'none',
					options: [
						{
							name: '无认证',
							value: 'none',
							description: '不使用认证',
						},
						{
							name: 'API Key',
							value: 'apikey',
							description: 'API密钥认证',
						},
						{
							name: 'Bearer Token',
							value: 'bearer',
							description: 'Bearer令牌认证',
						},
						{
							name: 'Basic认证',
							value: 'basic',
							description: '用户名密码认证',
						},
						{
							name: 'OAuth 2.0',
							value: 'oauth2',
							description: 'OAuth 2.0认证',
						},
					]
				}
			},

			// API Key认证
			{
				label: 'API Key位置',
				fieldName: 'apiKeyLocation',
				conditionRules: {
					showBy: {
						authentication: ['apikey'],
					},
				},
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'header',
					options: [
						{
							name: '请求头',
							value: 'header',
							description: '在HTTP请求头中发送',
						},
						{
							name: '查询参数',
							value: 'query',
							description: '在URL查询参数中发送',
						},
					]
				}
			},
			{
				label: 'API Key名称',
				fieldName: 'apiKeyName',
				conditionRules: {
					showBy: {
						authentication: ['apikey'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'X-API-Key',
					placeholder: 'X-API-Key, Authorization等',
					validation: { required: true }
				}
			},
							{
				label: 'API Key值',
				fieldName: 'apiKeyValue',
				conditionRules: {
					showBy: {
						authentication: ['apikey'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'your-api-key',
					validation: { required: true }
				}
			},

			// Bearer Token认证
			{
				label: 'Bearer Token',
				fieldName: 'bearerToken',
				conditionRules: {
					showBy: {
						authentication: ['bearer'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'your-bearer-token',
					validation: { required: true }
				}
			},

			// Basic认证
			{
				label: '用户名',
				fieldName: 'username',
				conditionRules: {
					showBy: {
						authentication: ['basic'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					validation: { required: true }
				}
			},
			{
				label: '密码',
				fieldName: 'password',
				conditionRules: {
					showBy: {
						authentication: ['basic'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					validation: { required: true }
				}
			},

			// OAuth 2.0认证
			{
				label: 'Access Token',
				fieldName: 'accessToken',
				conditionRules: {
					showBy: {
						authentication: ['oauth2'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'OAuth 2.0 访问令牌',
					validation: { required: true }
				}
			},

			// 请求参数配置
			{
				label: '发送查询参数',
				fieldName: 'sendQuery',
				conditionRules: {
					showBy: {
						serviceType: ['rest', 'custom'],
					},
				},
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '查询参数',
				fieldName: 'queryParams',
			
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'page=1\nlimit=10\nfilter=active'
				}
			},

			// 请求头配置
			{
				label: '自定义请求头',
				fieldName: 'sendHeaders',
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '请求头',
				fieldName: 'customHeaders',
			
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'Content-Type: application/json\nAccept: application/json'
				}
			},

			// 请求体配置（REST和自定义服务）
			{
				label: '发送请求体',
				fieldName: 'sendBody',
				conditionRules: {
					showBy: {
						serviceType: ['rest', 'custom'],
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
				label: '请求体格式',
				fieldName: 'bodyFormat',
				// conditionRules: {
				// 	showBy: {
				// 		sendBody: [true],
				// 	},
				// },
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'json',
					options: [
						{
							name: 'JSON',
							value: 'json',
							description: 'JSON格式数据',
						},
						{
							name: 'XML',
							value: 'xml',
							description: 'XML格式数据',
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
				label: 'JSON数据',
				fieldName: 'jsonBody',
			
				control: {
					name: 'jscode',
					dataType: 'string',
					defaultValue: '{}',
					placeholder: '{"name": "张三", "email": "zhang@example.com"}'
				}
			},
			{
				label: 'XML数据',
				fieldName: 'xmlBody',
				conditionRules: {
					// showBy: {
					// 	sendBody: [true],
					// 	bodyFormat: ['xml'],
					// },
				},
				control: {
					name: 'jscode',
					dataType: 'string',
					defaultValue: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <!-- XML内容 -->\n</root>'
				}
			},
			{
				label: '表单数据',
				fieldName: 'formBody',
				// conditionRules: {
				// 	showBy: {
				// 		sendBody: [true],
				// 		bodyFormat: ['form'],
				// 	},
				// },
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'name=张三\nemail=zhang@example.com'
				}
			},
			{
				label: '原始数据',
				fieldName: 'rawBody',
		
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '原始文本内容'
				}
			},

			// 响应处理配置
			{
				label: '响应格式',
				fieldName: 'responseFormat',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'auto',
					options: [
						{
							name: '自动检测',
							value: 'auto',
							description: '自动检测响应格式',
						},
						{
							name: 'JSON',
							value: 'json',
							description: 'JSON格式响应',
						},
						{
							name: 'XML',
							value: 'xml',
							description: 'XML格式响应',
						},
						{
							name: '文本',
							value: 'text',
							description: '纯文本响应',
						},
					]
				}
			},

			// 高级选项
			{
				label: '请求超时(秒)',
				fieldName: 'timeout',
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 30,
					placeholder: '请求超时时间'
				}
			},
			{
				label: '重试次数',
				fieldName: 'retryCount',
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 0,
					placeholder: '失败时重试次数'
				}
			},
			{
				label: '重试间隔(秒)',
				fieldName: 'retryDelay',
			
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 1,
					placeholder: '重试间隔时间'
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
	async execute(opts: IExecuteOptions): Promise<any> {
		console.log('🌐 [WebService Node] 开始执行Web服务调用:', opts.inputs);

		const serviceType = opts.inputs?.serviceType || 'rest';
		let attempt = 0;
		const maxAttempts = (opts.inputs?.retryCount || 0) + 1;
		const retryDelay = (opts.inputs?.retryDelay || 1) * 1000;

		while (attempt < maxAttempts) {
			try {
				let result;

				switch (serviceType) {
					case 'rest':
					case 'custom':
						result = await this.executeRestService(opts.inputs);
						break;
					case 'soap':
						result = await this.executeSoapService(opts.inputs);
						break;
					case 'graphql':
						result = await this.executeGraphQLService(opts.inputs);
						break;
					default:
						throw new Error(`不支持的服务类型: ${serviceType}`);
				}

				console.log('✅ [WebService Node] 服务调用成功:', {
					serviceType,
					attempt: attempt + 1,
					statusCode: result.statusCode
				});

				return result;

			} catch (error: any) {
				attempt++;
				console.error(`❌ [WebService Node] 服务调用失败 (尝试 ${attempt}/${maxAttempts}):`, error.message);

				if (attempt >= maxAttempts) {
					// 最后一次尝试失败，返回错误
					if (error.response) {
						return {
							success: false,
							error: `HTTP ${error.response.status}: ${error.response.statusText}`,
							statusCode: error.response.status,
							statusText: error.response.statusText,
							data: error.response.data,
							headers: error.response.headers,
							serviceType,
							attempts: attempt
						};
					} else if (error.request) {
						return {
							success: false,
							error: '服务调用失败，无响应',
							details: error.message,
							serviceType,
							attempts: attempt
						};
					} else {
						return {
							success: false,
							error: `服务配置错误: ${error.message}`,
							serviceType,
							attempts: attempt
						};
					}
				} else {
					// 等待重试
					console.log(`⏳ [WebService Node] ${retryDelay}ms后进行第${attempt + 1}次重试...`);
					await this.sleep(retryDelay);
				}
			}
		}
	}

	/**
	 * 执行REST服务调用
	 */
	private async executeRestService(inputs: any): Promise<any> {
		const config = await this.buildRestConfig(inputs);
		const response: AxiosResponse = await axios(config);
		return this.processResponse(response, inputs);
	}

	/**
	 * 执行SOAP服务调用
	 */
	private async executeSoapService(inputs: any): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: inputs.endpoint,
			data: inputs.soapEnvelope,
			headers: {
				'Content-Type': 'text/xml; charset=utf-8',
				'SOAPAction': inputs.soapAction || ''
			},
			timeout: (inputs.timeout || 30) * 1000,
			httpsAgent: new https.Agent({
				rejectUnauthorized: inputs.rejectUnauthorized !== false
			})
		};

		// 设置认证
		this.setAuthentication(config, inputs);

		// 添加自定义请求头
		if (inputs.sendHeaders && inputs.customHeaders) {
			const customHeaders = this.parseHeaders(inputs.customHeaders);
			config.headers = { ...config.headers, ...customHeaders };
		}

		const response: AxiosResponse = await axios(config);
		return this.processResponse(response, inputs);
	}

	/**
	 * 执行GraphQL服务调用
	 */
	private async executeGraphQLService(inputs: any): Promise<any> {
		let variables = {};
		try {
			variables = JSON.parse(inputs.graphqlVariables || '{}');
		} catch (error) {
			throw new Error('GraphQL变量JSON格式错误');
		}

		const config: AxiosRequestConfig = {
			method: 'POST',
			url: inputs.endpoint,
			data: {
				query: inputs.graphqlQuery,
				variables
			},
			headers: {
				'Content-Type': 'application/json'
			},
			timeout: (inputs.timeout || 30) * 1000,
			httpsAgent: new https.Agent({
				rejectUnauthorized: inputs.rejectUnauthorized !== false
			})
		};

		// 设置认证
		this.setAuthentication(config, inputs);

		// 添加自定义请求头
		if (inputs.sendHeaders && inputs.customHeaders) {
			const customHeaders = this.parseHeaders(inputs.customHeaders);
			config.headers = { ...config.headers, ...customHeaders };
		}

		const response: AxiosResponse = await axios(config);
		return this.processResponse(response, inputs);
	}

	/**
	 * 构建REST请求配置
	 */
	private async buildRestConfig(inputs: any): Promise<AxiosRequestConfig> {
		const config: AxiosRequestConfig = {
			method: (inputs.method || 'GET').toUpperCase() as Method,
			url: inputs.endpoint,
			timeout: (inputs.timeout || 30) * 1000,
			httpsAgent: new https.Agent({
				rejectUnauthorized: inputs.rejectUnauthorized !== false
			})
		};

		// 设置查询参数
		if (inputs.sendQuery && inputs.queryParams) {
			config.params = this.parseQueryParams(inputs.queryParams);
		}

		// 设置请求头
		config.headers = {};
		if (inputs.sendHeaders && inputs.customHeaders) {
			config.headers = this.parseHeaders(inputs.customHeaders);
		}

		// 设置请求体
		if (inputs.sendBody && ['POST', 'PUT', 'PATCH'].includes(config.method!)) {
			const { data, contentType } = this.parseBody(inputs);
			config.data = data;

			if (contentType) {
				config.headers['Content-Type'] = contentType;
			}
		}

		// 设置认证
		this.setAuthentication(config, inputs);

		return config;
	}

	/**
	 * 解析请求头
	 */
	private parseHeaders(headersStr: string): Record<string, string> {
		const headers: Record<string, string> = {};
		const headerLines = headersStr.split('\n');

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

		return headers;
	}

	/**
	 * 解析查询参数
	 */
	private parseQueryParams(paramsStr: string): Record<string, any> {
		const params: Record<string, any> = {};
		const paramLines = paramsStr.split('\n');

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

		return params;
	}

	/**
	 * 解析请求体
	 */
	private parseBody(inputs: any): { data: any; contentType?: string } {
		switch (inputs.bodyFormat) {
			case 'json':
				try {
					const jsonData = JSON.parse(inputs.jsonBody || '{}');
					return {
						data: jsonData,
						contentType: 'application/json'
					};
				} catch (error) {
					throw new Error('JSON请求体格式错误');
				}

			case 'xml':
				return {
					data: inputs.xmlBody || '',
					contentType: 'application/xml'
				};

			case 'form':
				const formData: Record<string, string> = {};
				const formLines = (inputs.formBody || '').split('\n');
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
					data: inputs.rawBody || '',
					contentType: 'text/plain'
				};

			default:
				return { data: null };
		}
	}

	/**
	 * 设置认证
	 */
	private setAuthentication(config: AxiosRequestConfig, inputs: any): void {
		switch (inputs.authentication) {
			case 'basic':
				config.auth = {
					username: inputs.username,
					password: inputs.password
				};
				break;

			case 'bearer':
				config.headers = {
					...config.headers,
					'Authorization': `Bearer ${inputs.bearerToken}`
				};
				break;

			case 'oauth2':
				config.headers = {
					...config.headers,
					'Authorization': `Bearer ${inputs.accessToken}`
				};
				break;

			case 'apikey':
				if (inputs.apiKeyLocation === 'header') {
					config.headers = {
						...config.headers,
						[inputs.apiKeyName]: inputs.apiKeyValue
					};
				} else if (inputs.apiKeyLocation === 'query') {
					config.params = {
						...config.params,
						[inputs.apiKeyName]: inputs.apiKeyValue
					};
				}
				break;

			case 'none':
			default:
				// 无认证
				break;
		}
	}

	/**
	 * 处理响应数据
	 */
	private processResponse(response: AxiosResponse, inputs: any): any {
		let processedData = response.data;

		// 根据响应格式处理数据
		if (inputs.responseFormat && inputs.responseFormat !== 'auto') {
			switch (inputs.responseFormat) {
				case 'json':
					if (typeof processedData === 'string') {
						try {
							processedData = JSON.parse(processedData);
						} catch (error) {
							console.warn('响应数据不是有效的JSON格式');
						}
					}
					break;
				case 'xml':
					// XML解析可以在这里添加
					break;
				case 'text':
					if (typeof processedData !== 'string') {
						processedData = String(processedData);
					}
					break;
			}
		}

		if (inputs.fullResponse) {
			// 返回完整响应
			return {
				success: true,
				statusCode: response.status,
				statusText: response.statusText,
				headers: response.headers,
				data: processedData,
				serviceType: inputs.serviceType,
				config: {
					method: response.config.method?.toUpperCase(),
					url: response.config.url
				}
			};
		} else {
			// 只返回响应数据
			return {
				success: true,
				data: processedData,
				statusCode: response.status,
				statusText: response.statusText,
				serviceType: inputs.serviceType
			};
		}
	}

	/**
	 * 睡眠函数
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}