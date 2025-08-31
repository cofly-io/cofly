import { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';
import { Builder, Parser } from 'xml2js';

export class Xml implements INode {
    node: INodeBasic = {
        kind: 'xml',
        name: 'XML⇋JSON',
        event: 'xml',
        catalog: 'general',
        version: 1,
        description: 'JSON和XML格式之间的相互转换',
        icon: 'xml.svg',
        nodeWidth: 500
    };

    detail: INodeDetail = {
        fields: [
            {
                displayName: '转换模式',
                name: 'mode',
                type: 'options',
                options: [
                    {
                        name: 'JSON转XML',
                        value: 'jsonToXml',
                        description: '将JSON数据转换为XML格式',
                    },
                    {
                        name: 'XML转JSON',
                        value: 'xmlToJson',
                        description: '将XML数据转换为JSON格式',
                    }
                ],
                default: 'xmlToJson',
                placeholder: '选择转换模式',
                controlType: 'selectwithdesc'
            },
            {
                displayName: '数据属性名',
                name: 'dataPropertyName',
                type: 'string',
                default: 'data',
                required: true,
                placeholder: '包含要转换数据的属性名',
                controlType: 'input'
            },
            // XML转JSON的选项
            {
                displayName: '属性前缀',
                name: 'attrkey',
                type: 'string',
                default: '$',
                placeholder: '用于访问XML属性的前缀',
                controlType: 'input',
                displayOptions: {
                    showBy: {
                        mode: ['xmlToJson']
                    }
                }
            },
            {
                displayName: '字符内容前缀',
                name: 'charkey',
                type: 'string',
                default: '_',
                placeholder: '用于访问字符内容的前缀',
                controlType: 'input',
                displayOptions: {
                    showBy: {
                        mode: ['xmlToJson']
                    }
                }
            },
            {
                displayName: '显式数组',
                name: 'explicitArray',
                type: 'boolean',
                default: false,
                placeholder: '是否总是将子节点放在数组中',
                controlType: 'checkbox',
                displayOptions: {
                    showBy: {
                        mode: ['xmlToJson']
                    }
                }
            },
            {
                displayName: '显式根节点',
                name: 'explicitRoot',
                type: 'boolean',
                default: true,
                placeholder: '是否在结果对象中包含根节点',
                controlType: 'checkbox',
                displayOptions: {
                    showBy: {
                        mode: ['xmlToJson']
                    }
                }
            },
            {
                displayName: '忽略属性',
                name: 'ignoreAttrs',
                type: 'boolean',
                default: false,
                placeholder: '是否忽略所有XML属性',
                controlType: 'checkbox',
                displayOptions: {
                    showBy: {
                        mode: ['xmlToJson']
                    }
                }
            },
            {
                displayName: '合并属性',
                name: 'mergeAttrs',
                type: 'boolean',
                default: true,
                placeholder: '是否将属性和子元素合并为父元素的属性',
                controlType: 'checkbox',
                displayOptions: {
                    showBy: {
                        mode: ['xmlToJson']
                    }
                }
            },
            {
                displayName: '标准化',
                name: 'normalize',
                type: 'boolean',
                default: false,
                placeholder: '是否修剪文本节点内的空白字符',
                controlType: 'checkbox',
                displayOptions: {
                    showBy: {
                        mode: ['xmlToJson']
                    }
                }
            },
            {
                displayName: '标准化标签',
                name: 'normalizeTags',
                type: 'boolean',
                default: false,
                placeholder: '是否将所有标签名转换为小写',
                controlType: 'checkbox',
                displayOptions: {
                    showBy: {
                        mode: ['xmlToJson']
                    }
                }
            },
            {
                displayName: '修剪空白',
                name: 'trim',
                type: 'boolean',
                default: false,
                placeholder: '是否修剪文本节点开头和结尾的空白字符',
                controlType: 'checkbox',
                displayOptions: {
                    showBy: {
                        mode: ['xmlToJson']
                    }
                }
            },
            // JSON转XML的选项
            {
                displayName: '允许代理字符',
                name: 'allowSurrogateChars',
                type: 'boolean',
                default: false,
                placeholder: '是否允许使用Unicode代理块中的字符',
                controlType: 'checkbox',
                displayOptions: {
                    showBy: {
                        mode: ['jsonToXml']
                    }
                }
            },
            {
                displayName: '属性前缀',
                name: 'xmlAttrkey',
                type: 'string',
                default: '$',
                placeholder: '用于访问XML属性的前缀',
                controlType: 'input',
                displayOptions: {
                    showBy: {
                        mode: ['jsonToXml']
                    }
                }
            },
            {
                displayName: '字符内容前缀',
                name: 'xmlCharkey',
                type: 'string',
                default: '_',
                placeholder: '用于访问字符内容的前缀',
                controlType: 'input',
                displayOptions: {
                    showBy: {
                        mode: ['jsonToXml']
                    }
                }
            },
            {
                displayName: '使用CDATA',
                name: 'cdata',
                type: 'boolean',
                default: false,
                placeholder: '是否在必要时将文本节点包装在CDATA中',
                controlType: 'checkbox',
                displayOptions: {
                    showBy: {
                        mode: ['jsonToXml']
                    }
                }
            },
            {
                displayName: '无头部',
                name: 'headless',
                type: 'boolean',
                default: false,
                placeholder: '是否省略XML头部声明',
                controlType: 'checkbox',
                displayOptions: {
                    showBy: {
                        mode: ['jsonToXml']
                    }
                }
            },
            {
                displayName: '根元素名',
                name: 'rootName',
                type: 'string',
                default: 'root',
                placeholder: '要使用的根元素名称',
                controlType: 'input',
                displayOptions: {
                    showBy: {
                        mode: ['jsonToXml']
                    }
                }
            }
        ]
    };

    async execute(opts: IExecuteOptions): Promise<any> {
        const mode = opts.inputs?.mode || 'xmlToJson';

        try {
            const dataPropertyName = opts.inputs?.dataPropertyName || 'data';
            const inputData = opts.state?.get('$input') || {};

            if (mode === 'xmlToJson') {
                return await this.convertXmlToJson(inputData, dataPropertyName, opts.inputs);
            } else if (mode === 'jsonToXml') {
                return await this.convertJsonToXml(inputData, dataPropertyName, opts.inputs);
            } else {
                throw new Error(`不支持的转换模式: ${mode}`);
            }

        } catch (error: any) {
            console.error('❌ [XML Node] 执行错误:', error.message);
            return {
                error: error.message,
                success: false,
                mode
            };
        }
    }

    private async convertXmlToJson(inputData: any, dataPropertyName: string, options: any): Promise<any> {
        const xmlData = inputData[dataPropertyName];

        if (!xmlData) {
            throw new Error(`输入数据中没有名为 "${dataPropertyName}" 的属性`);
        }

        if (typeof xmlData !== 'string') {
            throw new Error(`属性 "${dataPropertyName}" 必须是字符串类型的XML数据`);
        }

        // 构建解析器选项
        const parserOptions = {
            mergeAttrs: options?.mergeAttrs !== false, // 默认为true
            explicitArray: options?.explicitArray === true, // 默认为false
            explicitRoot: options?.explicitRoot !== false, // 默认为true
            ignoreAttrs: options?.ignoreAttrs === true, // 默认为false
            normalize: options?.normalize === true, // 默认为false
            normalizeTags: options?.normalizeTags === true, // 默认为false
            trim: options?.trim === true, // 默认为false
            attrkey: options?.attrkey || '$',
            charkey: options?.charkey || '_'
        };

        try {
            const parser = new Parser(parserOptions);
            const result = await parser.parseStringPromise(xmlData);

            return {
                [dataPropertyName]: result,
                success: true,
                mode: 'xmlToJson',
                timestamp: new Date().toISOString()
            };

        } catch (error: any) {
            throw new Error(`XML解析失败: ${error.message}`);
        }
    }

    private async convertJsonToXml(inputData: any, dataPropertyName: string, options: any): Promise<any> {
        // 构建生成器选项
        const builderOptions = {
            allowSurrogateChars: options?.allowSurrogateChars === true,
            attrkey: options?.xmlAttrkey || '$',
            charkey: options?.xmlCharkey || '_',
            cdata: options?.cdata === true,
            headless: options?.headless === true,
            rootName: options?.rootName || 'root'
        };

        try {
            const builder = new Builder(builderOptions);
            const xmlResult = builder.buildObject(inputData);

            return {
                [dataPropertyName]: xmlResult,
                success: true,
                mode: 'jsonToXml',
                timestamp: new Date().toISOString()
            };

        } catch (error: any) {
            throw new Error(`JSON转XML失败: ${error.message}`);
        }
    }
}