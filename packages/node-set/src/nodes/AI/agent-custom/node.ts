import { INode, INodeBasic, ToolMode, INodeDetail, IExecuteOptions } from '@repo/common';
import { AgentInvokeOptions, mcpManager, AgentInstance, TextMessage, agentManager } from "@repo/engine";
import { credentialManager } from '@repo/common';

export class AiAgentCustom implements INode {
    node: INodeBasic = {
        kind: "agent-custom",
        name: "AI智能体",
        icon: {
            light: "agent-custom-light.svg",
            dark: "agent-custom-dark.svg"
        },
        catalog: 'AI',
        "version": 1,
        nodeWidth: 600,
        resource: ['mcp', 'connect', 'workflow'],
        description: "通过调用大语言模型与工具，生成内容",
        stepMode: 'nested',
        nodeMode: 'agent'
    };
    detail: INodeDetail = {
        fields: [
            {
                displayName: '模型连接',
                name: 'connectid',
                type: 'string',
                default: '',
                required: true,
                connectType: "llm",
                controlType: 'selectconnect',
                // 联动配置：影响表名字段
                linkage: {
                    targets: ['model'],
                }
            },
            {
                displayName: '模型名称',
                name: 'model',
                type: 'string',
                default: '',
                required: true,
                placeholder: '',
                controlType: 'inputselect',
                // 联动配置：依赖连接源字段
                linkage: {
                    dependsOn: 'connectid',
                    fetchMethod: 'fetchConnectDetail',
                    clearOnChange: true,
                }
            },
            {
                displayName: '问题',
                name: 'userprompt',
                type: 'string',
                default: '',
                required: true,
                placeholder: '',
                controlType: 'textarea'
            },
            {
                displayName: '系统提示语',
                name: 'prompt',
                type: 'boolean',
                displayOptions: {
                    addBy: {
                        addoptions: ['prompt'],
                    },
                },
                default: '',
                controlType: 'textarea'
            },
            {
                displayName: '工具调用',
                name: 'mcpMode',
                type: 'boolean',
                displayOptions: {
                    addBy: {
                        addoptions: ['mcpMode'],
                    },
                },
                options: [{
                    name: '提示词',
                    value: 'prompt',
                    description: '',
                },
                {
                    name: '函数',
                    value: 'function',
                    description: '执行SELECT查询获取数据',
                }],
                default: '',
                controlType: 'select'
            },
            {
                displayName: '联网搜索',
                name: 'webSearch',
                type: 'boolean',
                displayOptions: {
                    addBy: {
                        addoptions: ['webSearch'],
                    },
                },
                default: false,
                controlType: 'switch'
            },
            {
                displayName: '链接访问',
                name: 'link',
                type: 'boolean',
                displayOptions: {
                    addBy: {
                        addoptions: ['link'],
                    },
                },
                default: false,
                controlType: 'switch'
            },
            {
                displayName: '深度思考',
                name: 'deepThinking',
                type: 'boolean',
                displayOptions: {
                    addBy: {
                        addoptions: ['deepThinking'],
                    },
                },
                typeOptions: {
                    showText: ['开启', '关闭']
                },
                default: false,
                controlType: 'switch'
            },
            {
                displayName: "温度控制",
                name: "tempcontrol",
                type: "collection",
                controlType: 'collection',
                displayOptions: {
                    addBy: {
                        addoptions: ['temperature'],
                    },
                },
                options: [
                    {
                        displayName: '温度参数',
                        name: 'temperature',
                        type: 'number',
                        default: 0.7,
                        controlType: 'slider',
                        typeOptions: {
                            minValue: 0,
                            maxValue: 2,
                            numberPrecision: 2
                        }
                    }
                ],
                default: ''
            },
            {
                displayName: "高级参数",
                name: "advancedParam",
                type: "collection",
                controlType: 'collection',
                displayOptions: {
                    addBy: {
                        addoptions: ['advancedParam'],
                    },
                },
                options: [
                    {
                        displayName: 'minP',
                        name: 'minP',
                        type: 'number',
                        default: 0.05,
                        controlType: 'slider',
                        typeOptions: {
                            minValue: 0,
                            maxValue: 1,
                            numberPrecision: 2
                        }
                    }, {
                        displayName: 'topP',
                        name: 'topP',
                        type: 'number',
                        default: 0.90,
                        controlType: 'slider',
                        typeOptions: {
                            minValue: 0,
                            maxValue: 1,
                            numberPrecision: 2
                        }
                    }, {
                        displayName: 'topK',
                        name: 'topK',
                        type: 'number',
                        default: 40,
                        controlType: 'slider',
                        typeOptions: {
                            minValue: 0,
                            maxValue: 120,
                            numberPrecision: 0
                        }
                    },
                ],
                default: ''
            },
            {
                displayName: "迭代控制",
                name: "lterateControl",
                type: "collection",
                controlType: 'collection',
                displayOptions: {
                    addBy: {
                        addoptions: ['lterateControl'],
                    },
                },
                options: [
                    {
                        displayName: '返回的代数',
                        name: 'generations',
                        type: 'number',
                        default: 1,
                        controlType: 'input'
                    }, {
                        displayName: '最大迭代',
                        name: 'maxIterations',
                        type: 'number',
                        default: 1,
                        controlType: 'input',
                    }
                ],
                default: ''
            },
            {
                displayName: '操作类型',
                name: 'addoptions',
                type: 'options',
                options: [
                    {
                        name: '提示语(系统)',
                        value: 'prompt',
                    },
                    {
                        name: '工具调用模式',
                        value: 'mcpMode',
                    },
                    {
                        name: '联网搜索',
                        value: 'webSearch',
                    },
                    {
                        name: '链接访问',
                        value: 'link',
                    },
                    {
                        name: '深度思考',
                        value: 'deepThinking',
                    },
                    {
                        name: '温度控制',
                        value: 'temperature',
                    },
                    {
                        name: '高级参数',
                        value: 'advancedParam',
                    }
                    ,
                    {
                        name: '迭代控制',
                        value: 'lterateControl',
                    }
                ],
                default: '+ 增加选项',
                placeholder: '',
                controlType: 'selectadd'
            },
        ],
    };

    async execute(opts: IExecuteOptions): Promise<any> {
        // 从opts.inputs中获取用户配置的参数
        const inputs = opts.inputs || {};
        const agentResources = inputs.agentResources || {};

        let connectMeta = JSON.parse(inputs.connectid);

        // 获取连接信息
        const connectConfig = await credentialManager.mediator?.get(connectMeta.id);
        const configData = connectConfig?.config;
        const connectInfo = {
            apiKey: configData.apiKey || '',
            baseUrl: configData.baseUrl || ''
        };

        const model = inputs.model || '';
        const apiKey = connectInfo.apiKey || '';
        const baseUrl = connectInfo.baseUrl || '';
        const series = configData.driver || '';

        // 获取提示语
        const userprompt = inputs.userprompt || '';
        const systemMessage = inputs.prompt || '';

        // 获取工具调用模式
        const mcpMode = inputs.mcpMode || 'prompt';
        const toolMode = mcpMode === 'prompt' ? ToolMode.Prompt : ToolMode.Function;

        // 获取能力配置
        const webSearch = inputs.webSearch || false;
        const deepThinking = inputs.deepThinking || false;

        // 获取温度控制参数
        const tempcontrol = inputs.tempcontrol || {};
        const temperature = tempcontrol.temperature || 0.7;

        // 获取高级参数
        const advancedParam = inputs.advancedParam || {};
        const minP = advancedParam.minP || 0.05;
        const topP = advancedParam.topP || 0.7;
        const topK = advancedParam.topK || 50;

        // 获取迭代控制参数
        const lterateControl = inputs.lterateControl || {};
        const maxIterations = lterateControl.maxIterations || 1;

        const config = {
            id: opts.id || '',
            name: opts.id || '',
            systemMessage: systemMessage,
            chatModel: {
                model: model,
                apiKey: apiKey, // 这个通常从连接配置中获取
                baseUrl: baseUrl, // 这个通常从连接配置中获取
                toolMode: toolMode,
                series: series,
                stream: false
            },
            mcpServers: agentResources.mcpList,
            workflows: agentResources.workflowListt,
            connects: agentResources.connectList,
            abilities: {
                useInternet: webSearch,
                maxTokens: 512,
                enableThinking: deepThinking,
                thinkingBudget: 4096,
                minP: minP,
                topP: topP,
                topK: topK,
                temperature: temperature,
                frequencyPenalty: 1,
                maxIter: maxIterations,
                toolMode: toolMode
            }
        };

        // 构建智能体调用选项
        const agentInvokeOpts: AgentInvokeOptions = {
            extSystemMessage: systemMessage,
            input: userprompt,
            state: opts.state,
            stream: false,
            threadId: '', // 可以根据需要从opts中获取
            userId: '', // 可以根据需要从opts中获取
            waitOutput: true,
            persistentHistory: false,
            usingDefaultSystemMessage: true,
        }

        const agent = await agentManager.build(config);
        const result = (await agent.run(agentInvokeOpts, undefined, opts.step)).at(-1);

        // 只返回runData第一条下面的_results第一条的output第一条
        if (result
            && result.output[0] !== undefined
            && result.output[0].type == "text") {
            const message = result.output[0] as TextMessage;
            return {
                content: message.content,
                type: message.type
            };
        }

        // 如果没有找到预期的数据结构，返回空对象或原始结果
        return result;
    }
}