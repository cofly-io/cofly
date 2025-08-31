import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink, credentialManager } from '@repo/common';

export class MongoDB implements INode {
    node: INodeBasic = {
        kind: 'mongodb',
        name: 'MongoDB数据库',
        event: "mongodb",
        catalog: 'database',
        version: 1,
        description: "连接MongoDB数据库进行文档的增删改查、聚合查询等操作",
        icon: 'mongodb.svg',
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
                connectType: "mongodb",
                controlType: 'selectconnect',
                // 联动配置：影响集合名字段
                linkage: {
                    targets: ['collection'],
                    trigger: 'onChange'
                }
            },
            // 操作类型选择器
            {
                displayName: '操作类型',
                name: 'operation',
                type: 'options',
                options: [
                    {
                        name: '查找文档',
                        value: 'find',
                        description: '查找集合中的文档',
                    },
                    {
                        name: '查找单个文档',
                        value: 'findOne',
                        description: '查找集合中的单个文档',
                    },
                    {
                        name: '插入文档',
                        value: 'insertOne',
                        description: '向集合中插入单个文档',
                    },
                    {
                        name: '批量插入文档',
                        value: 'insertMany',
                        description: '向集合中插入多个文档',
                    },
                    {
                        name: '更新文档',
                        value: 'updateOne',
                        description: '更新集合中的单个文档',
                    },
                    {
                        name: '批量更新文档',
                        value: 'updateMany',
                        description: '更新集合中的多个文档',
                    },
                    {
                        name: '删除文档',
                        value: 'deleteOne',
                        description: '删除集合中的单个文档',
                    },
                    {
                        name: '批量删除文档',
                        value: 'deleteMany',
                        description: '删除集合中的多个文档',
                    },
                    {
                        name: '聚合查询',
                        value: 'aggregate',
                        description: '执行聚合管道查询',
                    },
                    {
                        name: '统计文档数量',
                        value: 'countDocuments',
                        description: '统计集合中文档的数量',
                    },
                ],
                default: 'find',
                placeholder: '选择操作类型',
                controlType: 'selectwithdesc'
            },
            // 集合名称选择器
            {
                displayName: '集合名称',
                name: 'collection',
                type: 'string',
                default: '',
                required: true,
                placeholder: '请选择集合名称',
                description: '要操作的MongoDB集合名称',
                controlType: 'selectcollection',
                // 显示条件：当选择了连接源时显示
                displayOptions: {
                    showBy: {
                        datasource: [{ "$ne": "" }]
                    },
                    hide: {
                        operation: ['custom'],
                    },
                },
            },
            // 查询条件字段
            {
                displayName: '查询条件',
                name: 'filter',
                type: 'json',
                default: '{}',
                placeholder: '请输入查询条件（JSON格式）',
                description: '查询条件，使用MongoDB查询语法',
                controlType: 'jsoneditor',
                displayOptions: {
                    showBy: {
                        operation: ['find', 'findOne', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'countDocuments'],
                        datasource: [{ "$ne": "" }]
                    }
                }
            },
            // 投影字段
            {
                displayName: '投影字段',
                name: 'projection',
                type: 'json',
                default: '{}',
                description: '指定返回的字段（JSON格式）',
                placeholder: '{"name": 1, "age": 1, "_id": 0}',
                controlType: 'jsoneditor',
                displayOptions: {
                    showBy: {
                        operation: ['find', 'findOne'],
                        datasource: [{ "$ne": "" }]
                    }
                }
            },
            // 排序字段
            {
                displayName: '排序',
                name: 'sort',
                type: 'json',
                default: '{}',
                description: '排序条件（JSON格式）',
                placeholder: '{"age": -1, "name": 1}',
                controlType: 'jsoneditor',
                displayOptions: {
                    showBy: {
                        operation: ['find'],
                        datasource: [{ "$ne": "" }]
                    }
                }
            },
            // 限制条数字段
            {
                displayName: '限制条数',
                name: 'limit',
                type: 'number',
                default: 0,
                placeholder: '请输入限制条数',
                description: '限制返回的文档数量，0表示不限制',
                controlType: 'number',
                typeOptions: {
                    minValue: 0,
                },
                displayOptions: {
                    showBy: {
                        operation: ['find'],
                        datasource: [{ "$ne": "" }]
                    }
                }
            },
            // 跳过条数字段
            {
                displayName: '跳过条数',
                name: 'skip',
                type: 'number',
                default: 0,
                placeholder: '请输入跳过条数',
                description: '跳过指定数量的文档',
                controlType: 'number',
                typeOptions: {
                    minValue: 0,
                },
                displayOptions: {
                    showBy: {
                        operation: ['find'],
                        datasource: [{ "$ne": "" }]
                    }
                }
            },
            // 单个文档数据字段
            {
                displayName: '文档数据',
                name: 'document',
                type: 'json',
                default: '{}',
                description: '要插入的文档数据（JSON格式）',
                placeholder: '{"name": "张三", "age": 25, "email": "zhangsan@example.com"}',
                controlType: 'jsoneditor',
                displayOptions: {
                    showBy: {
                        operation: ['insertOne'],
                        datasource: [{ "$ne": "" }]
                    }
                }
            },
            // 多个文档数据字段
            {
                displayName: '文档数组',
                name: 'documents',
                type: 'json',
                default: '[]',
                description: '要插入的文档数组（JSON格式）',
                placeholder: '[{"name": "张三", "age": 25}, {"name": "李四", "age": 30}]',
                controlType: 'jsoneditor',
                displayOptions: {
                    showBy: {
                        operation: ['insertMany'],
                        datasource: [{ "$ne": "" }]
                    }
                }
            },
            // 更新数据字段
            {
                displayName: '更新数据',
                name: 'update',
                type: 'json',
                default: '{}',
                description: '更新操作（JSON格式）',
                placeholder: '{"$set": {"age": 26}, "$inc": {"score": 10}}',
                controlType: 'jsoneditor',
                displayOptions: {
                    showBy: {
                        operation: ['updateOne', 'updateMany'],
                        datasource: [{ "$ne": "" }]
                    }
                }
            },
            // 聚合管道字段
            {
                displayName: '聚合管道',
                name: 'pipeline',
                type: 'json',
                default: '[]',
                description: '聚合管道阶段数组（JSON格式）',
                placeholder: '[{"$match": {"age": {"$gte": 18}}}, {"$group": {"_id": "$department", "count": {"$sum": 1}}}]',
                controlType: 'jsoneditor',
                displayOptions: {
                    showBy: {
                        operation: ['aggregate'],
                        datasource: [{ "$ne": "" }]
                    }
                }
            },

        ],
    };

    async execute(opts: IExecuteOptions): Promise<any> {
        const operation = opts.inputs?.operation;
        const datasourceId = opts.inputs?.datasource;
        const collection = opts.inputs?.collection;

        try {
            const client = await this.createConnection(datasourceId);
            const db = client.db();
            const coll = db.collection(collection);
            
            let result: any;
            
            switch (operation) {
                case 'find':
                    result = await this.executeFind(coll, opts);
                    break;
                case 'findOne':
                    result = await this.executeFindOne(coll, opts);
                    break;
                case 'insertOne':
                    result = await this.executeInsertOne(coll, opts);
                    break;
                case 'insertMany':
                    result = await this.executeInsertMany(coll, opts);
                    break;
                case 'updateOne':
                    result = await this.executeUpdateOne(coll, opts);
                    break;
                case 'updateMany':
                    result = await this.executeUpdateMany(coll, opts);
                    break;
                case 'deleteOne':
                    result = await this.executeDeleteOne(coll, opts);
                    break;
                case 'deleteMany':
                    result = await this.executeDeleteMany(coll, opts);
                    break;
                case 'aggregate':
                    result = await this.executeAggregate(coll, opts);
                    break;
                case 'countDocuments':
                    result = await this.executeCountDocuments(coll, opts);
                    break;
                default:
                    throw new Error(`不支持的操作类型: ${operation}`);
            }

            // 关闭连接
            await client.close();

            return {
                success: true,
                data: result
            };

        } catch (error: any) {
            console.error('❌ [MongoDB Node] 执行错误:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 创建MongoDB连接
     */
    private async createConnection(datasourceId: string): Promise<any> {
        try {
            const { MongoClient } = await import('mongodb');
            
            // 获取连接配置
            const connectConfig = await credentialManager.mediator.get(datasourceId);
            if (!connectConfig) {
                throw new Error(`连接配置不存在: ${datasourceId}`);
            }
            
            const config = connectConfig.config;
            
            // 构建连接URI
            let uri = 'mongodb://';
            
            // 添加认证信息
            if (config.username && config.password) {
                uri += `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@`;
            }
            
            // 添加主机和端口
            uri += `${config.host}:${config.port || 27017}`;
            
            // 添加数据库名
            if (config.database) {
                uri += `/${config.database}`;
            }
            
            // 构建连接选项
            const options: any = {
                connectTimeoutMS: (config.connectTimeout || 30) * 1000,
                serverSelectionTimeoutMS: (config.serverSelectionTimeout || 30) * 1000,
                maxPoolSize: config.maxPoolSize || 100,
                minPoolSize: config.minPoolSize || 0
            };

            // 添加其他选项
            if (config.authSource) {
                options.authSource = config.authSource;
            }
            if (config.authMechanism && config.authMechanism !== 'SCRAM-SHA-256') {
                options.authMechanism = config.authMechanism;
            }
            if (config.replicaSet) {
                options.replicaSet = config.replicaSet;
            }
            if (config.tls) {
                options.tls = true;
                if (config.tlsAllowInvalidCertificates) {
                    options.tlsAllowInvalidCertificates = true;
                }
            }
            if (config.readPreference && config.readPreference !== 'primary') {
                options.readPreference = config.readPreference;
            }

            const client = new MongoClient(uri, options);
            await client.connect();
            
            return client;
        } catch (error: any) {
            throw new Error(`MongoDB连接失败: ${error.message}`);
        }
    }

    /**
     * 执行查找操作
     */
    private async executeFind(collection: any, opts: IExecuteOptions): Promise<any[]> {
        const filter = this.parseJson(opts.inputs?.filter || '{}');
        const projection = this.parseJson(opts.inputs?.projection || '{}');
        const sort = this.parseJson(opts.inputs?.sort || '{}');
        const limit = opts.inputs?.limit || 0;
        const skip = opts.inputs?.skip || 0;

        let cursor = collection.find(filter);

        if (Object.keys(projection).length > 0) {
            cursor = cursor.project(projection);
        }
        if (Object.keys(sort).length > 0) {
            cursor = cursor.sort(sort);
        }
        if (skip > 0) {
            cursor = cursor.skip(skip);
        }
        if (limit > 0) {
            cursor = cursor.limit(limit);
        }

        return await cursor.toArray();
    }

    /**
     * 执行查找单个文档操作
     */
    private async executeFindOne(collection: any, opts: IExecuteOptions): Promise<any> {
        const filter = this.parseJson(opts.inputs?.filter || '{}');
        const projection = this.parseJson(opts.inputs?.projection || '{}');

        const options: any = {};
        
        if (Object.keys(projection).length > 0) {
            options.projection = projection;
        }

        return await collection.findOne(filter, options);
    }

    /**
     * 执行插入单个文档操作
     */
    private async executeInsertOne(collection: any, opts: IExecuteOptions): Promise<any> {
        const document = this.parseJson(opts.inputs?.document || '{}');

        const result = await collection.insertOne(document);
        
        return {
            acknowledged: result.acknowledged,
            insertedId: result.insertedId,
            insertedDocument: { ...document, _id: result.insertedId }
        };
    }

    /**
     * 执行批量插入文档操作
     */
    private async executeInsertMany(collection: any, opts: IExecuteOptions): Promise<any> {
        const documents = this.parseJson(opts.inputs?.documents || '[]');

        if (!Array.isArray(documents)) {
            throw new Error('文档数组必须是一个数组');
        }

        const result = await collection.insertMany(documents);
        
        return {
            acknowledged: result.acknowledged,
            insertedCount: result.insertedCount,
            insertedIds: result.insertedIds
        };
    }

    /**
     * 执行更新单个文档操作
     */
    private async executeUpdateOne(collection: any, opts: IExecuteOptions): Promise<any> {
        const filter = this.parseJson(opts.inputs?.filter || '{}');
        const update = this.parseJson(opts.inputs?.update || '{}');

        const result = await collection.updateOne(filter, update);
        
        return {
            acknowledged: result.acknowledged,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount,
            upsertedId: result.upsertedId
        };
    }

    /**
     * 执行批量更新文档操作
     */
    private async executeUpdateMany(collection: any, opts: IExecuteOptions): Promise<any> {
        const filter = this.parseJson(opts.inputs?.filter || '{}');
        const update = this.parseJson(opts.inputs?.update || '{}');

        const result = await collection.updateMany(filter, update);
        
        return {
            acknowledged: result.acknowledged,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount,
            upsertedId: result.upsertedId
        };
    }

    /**
     * 执行删除单个文档操作
     */
    private async executeDeleteOne(collection: any, opts: IExecuteOptions): Promise<any> {
        const filter = this.parseJson(opts.inputs?.filter || '{}');

        const result = await collection.deleteOne(filter);
        
        return {
            acknowledged: result.acknowledged,
            deletedCount: result.deletedCount
        };
    }

    /**
     * 执行批量删除文档操作
     */
    private async executeDeleteMany(collection: any, opts: IExecuteOptions): Promise<any> {
        const filter = this.parseJson(opts.inputs?.filter || '{}');

        const result = await collection.deleteMany(filter);
        
        return {
            acknowledged: result.acknowledged,
            deletedCount: result.deletedCount
        };
    }

    /**
     * 执行聚合查询操作
     */
    private async executeAggregate(collection: any, opts: IExecuteOptions): Promise<any[]> {
        const pipeline = this.parseJson(opts.inputs?.pipeline || '[]');

        if (!Array.isArray(pipeline)) {
            throw new Error('聚合管道必须是一个数组');
        }

        return await collection.aggregate(pipeline).toArray();
    }

    /**
     * 执行统计文档数量操作
     */
    private async executeCountDocuments(collection: any, opts: IExecuteOptions): Promise<any> {
        const filter = this.parseJson(opts.inputs?.filter || '{}');

        const count = await collection.countDocuments(filter);
        
        return {
            filter,
            count
        };
    }

    /**
     * 解析JSON字符串
     */
    private parseJson(jsonString: string): any {
        try {
            return JSON.parse(jsonString);
        } catch (error: any) {
            throw new Error(`JSON解析失败: ${error.message}`);
        }
    }
}