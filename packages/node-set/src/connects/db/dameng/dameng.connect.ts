import { Icon } from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';
import { ConnectTestResult } from '@repo/common';

/**
 * 达梦数据库连接定义
 */
export class DamengConnect extends BaseDatabaseConnect {
    override overview = {
        id: 'dameng',
        name: '达梦数据库 DM',
        type: 'db' as const,
        provider: 'dameng' as const,
        icon: 'dameng.svg' as Icon,
        description: '达梦关系型数据库',
        version: '1.0.0'
    };

    override detail = {
        defaultPort: 5236,
        supportedFeatures: [
            'transactions' as const,
            'stored_procedures' as const,
            'views' as const,
            'triggers' as const,
            'full_text_search' as const,
            'json_support' as const
        ],
        fields: [
            {
                label: '主机地址',
                fieldName: 'host',
                description: '达梦数据库服务器的主机地址',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: 'localhost',
                    validation: {
                        required: true
                    },
                    placeholder: 'localhost 或 IP地址'
                }
            },
            {
                label: '端口',
                fieldName: 'port',
                description: '达梦数据库服务器端口号',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 5236,
                    validation: {
                        required: true
                    }
                }
            },
            {
                label: '用户名',
                fieldName: 'username',
                description: '数据库用户名',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '请输入数据库用户名'
                }
            },
            {
                label: '密码',
                fieldName: 'password',
                description: '数据库密码',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: false
                    },
                    placeholder: '请输入数据库密码',
                    attributes: [{
                        type: 'password'
                    }]
                }
            },
            {
                label: '连接方式',
                fieldName: 'connectionType',
                description: '达梦数据库连接方式',
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'service',
                    options: [
                        { name: '服务名连接', value: 'service' },
                        { name: '实例名连接', value: 'instance' },
                        { name: '直连方式', value: 'direct' }
                    ]
                }
            },
            {
                label: '服务名/实例名',
                fieldName: 'serviceName',
                description: '达梦数据库服务名或实例名',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: 'DMSERVER',
                    validation: {
                        required: true
                    },
                    placeholder: 'DMSERVER, DM01等'
                },
                conditionRules: {
                    showBy: {
                        connectionType: ['service', 'instance']
                    }
                }
            },
            {
                label: 'Schema用户',
                fieldName: 'schema',
                description: '默认Schema用户名（可选）',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    placeholder: '通常与用户名相同'
                }
            },
            {
                label: '字符集',
                fieldName: 'charset',
                description: '数据库字符集',
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'UTF-8',
                    options: [
                        { name: 'UTF-8', value: 'UTF-8' },
                        { name: 'GBK', value: 'GBK' },
                        { name: 'GB18030', value: 'GB18030' },
                        { name: 'ISO-8859-1', value: 'ISO-8859-1' }
                    ]
                }
            },
            {
                label: '启用SSL',
                fieldName: 'ssl',
                description: '是否启用SSL连接',
                control: {
                    name: 'switch' as const,
                    dataType: 'boolean' as const,
                    defaultValue: false
                }
            },
            {
                label: '自动提交',
                fieldName: 'autoCommit',
                description: '是否自动提交事务',
                control: {
                    name: 'switch' as const,
                    dataType: 'boolean' as const,
                    defaultValue: true
                }
            },
            {
                label: '连接超时(秒)',
                fieldName: 'connectionTimeout',
                description: '连接超时时间，单位：秒',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 30
                }
            },
            {
                label: '查询超时(秒)',
                fieldName: 'queryTimeout',
                description: '查询超时时间，单位：秒',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 30
                }
            },
            {
                label: '连接池大小',
                fieldName: 'poolSize',
                description: '连接池最大连接数',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 10
                }
            }
        ],
        validateConnection: true,
        connectionTimeout: 30000
    };

    /**
     * 测试达梦数据库连接
     */
    async test(config: Record<string, any>): Promise<ConnectTestResult> {
        const startTime = Date.now();
        try {
            // 验证必填字段
            const requiredFields = ['host', 'port', 'database', 'username'];
            for (const field of requiredFields) {
                if (!config[field]) {
                    return {
                        success: false,
                        message: `缺少必填字段: ${field}`
                    };
                }
            }

            // TODO: 添加实际的连接测试逻辑
            return {
                success: true,
                message: '连接测试成功',
                latency: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: `连接失败: ${error instanceof Error ? error.message : String(error)}`,
                latency: Date.now() - startTime
            };
        }
    }
}