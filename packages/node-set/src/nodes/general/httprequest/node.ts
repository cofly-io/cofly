import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';
import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import * as https from 'https';

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
					]
				}
			},

			// URL地址
			{
				label: '请求URL',
				fieldName: 'url',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'https://api.example.com/data',
					validation: { required: true }
				}
			},

			// 请求头设置
			{
				label: '发送请求头',
				fieldName: 'sendHeaders',
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '请求头配置方式',
				fieldName: 'headersType',
		
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
				label: '请求头',
				fieldName: 'headers',
		
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'Content-Type: application/json\nAuthorization: Bearer token'
				}
			},
			{
				label: '请求头JSON',
				fieldName: 'headersJson',
			
				control: {
					name: 'jscode',
					dataType: 'string',
					defaultValue: '{}',
					placeholder: '{"Content-Type": "application/json", "Authorization": "Bearer token"}'
				}
			},

			// 查询参数设置
			{
				label: '发送查询参数',
				fieldName: 'sendQuery',
				control: {
					name: 'checkbox',
					dataType: 'boolean',
					defaultValue: false
				}
			},
			{
				label: '查询参数配置方式',
				fieldName: 'queryType',
			
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
		
				control: {
					name: 'jscode',
					dataType: 'string',
					defaultValue: '{}',
					placeholder: '{"page": 1, "limit": 10, "status": "active"}'
				}
			},

			// 请求体设置
			{
				label: '发送请求体',
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
			
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'text/plain',
					placeholder: 'text/plain, text/html, application/xml等'
				}
			},

			// 认证设置
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
							name: 'Basic认证',
							value: 'basic',
							description: '用户名密码认证',
						},
						{
							name: 'Bearer Token',
							value: 'bearer',
							description: 'Bearer令牌认证',
						},
						{
							name: 'API Key',
							value: 'apikey',
							description: 'API密钥认证',
						},
					]
				}
			},
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
     * 构建axios请求配置
     */
    private async buildRequestConfig(inputs: any): Promise<AxiosRequestConfig> {
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
        this.setAuthentication(config, inputs);

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

            case 'apikey':
                config.headers = {
                    ...config.headers,
                    [inputs.apiKeyName]: inputs.apiKeyValue
                };
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
        if (inputs.fullResponse) {
            // 返回完整响应
            return {
                success: true,
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
            // 只返回响应数据
            return {
                success: true,
                data: response.data,
                statusCode: response.status,
                statusText: response.statusText
            };
        }
    }
}