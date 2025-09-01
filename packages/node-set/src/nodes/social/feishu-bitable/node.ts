import { IExecuteOptions, INode, INodeBasic, INodeDetail, NodeLink, credentialManager } from '@repo/common';
/**
 * 飞书多维表格操作节点
 * 支持对飞书多维表格进行增删改查操作
 */
export class FeishuBitable implements INode {
    /**
     * 节点基本信息
     */
    node: INodeBasic = {
        kind: 'feishu-bitable',
        name: '飞书多维表格',
        event: 'feishu-bitable',
        catalog: 'social',
        version: 1,
        description: '支持对飞书多维表格进行增删改查操作',
        icon: 'feishu-bitable.svg',
        nodeWidth: 600
    };

    /**
     * 节点详细配置
     */
    detail: INodeDetail = {
        fields: [
            {
                displayName: '飞书多维表格连接',
                name: 'credential',
                type: 'string',
                required: true,
                description: '选择飞书多维表格连接配置',
                connectType: 'feishu-bitable',
                controlType: 'selectconnect',
                default: ''
            },
            {
                displayName: '操作类型',
                name: 'operation',
                type: 'options',
                required: true,
                description: '选择要执行的操作类型',
                options: [
                    {
                        name: '查询记录',
                        value: 'query'
                    },
                    {
                        name: '新增记录',
                        value: 'create'
                    },
                    {
                        name: '更新记录',
                        value: 'update'
                    },
                    {
                        name: '删除记录',
                        value: 'delete'
                    },
                    {
                        name: '批量新增',
                        value: 'batchCreate'
                    }
                ],
                default: 'query',
                controlType: 'select',
                placeholder: '选择操作类型'
            },
            {
                displayName: 'App Token',
                name: 'appToken',
                type: 'string',
                required: true,
                description: '多维表格的App Token，可从多维表格URL中获取',
                placeholder: '请输入多维表格的App Token',
                controlType: 'input',
                default: ''
            },
            {
                displayName: 'Table ID',
                name: 'tableId',
                type: 'string',
                required: true,
                description: '数据表的Table ID，可从数据表URL中获取',
                placeholder: '请输入数据表的Table ID',
                controlType: 'input',
                default: ''
            },
            {
                displayName: '记录ID',
                name: 'recordId',
                type: 'string',
                required: false,
                description: '记录的ID，更新和删除操作时必填',
                placeholder: '请输入记录ID',
                displayOptions: {
                    showBy: {
                        operation: ['update', 'delete']
                    }
                },
                controlType: 'input',
                default: ''
            },
            {
                displayName: '记录数据',
                name: 'recordData',
                type: 'string',
                required: false,
                description: '记录的字段数据，JSON格式。新增和更新操作时必填',
                placeholder: '{"字段名": "字段值"}',
                displayOptions: {
                    showBy: {
                        operation: ['create', 'update']
                    }
                },
                controlType: 'textarea',
                default: ''
            },
            {
                displayName: '批量记录数据',
                name: 'batchRecordData',
                type: 'string',
                required: false,
                description: '批量记录的字段数据，JSON数组格式',
                placeholder: '[{"字段名": "字段值1"}, {"字段名": "字段值2"}]',
                displayOptions: {
                    showBy: {
                        operation: ['batchCreate']
                    }
                },
                controlType: 'textarea',
                default: ''
            },
            {
                displayName: '查询条件',
                name: 'filter',
                type: 'string',
                required: false,
                description: '查询过滤条件，支持飞书多维表格的过滤语法',
                placeholder: 'AND(CurrentValue.[字段名]="值")',
                displayOptions: {
                    showBy: {
                        operation: ['query']
                    }
                },
                controlType: 'input',
                default: ''
            },
            {
                displayName: '排序字段',
                name: 'sort',
                type: 'string',
                required: false,
                description: '排序配置，JSON数组格式',
                placeholder: '[{"field_name": "字段名", "desc": false}]',
                displayOptions: {
                    showBy: {
                        operation: ['query']
                    }
                },
                controlType: 'textarea',
                default: ''
            },
            {
                displayName: '查询数量限制',
                name: 'pageSize',
                type: 'number',
                required: false,
                default: 100,
                description: '单次查询返回的记录数量，最大500',
                displayOptions: {
                    showBy: {
                        operation: ['query']
                    }
                },
                controlType: 'input'
            },
            {
                displayName: '分页Token',
                name: 'pageToken',
                type: 'string',
                required: false,
                description: '分页查询的Token，用于获取下一页数据',
                placeholder: '请输入分页Token',
                displayOptions: {
                    showBy: {
                        operation: ['query']
                    }
                },
                controlType: 'input',
                default: ''
            }
        ]
    };

    /**
     * 执行飞书多维表格操作
     */
    async execute(opts: IExecuteOptions): Promise<any> {
        const params = opts.inputs;
        
        if (!params) {
            return {
                success: false,
                message: '缺少输入参数'
            };
        }
        
        try {
            // 获取连接配置
            const connectionConfig = await this.getConnectionConfig(params.credential);

            // 获取访问令牌
            const accessToken = await this.getAccessToken(connectionConfig);

            // 根据操作类型执行相应操作
            let result;
            switch (params.operation) {
                case 'query':
                    result = await this.queryRecords(connectionConfig, accessToken, params.appToken, params.tableId, {
                        filter: params.filter,
                        sort: params.sort ? JSON.parse(params.sort) : undefined,
                        pageSize: params.pageSize || 100,
                        pageToken: params.pageToken
                    });
                    break;

                case 'create':
                    if (!params.recordData) {
                        throw new Error('新增记录时必须提供记录数据');
                    }
                    result = await this.createRecord(connectionConfig, accessToken, params.appToken, params.tableId, JSON.parse(params.recordData));
                    break;

                case 'update':
                    if (!params.recordId || !params.recordData) {
                        throw new Error('更新记录时必须提供记录ID和记录数据');
                    }
                    result = await this.updateRecord(connectionConfig, accessToken, params.appToken, params.tableId, params.recordId, JSON.parse(params.recordData));
                    break;

                case 'delete':
                    if (!params.recordId) {
                        throw new Error('删除记录时必须提供记录ID');
                    }
                    result = await this.deleteRecord(connectionConfig, accessToken, params.appToken, params.tableId, params.recordId);
                    break;

                case 'batchCreate':
                    if (!params.batchRecordData) {
                        throw new Error('批量新增时必须提供批量记录数据');
                    }
                    result = await this.batchCreateRecords(connectionConfig, accessToken, params.appToken, params.tableId, JSON.parse(params.batchRecordData));
                    break;

                default:
                    throw new Error(`不支持的操作类型: ${params.operation}`);
            }

            return {
                success: true,
                data: result,
                message: `飞书多维表格${this.getOperationName(params.operation)}操作成功`
            };

        } catch (error) {
            return {
                success: false,
                message: `飞书多维表格操作失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * 获取连接配置
     */
    private async getConnectionConfig(credentialId: string): Promise<Record<string, any>> {
        const connectConfig = await credentialManager.mediator?.get(credentialId);
        if (!connectConfig) {
            throw new Error('未找到飞书多维表格连接配置');
        }
        return connectConfig.config;
    }

    /**
     * 获取访问令牌
     */
    private async getAccessToken(config: Record<string, any>): Promise<string> {
        try {
            const baseUrl = config.baseUrl || 'https://open.feishu.cn';
            const timeout = (config.timeout || 30) * 1000;

            const url = `${baseUrl}/open-apis/auth/v3/tenant_access_token/internal`;

            const requestBody = {
                app_id: config.appId,
                app_secret: config.appSecret
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (result.code !== 0) {
                throw new Error(`飞书API错误: ${result.msg || '未知错误'} (错误码: ${result.code})`);
            }

            return result.tenant_access_token;

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('获取访问令牌请求超时');
            }
            throw new Error(`获取访问令牌失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 查询记录
     */
    private async queryRecords(
        config: Record<string, any>,
        accessToken: string,
        appToken: string,
        tableId: string,
        options: {
            filter?: string;
            sort?: Array<{ field_name: string; desc: boolean }>;
            pageSize?: number;
            pageToken?: string;
        }
    ): Promise<any> {
        const baseUrl = config.baseUrl || 'https://open.feishu.cn';
        const timeout = (config.timeout || 30) * 1000;
        const userIdType = config.userIdType || 'open_id';

        const url = new URL(`${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`);

        // 添加查询参数
        url.searchParams.append('user_id_type', userIdType);
        if (options.filter) {
            url.searchParams.append('filter', options.filter);
        }
        if (options.sort) {
            url.searchParams.append('sort', JSON.stringify(options.sort));
        }
        if (options.pageSize) {
            url.searchParams.append('page_size', options.pageSize.toString());
        }
        if (options.pageToken) {
            url.searchParams.append('page_token', options.pageToken);
        }

        return await this.makeRequest('GET', url.toString(), accessToken, timeout);
    }

    /**
     * 新增记录
     */
    private async createRecord(
        config: Record<string, any>,
        accessToken: string,
        appToken: string,
        tableId: string,
        recordData: Record<string, any>
    ): Promise<any> {
        const baseUrl = config.baseUrl || 'https://open.feishu.cn';
        const timeout = (config.timeout || 30) * 1000;
        const userIdType = config.userIdType || 'open_id';

        const url = `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?user_id_type=${userIdType}`;

        const requestBody = {
            fields: recordData
        };

        return await this.makeRequest('POST', url, accessToken, timeout, requestBody);
    }

    /**
     * 更新记录
     */
    private async updateRecord(
        config: Record<string, any>,
        accessToken: string,
        appToken: string,
        tableId: string,
        recordId: string,
        recordData: Record<string, any>
    ): Promise<any> {
        const baseUrl = config.baseUrl || 'https://open.feishu.cn';
        const timeout = (config.timeout || 30) * 1000;
        const userIdType = config.userIdType || 'open_id';

        const url = `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}?user_id_type=${userIdType}`;

        const requestBody = {
            fields: recordData
        };

        return await this.makeRequest('PUT', url, accessToken, timeout, requestBody);
    }

    /**
     * 删除记录
     */
    private async deleteRecord(
        config: Record<string, any>,
        accessToken: string,
        appToken: string,
        tableId: string,
        recordId: string
    ): Promise<any> {
        const baseUrl = config.baseUrl || 'https://open.feishu.cn';
        const timeout = (config.timeout || 30) * 1000;
        const userIdType = config.userIdType || 'open_id';

        const url = `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}?user_id_type=${userIdType}`;

        return await this.makeRequest('DELETE', url, accessToken, timeout);
    }

    /**
     * 批量新增记录
     */
    private async batchCreateRecords(
        config: Record<string, any>,
        accessToken: string,
        appToken: string,
        tableId: string,
        recordsData: Array<Record<string, any>>
    ): Promise<any> {
        const baseUrl = config.baseUrl || 'https://open.feishu.cn';
        const timeout = (config.timeout || 30) * 1000;
        const userIdType = config.userIdType || 'open_id';

        const url = `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_create?user_id_type=${userIdType}`;

        const requestBody = {
            records: recordsData.map(data => ({ fields: data }))
        };

        return await this.makeRequest('POST', url, accessToken, timeout, requestBody);
    }

    /**
     * 发送HTTP请求
     */
    private async makeRequest(
        method: string,
        url: string,
        accessToken: string,
        timeout: number,
        body?: any
    ): Promise<any> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const headers: Record<string, string> = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (result.code !== 0) {
                throw new Error(`飞书API错误: ${result.msg || '未知错误'} (错误码: ${result.code})`);
            }

            return result.data;

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            throw error;
        }
    }

    /**
     * 获取操作名称
     */
    private getOperationName(operation: string): string {
        const operationNames: Record<string, string> = {
            query: '查询',
            create: '新增',
            update: '更新',
            delete: '删除',
            batchCreate: '批量新增'
        };
        return operationNames[operation] || operation;
    }
}