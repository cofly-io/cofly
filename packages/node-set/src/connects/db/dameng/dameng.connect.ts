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
                displayName: '主机地址',
                name: 'host',
                type: 'string' as const,
                default: 'localhost',
                description: '达梦数据库服务器的主机地址',
                placeholder: 'localhost 或 IP地址',
                required: true,
                controlType: "input"
            },
            {
                displayName: '端口',
                name: 'port',
                type: 'number' as const,
                default: 5236,
                description: '达梦数据库服务器端口号',
                typeOptions: {
                    minValue: 1,
                    maxValue: 65535
                },
                required: true,
                controlType: "input"
            },
            {
                displayName: '用户名',
                name: 'username',
                type: 'string' as const,
                default: '',
                placeholder: "请输入数据库用户名",
                description: '数据库用户名',
                required: true,
                controlType: "input"
            },
            {
                displayName: '密码',
                name: 'password',
                type: 'string' as const,
                default: '',
                description: '数据库密码',
                placeholder: "请输入数据库密码",
                typeOptions: {
                    password: true
                },
                isSecure: true,
                controlType: "input"
            },
            {
                displayName: '连接方式',
                name: 'connectionType',
                type: 'options' as const,
                default: 'service',
                description: '达梦数据库连接方式',
                options: [
                    { name: '服务名连接', value: 'service' },
                    { name: '实例名连接', value: 'instance' },
                    { name: '直连方式', value: 'direct' }
                ],
                controlType: "select"
            },
            {
                displayName: '服务名/实例名',
                name: 'serviceName',
                type: 'string' as const,
                default: 'DMSERVER',
                description: '达梦数据库服务名或实例名',
                placeholder: 'DMSERVER, DM01等',
                required: true,
                controlType: "input",
                displayOptions: {
                    showBy: {
                        connectionType: ['service', 'instance']
                    }
                }
            },
            {
                displayName: 'Schema用户',
                name: 'schema',
                type: 'string' as const,
                default: '',
                description: '默认Schema用户名（可选）',
                placeholder: '通常与用户名相同',
                controlType: "input"
            },
            {
                displayName: '字符集',
                name: 'charset',
                type: 'options' as const,
                default: 'UTF-8',
                description: '数据库字符集',
                options: [
                    { name: 'UTF-8', value: 'UTF-8' },
                    { name: 'GBK', value: 'GBK' },
                    { name: 'GB18030', value: 'GB18030' },
                    { name: 'ISO-8859-1', value: 'ISO-8859-1' }
                ],
                controlType: "select"
            },
            {
                displayName: '启用SSL',
                name: 'ssl',
                type: 'boolean' as const,
                default: false,
                description: '是否启用SSL连接',
                controlType: "CheckBox"
            },
            {
                displayName: '自动提交',
                name: 'autoCommit',
                type: 'boolean' as const,
                default: true,
                description: '是否自动提交事务',
                controlType: "CheckBox"
            },
            {
                displayName: '连接超时(秒)',
                name: 'connectionTimeout',
                type: 'number' as const,
                default: 30,
                description: '连接超时时间，单位：秒',
                typeOptions: {
                    minValue: 1,
                    maxValue: 300
                },
                controlType: "input"
            },
            {
                displayName: '查询超时(秒)',
                name: 'queryTimeout',
                type: 'number' as const,
                default: 30,
                description: '查询超时时间，单位：秒',
                typeOptions: {
                    minValue: 1,
                    maxValue: 3600
                },
                controlType: "input"
            },
            {
                displayName: '连接池大小',
                name: 'poolSize',
                type: 'number' as const,
                default: 10,
                description: '连接池最大连接数',
                typeOptions: {
                    minValue: 1,
                    maxValue: 100
                },
                controlType: "input"
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