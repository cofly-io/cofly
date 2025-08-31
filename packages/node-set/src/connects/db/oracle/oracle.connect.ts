import { Icon } from '@repo/common';
import { BaseDatabaseConnect } from '../../base/BaseDatabaseConnect';
import { ConnectTestResult } from '@repo/common';

/**
 * Oracle 数据库连接定义
 */
export class OracleConnect extends BaseDatabaseConnect {
    override overview = {
        id: 'oracle',
        name: 'Oracle',
        type: 'db' as const,
        provider: 'oracle' as const,
        icon: 'oracle.svg' as Icon,
        description: 'Oracle关系型数据库连接',
        version: '1.0.0',
    };

    override detail = {
        defaultPort: 1521,
        supportedFeatures: [
            'transactions' as const,
            'stored_procedures' as const,
            'views' as const,
            'triggers' as const,
            'full_text_search' as const
        ],
        fields: [
            {
                displayName: '主机地址',
                name: 'host',
                type: 'string' as const,
                default: 'localhost',
                description: 'Oracle服务器的主机地址',
                placeholder: 'localhost 或 IP地址',
                required: true,
                controlType: "input"
            },
            {
                displayName: '端口',
                name: 'port',
                type: 'number' as const,
                default: 1521,
                description: 'Oracle服务器端口号',
                typeOptions: {
                    minValue: 1,
                    maxValue: 65535
                },
                required: true,
                controlType: "input"
            },
            {
                displayName: '连接类型',
                name: 'connectionType',
                type: 'options' as const,
                default: 'sid',
                description: 'Oracle连接类型',
                options: [
                    { name: 'SID', value: 'sid' },
                    { name: 'Service Name', value: 'service' },
                    { name: 'TNS', value: 'tns' }
                ],
                controlType: "select"
            },
            {
                displayName: 'SID/服务名',
                name: 'sid',
                type: 'string' as const,
                default: 'ORCL',
                description: 'Oracle SID或服务名',
                placeholder: 'ORCL, XE, XEPDB1等',
                required: true,
                controlType: "input",
                displayOptions: {
                    showBy: {
                        connectionType: ['sid', 'service']
                    }
                }
            },
            {
                displayName: 'TNS连接字符串',
                name: 'tnsConnectString',
                type: 'string' as const,
                default: '',
                description: 'TNS连接字符串',
                placeholder: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SID=ORCL)))',
                required: true,
                controlType: "textarea",
                displayOptions: {
                    showBy: {
                        connectionType: ['tns']
                    }
                }
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
                displayName: '角色',
                name: 'role',
                type: 'options' as const,
                default: 'normal',
                description: 'Oracle连接角色',
                options: [
                    { name: '普通用户', value: 'normal' },
                    { name: 'SYSDBA', value: 'sysdba' },
                    { name: 'SYSOPER', value: 'sysoper' }
                ],
                controlType: "select"
            },
            {
                displayName: '启用SSL',
                name: 'ssl',
                type: 'boolean' as const,
                default: false,
                description: '是否启用SSL连接',
                controlType: "switch"
            },
            // {
            //     displayName: '连接池大小',
            //     name: 'poolSize',
            //     type: 'number' as const,
            //     default: 10,
            //     description: '连接池最大连接数',
            //     typeOptions: {
            //         minValue: 1,
            //         maxValue: 100
            //     },
            //     controlType: "input"
            // },
            // {
            //     displayName: '连接超时(秒)',
            //     name: 'connectionTimeout',
            //     type: 'number' as const,
            //     default: 30,
            //     description: '连接超时时间，单位：秒',
            //     typeOptions: {
            //         minValue: 1,
            //         maxValue: 300
            //     },
            //     controlType: "input"
            // },
            // {
            //     displayName: '语句超时(秒)',
            //     name: 'statementTimeout',
            //     type: 'number' as const,
            //     default: 30,
            //     description: 'SQL语句执行超时时间，单位：秒',
            //     typeOptions: {
            //         minValue: 1,
            //         maxValue: 3600
            //     },
            //     controlType: "input"
            // }
        ],
        validateConnection: true,
        connectionTimeout: 30000
    };

    /**
     * 测试Oracle连接
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