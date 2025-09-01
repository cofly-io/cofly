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
                displayName: '请求方法',
                name: 'method',
                type: 'options',
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
                ],
                default: 'GET',
                required: true,
                controlType: 'selectwithdesc'
            },

            // URL地址
            {
                displayName: '请求URL',
                name: 'url',
                type: 'string',
                default: '',
                required: true,
                placeholder: 'https://api.example.com/data',
                controlType: 'input'
            },

            // 请求头设置
            {
                displayName: '发送请求头',
                name: 'sendHeaders',
                type: 'boolean',
                default: false,
                controlType: 'checkbox'
            },
            {
                displayName: '请求头配置方式',
                name: 'headersType',
                type: 'options',
                displayOptions: {
                    showBy: {
                        sendHeaders: [true],
                    },
                },
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
                ],
                default: 'keyvalue',
                controlType: 'select'
            },
            {
                displayName: '请求头',
                name: 'headers',
                type: 'string',
                displayOptions: {
                    showBy: {
                        sendHeaders: [true],
                        headersType: ['keyvalue'],
                    },
                },
                default: '',
                placeholder: 'Content-Type: application/json\nAuthorization: Bearer token',
                controlType: 'textarea'
            },
            {
                displayName: '请求头JSON',
                name: 'headersJson',
                type: 'string',
                displayOptions: {
                    showBy: {
                        sendHeaders: [true],
                        headersType: ['json'],
                    },
                },
                default: '{}',
                placeholder: '{"Content-Type": "application/json", "Authorization": "Bearer token"}',
                controlType: 'jsoncode'
            },

            // 查询参数设置
            {
                displayName: '发送查询参数',
                name: 'sendQuery',
                type: 'boolean',
                default: false,
                controlType: 'checkbox'
            },
            {
                displayName: '查询参数配置方式',
                name: 'queryType',
                type: 'options',
                displayOptions: {
                    showBy: {
                        sendQuery: [true],
                    },
                },
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
                ],
                default: 'keyvalue',
                controlType: 'select'
            },
            {
                displayName: '查询参数',
                name: 'queryParams',
                type: 'string',
                displayOptions: {
                    showBy: {
                        sendQuery: [true],
                        queryType: ['keyvalue'],
                    },
                },
                default: '',
                placeholder: 'page=1\nlimit=10\nstatus=active',
                controlType: 'textarea'
            },
            {
                displayName: '查询参数JSON',
                name: 'queryParamsJson',
                type: 'string',
                displayOptions: {
                    showBy: {
                        sendQuery: [true],
                        queryType: ['json'],
                    },
                },
                default: '{}',
                placeholder: '{"page": 1, "limit": 10, "status": "active"}',
                controlType: 'jsoncode'
            },

            // 请求体设置
            {
                displayName: '发送请求体',
                name: 'sendBody',
                type: 'boolean',
                displayOptions: {
                    showBy: {
                        method: ['POST', 'PUT', 'PATCH'],
                    },
                },
                default: false,
                controlType: 'checkbox'
            },
            {
                displayName: '请求体类型',
                name: 'bodyType',
                type: 'options',
                displayOptions: {
                    showBy: {
                        sendBody: [true],
                    },
                },
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
                ],
                default: 'json',
                controlType: 'selectwithdesc'
            },
            {
                displayName: '请求体数据',
                name: 'bodyData',
                type: 'string',
                displayOptions: {
                    showBy: {
                        sendBody: [true],
                        bodyType: ['json'],
                    },
                },
                default: '{}',
                placeholder: '{"name": "张三", "age": 25}',
                controlType: 'jsoncode'
            },
            {
                displayName: '表单数据',
                name: 'formData',
                type: 'string',
                displayOptions: {
                    showBy: {
                        sendBody: [true],
                        bodyType: ['form'],
                    },
                },
                default: '',
                placeholder: 'name=张三\nage=25\nemail=zhang@example.com',
                controlType: 'textarea'
            },
            {
                displayName: '原始数据',
                name: 'rawData',
                type: 'string',
                displayOptions: {
                    showBy: {
                        sendBody: [true],
                        bodyType: ['raw'],
                    },
                },
                default: '',
                placeholder: '原始文本内容',
                controlType: 'textarea'
            },
            {
                displayName: '内容类型',
                name: 'contentType',
                type: 'string',
                displayOptions: {
                    showBy: {
                        sendBody: [true],
                        bodyType: ['raw'],
                    },
                },
                default: 'text/plain',
                placeholder: 'text/plain, text/html, application/xml等',
                controlType: 'input'
            },

            // 认证设置
            {
                displayName: '认证方式',
                name: 'authentication',
                type: 'options',
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
                ],
                default: 'none',
                controlType: 'selectwithdesc'
            },
            {
                displayName: '用户名',
                name: 'username',
                type: 'string',
                displayOptions: {
                    showBy: {
                        authentication: ['basic'],
                    },
                },
                default: '',
                required: true,
                controlType: 'input'
            },
            {
                displayName: '密码',
                name: 'password',
                type: 'string',
                displayOptions: {
                    showBy: {
                        authentication: ['basic'],
                    },
                },
                default: '',
                required: true,
                controlType: 'password'
            },
            {
                displayName: 'Bearer Token',
                name: 'bearerToken',
                type: 'string',
                displayOptions: {
                    showBy: {
                        authentication: ['bearer'],
                    },
                },
                default: '',
                required: true,
                placeholder: 'your-bearer-token',
                controlType: 'password'
            },
            {
                displayName: 'API Key名称',
                name: 'apiKeyName',
                type: 'string',
                displayOptions: {
                    showBy: {
                        authentication: ['apikey'],
                    },
                },
                default: 'X-API-Key',
                required: true,
                placeholder: 'X-API-Key, Authorization等',
                controlType: 'input'
            },
            {
                displayName: 'API Key值',
                name: 'apiKeyValue',
                type: 'string',
                displayOptions: {
                    showBy: {
                        authentication: ['apikey'],
                    },
                },
                default: '',
                required: true,
                placeholder: 'your-api-key',
                controlType: 'password'
            },

            // 高级选项
            {
                displayName: '请求超时(秒)',
                name: 'timeout',
                type: 'number',
                default: 30,
                placeholder: '请求超时时间',
                controlType: 'input'
            },
            {
                displayName: '跟随重定向',
                name: 'followRedirects',
                type: 'boolean',
                default: true,
                controlType: 'checkbox'
            },
            {
                displayName: '最大重定向次数',
                name: 'maxRedirects',
                type: 'number',
                displayOptions: {
                    showBy: {
                        followRedirects: [true],
                    },
                },
                default: 5,
                controlType: 'input'
            },
            {
                displayName: '忽略SSL证书错误',
                name: 'rejectUnauthorized',
                type: 'boolean',
                default: true,
                controlType: 'checkbox'
            },
            {
                displayName: '返回完整响应',
                name: 'fullResponse',
                type: 'boolean',
                default: false,
                controlType: 'checkbox'
            },
        ],
    };

    async execute(opts: IExecuteOptions): Promise<any> {
        console.log('🌐 [HttpRequest Node] 开始执行HTTP请求:', opts.inputs);

        try {
            // 构建请求配置
            const config = await this.buildRequestConfig(opts.inputs);

            console.log('📍 [HttpRequest Node] 请求配置:', {
                method: config.method,
                url: config.url,
                headers: config.headers,
                timeout: config.timeout
            });

            // 发送请求
            const response: AxiosResponse = await axios(config);

            // 处理响应
            const result = this.processResponse(response, opts.inputs);

            console.log('✅ [HttpRequest Node] 请求成功:', {
                status: response.status,
                statusText: response.statusText,
                dataType: typeof result.data
            });

            return result;

        } catch (error: any) {
            console.error('❌ [HttpRequest Node] 请求失败:', error.message);

            // 如果是axios错误，提取更多信息
            if (error.response) {
                return {
                    success: false,
                    error: `HTTP ${error.response.status}: ${error.response.statusText}`,
                    statusCode: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                };
            } else if (error.request) {
                return {
                    success: false,
                    error: '请求发送失败，无响应',
                    details: error.message
                };
            } else {
                return {
                    success: false,
                    error: `请求配置错误: ${error.message}`
                };
            }
        }
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