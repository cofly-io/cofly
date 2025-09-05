import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class Regular implements INode {
    node: INodeBasic = {
        kind: 'regular',
        name: '正则匹配',
        event: 'regular',
        catalog: 'general',
        version: 1,
        description: '使用正则表达式匹配和提取文本内容',
        icon: 'regular.svg',
        nodeWidth: 600
    };

    detail: INodeDetail = {
		fields: [
			{
				label: '内容',
				fieldName: 'content',
				control: {
					name: 'textarea',
					dataType: 'string',
					defaultValue: '',
					placeholder: '请输入要匹配的文本内容...',
					validation: { required: true }
				}
			},
			{
				label: '匹配类型',
				fieldName: 'matchType',
				control: {
					name: 'selectwithdesc',
					dataType: 'string',
					defaultValue: 'json',
					placeholder: '选择匹配类型',
					options: [
						{
							name: 'JSON',
							value: 'json',
							description: '匹配JSON对象、数组、字符串等',
						},
						{
							name: 'HTML',
							value: 'html',
							description: '匹配HTML标签、属性、文本内容等',
						},
						{
							name: 'JavaScript',
							value: 'javascript',
							description: '匹配JS函数、变量、注释等',
						},
						{
							name: 'Java',
							value: 'java',
							description: '匹配Java类、方法、包名等',
						},
						{
							name: 'Go',
							value: 'go',
							description: '匹配Go函数、结构体、包等',
						},
						{
							name: 'Python',
							value: 'python',
							description: '匹配Python函数、类、导入等',
						},
						{
							name: 'URL',
							value: 'url',
							description: '匹配URL链接',
						},
						{
							name: '邮箱',
							value: 'email',
							description: '匹配邮箱地址',
						},
						{
							name: '手机号',
							value: 'phone',
							description: '匹配中国手机号码',
						},
						{
							name: 'IP地址',
							value: 'ip',
							description: '匹配IPv4地址',
						},
						{
							name: '日期时间',
							value: 'datetime',
							description: '匹配常见日期时间格式',
						},
						{
							name: '自定义正则',
							value: 'custom',
							description: '使用自定义正则表达式',
						}
					]
				}
			},
			{
				label: '自定义正则表达式',
				fieldName: 'customRegex',
				conditionRules: {
					showBy: {
						matchType: ['custom']
					}
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: '例如: \\d+|[a-zA-Z]+',
					validation: { required: true }
				}
			},
			{
				label: '匹配模式',
				fieldName: 'matchMode',
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'all',
					placeholder: '选择匹配模式',
					options: [
						{
							name: '全部匹配',
							value: 'all',
							description: '返回所有匹配结果',
						},
						{
							name: '第一个匹配',
							value: 'first',
							description: '只返回第一个匹配结果',
						},
						{
							name: '最后一个匹配',
							value: 'last',
							description: '只返回最后一个匹配结果',
						}
					]
				}
			},
			{
				label: '输出格式',
				fieldName: 'outputFormat',
				control: {
					name: 'select',
					dataType: 'string',
					defaultValue: 'array',
					placeholder: '选择输出格式',
					options: [
						{
							name: '数组',
							value: 'array',
							description: '以数组形式返回匹配结果',
						},
						{
							name: '字符串',
							value: 'string',
							description: '以换行分隔的字符串返回',
						},
						{
							name: '详细信息',
							value: 'detail',
							description: '返回匹配位置和内容的详细信息',
						}
					]
				}
			}
        ]
    };

    async execute(opts: IExecuteOptions): Promise<any> {
        const matchType = opts.inputs?.matchType || 'json';

        try {
            const content = opts.inputs?.content || '';
            const matchMode = opts.inputs?.matchMode || 'all';
            const outputFormat = opts.inputs?.outputFormat || 'array';

            if (!content.trim()) {
                return {
                    matches: [],
                    count: 0,
                    success: true,
                    message: '内容为空，无匹配结果'
                };
            }

            // 获取正则表达式
            const regex = this.getRegexByType(matchType, opts.inputs?.customRegex);

            // 执行匹配
            const matches = this.performMatch(content, regex, matchMode);

            // 格式化输出
            const result = this.formatOutput(matches, outputFormat);

            return {
                matches: result,
                count: Array.isArray(result) ? result.length : (result ? 1 : 0),
                matchType,
                success: true,
                timestamp: new Date().toISOString()
            };

        } catch (error: any) {
            console.error('❌ [Regular Node] 执行错误:', error.message);
            return {
                error: error.message,
                success: false,
                matchType
            };
        }
    }

    private getRegexByType(type: string, customRegex?: string): RegExp {
        const regexPatterns: Record<string, string> = {
            // JSON相关
            json: '\\{[^{}]*\\}|\\[[^\\[\\]]*\\]|"[^"]*":\\s*"[^"]*"|"[^"]*":\\s*\\d+|"[^"]*":\\s*(?:true|false|null)',

            // HTML相关
            html: '<[^>]+>|<!--[\\s\\S]*?-->|&[a-zA-Z]+;',

            // JavaScript相关
            javascript: 'function\\s+\\w+\\s*\\([^)]*\\)|var\\s+\\w+|let\\s+\\w+|const\\s+\\w+|//.*$|/\\*[\\s\\S]*?\\*/',

            // Java相关
            java: 'public\\s+class\\s+\\w+|private\\s+\\w+\\s+\\w+|public\\s+\\w+\\s+\\w+\\s*\\([^)]*\\)|import\\s+[\\w.]+;',

            // Go相关
            go: 'func\\s+\\w+\\s*\\([^)]*\\)|type\\s+\\w+\\s+struct|package\\s+\\w+|import\\s+"[^"]+"',

            // Python相关
            python: 'def\\s+\\w+\\s*\\([^)]*\\):|class\\s+\\w+\\s*\\([^)]*\\):|import\\s+\\w+|from\\s+\\w+\\s+import',

            // URL
            url: 'https?://[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+',

            // 邮箱
            email: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',

            // 中国手机号
            phone: '1[3-9]\\d{9}',

            // IPv4地址
            ip: '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',

            // 日期时间
            datetime: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}(?:\\s+\\d{1,2}:\\d{1,2}(?::\\d{1,2})?)?|\\d{1,2}[-/]\\d{1,2}[-/]\\d{4}',

            // 自定义
            custom: customRegex || '.*'
        };

        const pattern = regexPatterns[type];
        if (!pattern) {
            throw new Error(`不支持的匹配类型: ${type}`);
        }

        try {
            return new RegExp(pattern, 'gm');
        } catch (error) {
            throw new Error(`正则表达式语法错误: ${pattern}`);
        }
    }

    private performMatch(content: string, regex: RegExp, mode: string): RegExpMatchArray[] {
        const allMatches: RegExpMatchArray[] = [];
        let match: RegExpMatchArray | null;

        while ((match = regex.exec(content)) !== null) {
            allMatches.push(match);
            // 防止无限循环
            if (!regex.global) break;
        }

        switch (mode) {
            case 'first': {
                // Find first non-undefined match
                const firstMatch = allMatches.find(match => match !== undefined);
                return firstMatch ? [firstMatch] : [];
            }
            case 'last': {
                // Find last non-undefined match by iterating backwards
                for (let i = allMatches.length - 1; i >= 0; i--) {
                    const match = allMatches[i];
                    if (match !== undefined) {
                        return [match];  // TypeScript knows match is defined here
                    }
                }
                return [];
            }
            case 'all':
            default: {
                // Filter out undefined values with type guard
                return allMatches.filter((match): match is RegExpMatchArray => match !== undefined);
            }
        }
    }

    private formatOutput(matches: RegExpMatchArray[], format: string): any {
        if (matches.length === 0) {
            return format === 'array' ? [] : (format === 'string' ? '' : []);
        }

        switch (format) {
            case 'string':
                return matches.map(match => match[0]).join('\n');

            case 'detail':
                return matches.map((match, index) => ({
                    index: index + 1,
                    match: match[0],
                    position: match.index ?? -1,
                    length: match[0].length,
                    groups: match.slice(1)
                }));

            case 'array':
            default:
                return matches.map(match => match[0]);
        }
    }
}