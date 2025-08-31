/**
 * 连接工具函数
 */

/**
 * 验证连接配置字段
 */
export function validateConnectConfig(fields: any[], config: Record<string, any>): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    for (const field of fields) {
        if (field.required && !config[field.name]) {
            errors.push(`缺少必填字段: ${field.displayName}`);
        }

        // 类型验证
        if (config[field.name] !== undefined) {
            const value = config[field.name];
            
            switch (field.type) {
                case 'number':
                    if (typeof value !== 'number' && isNaN(Number(value))) {
                        errors.push(`${field.displayName} 必须是数字`);
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        errors.push(`${field.displayName} 必须是布尔值`);
                    }
                    break;
                case 'string':
                    if (typeof value !== 'string') {
                        errors.push(`${field.displayName} 必须是字符串`);
                    }
                    break;
            }

            // 数值范围验证
            if (field.type === 'number' && field.typeOptions) {
                const numValue = Number(value);
                if (field.typeOptions.minValue !== undefined && numValue < field.typeOptions.minValue) {
                    errors.push(`${field.displayName} 不能小于 ${field.typeOptions.minValue}`);
                }
                if (field.typeOptions.maxValue !== undefined && numValue > field.typeOptions.maxValue) {
                    errors.push(`${field.displayName} 不能大于 ${field.typeOptions.maxValue}`);
                }
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 过滤敏感配置信息（用于日志输出）
 */
export function sanitizeConfig(config: Record<string, any>, secureFields: string[] = []): Record<string, any> {
    const sanitized = { ...config };
    
    // 默认的敏感字段
    const defaultSecureFields = ['password', 'apiKey', 'token', 'secret', 'key'];
    const allSecureFields = [...defaultSecureFields, ...secureFields];

    for (const field of allSecureFields) {
        if (sanitized[field]) {
            sanitized[field] = '***';
        }
    }

    return sanitized;
}

/**
 * 生成连接实例ID
 */
export function generateConnectInstanceId(connectId: string, name: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${connectId}-${timestamp}-${random}`;
}

export * from './llm-fields';
export * from './llm-tester';