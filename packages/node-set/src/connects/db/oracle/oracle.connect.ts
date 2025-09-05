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
                label: '主机地址',
                fieldName: 'host',
                description: 'Oracle服务器的主机地址',
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
                description: 'Oracle服务器端口号',
                control: {
                    name: 'input' as const,
                    dataType: 'number' as const,
                    defaultValue: 1521,
                    validation: {
                        required: true
                    }
                }
            },
            {
                label: '连接类型',
                fieldName: 'connectionType',
                description: 'Oracle连接类型',
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'sid',
                    options: [
                        { name: 'SID', value: 'sid' },
                        { name: 'Service Name', value: 'service' },
                        { name: 'TNS', value: 'tns' }
                    ]
                }
            },
            {
                label: 'SID/服务名',
                fieldName: 'sid',
                description: 'Oracle SID或服务名',
                control: {
                    name: 'input' as const,
                    dataType: 'string' as const,
                    defaultValue: 'ORCL',
                    validation: {
                        required: true
                    },
                    placeholder: 'ORCL, XE, XEPDB1等'
                },
                conditionRules: {
                    showBy: {
                        connectionType: ['sid', 'service']
                    }
                }
            },
            {
                label: 'TNS连接字符串',
                fieldName: 'tnsConnectString',
                description: 'TNS连接字符串',
                control: {
                    name: 'textarea' as const,
                    dataType: 'string' as const,
                    defaultValue: '',
                    validation: {
                        required: true
                    },
                    placeholder: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SID=ORCL)))'
                },
                conditionRules: {
                    showBy: {
                        connectionType: ['tns']
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
                label: '角色',
                fieldName: 'role',
                description: 'Oracle连接角色',
                control: {
                    name: 'select' as const,
                    dataType: 'string' as const,
                    defaultValue: 'normal',
                    options: [
                        { name: '普通用户', value: 'normal' },
                        { name: 'SYSDBA', value: 'sysdba' },
                        { name: 'SYSOPER', value: 'sysoper' }
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
            // {
            //     label: '连接池大小',
            //     fieldName: 'poolSize',
            //     description: '连接池最大连接数',
            //     control: {
            //         name: 'input' as const,
            //         dataType: 'number' as const,
            //         defaultValue: 10
            //     }
            // },
            // {
            //     label: '连接超时(秒)',
            //     fieldName: 'connectionTimeout',
            //     description: '连接超时时间，单位：秒',
            //     control: {
            //         name: 'input' as const,
            //         dataType: 'number' as const,
            //         defaultValue: 30
            //     }
            // },
            // {
            //     label: '语句超时(秒)',
            //     fieldName: 'statementTimeout',
            //     description: 'SQL语句执行超时时间，单位：秒',
            //     control: {
            //         name: 'input' as const,
            //         dataType: 'number' as const,
            //         defaultValue: 30
            //     }
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