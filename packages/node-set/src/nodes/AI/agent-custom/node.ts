import { INode, INodeBasic, ToolMode, INodeDetail, IExecuteOptions } from '@repo/common';
import { AgentInvokeOptions, TextMessage, agentManager } from "@repo/engine";
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
                label: '模型连接',
                fieldName: 'connectid',
                control: {
                    name: 'selectconnect',
                    dataType: 'json',
                    connectType: "llm",
                    validation: { required: true },        // 是否必填
                },
                // 联动配置：影响表名字段
                linkage: {
                    targets: ['models']
                }
            },
            {
                label: '模型名称',
                fieldName: 'models',
                control: {
                    name: 'inputselect',
                    dataType: 'string',
                    validation: { required: true },        // 是否必填
                },
                linkage: {
                    dependsOn: 'connectid'
                }
            },
            {
                label: '问题',
                fieldName: 'userprompt',
                control: {
                    name: 'textarea',
                    dataType: 'string',
                    validation: { required: true },        // 是否必填
                }
            },
            {
                label: '系统提示语',
                fieldName: 'prompt',
                conditionRules: {             // 显示条件
                    addBy: {
                        addoptions: ['addoptions'], // 当mode为htmlToMarkdown时显示
                    },
                },
                control: {
                    name: 'textarea',
                    dataType: 'boolean',
                }
            },
            {
                label: '工具调用',
                fieldName: 'mcpMode',
                conditionRules: {
                    addBy: {
                        addoptions: ['mcpMode'],
                    },
                },
                control: {
                    name: 'select',
                    dataType: 'string',
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
                }
            },
            {
                label: '联网搜索',
                fieldName: 'webSearch',
                conditionRules: {             // 显示条件
                    addBy: {
                        addoptions: ['webSearch'], // 当mode为htmlToMarkdown时显示
                    },
                },
                control: {
                    name: 'switch',
                    dataType: 'boolean',
                }
            },
            {
                label: '链接访问',
                fieldName: 'link',
                conditionRules: {             // 显示条件
                    addBy: {
                        addoptions: ['link'], // 当mode为htmlToMarkdown时显示
                    },
                },
                control: {
                    name: 'switch',
                    dataType: 'boolean',
                }
            },
            {
                label: '深度思考',
                fieldName: 'deepThinking',
                conditionRules: {             // 显示条件
                    addBy: {
                        addoptions: ['deepThinking'], // 当mode为htmlToMarkdown时显示
                    },
                },
                control: {
                    name: 'switch',
                    dataType: 'boolean',
                    defaultValue: false,
                    attributes: [{
                        text: '开启,关闭',
                    }],
                }
            },
            {
                label: '温度控制',
                fieldName: 'tempcontrol',
                conditionRules: {             // 显示条件
                    addBy: {
                        addoptions: ['tempcontrol'], // 当mode为htmlToMarkdown时显示
                    },
                },
                control: {
                    name: 'collection',
                    dataType: 'options',
                    options: [
                        {
                            label: '温度参数',
                            fieldName: 'temperature',
                            control: {
                                name: 'slider',
                                dataType: 'number',
                                defaultValue: 0.7,
                                attributes: [{
                                    minValue: 0,
                                    maxValue: 2,
                                    numberPrecision: 2
                                }],

                            }
                        }
                    ],
                },
            },
            {
                label: "高级参数",
                fieldName: "advancedParam",
                conditionRules: {             // 显示条件
                    addBy: {
                        addoptions: ['advancedParam'], // 当mode为htmlToMarkdown时显示
                    },
                },
                control: {
                    name: 'collection',
                    dataType: 'options',
                    options: [
                        {
                            label: 'minP',
                            fieldName: 'minP',
                            control: {
                                name: 'slider',
                                dataType: 'number',
                                defaultValue: 0.05,
                                attributes: [{
                                    minValue: 0,
                                    maxValue: 1,
                                    numberPrecision: 2
                                }],

                            }
                        }, {
                            label: 'topP',
                            fieldName: 'topP',
                            control: {
                                name: 'slider',
                                dataType: 'number',
                                defaultValue: 0.90,
                                attributes: [{
                                    minValue: 0,
                                    maxValue: 1,
                                    numberPrecision: 2
                                }],

                            }
                        }, {
                            label: 'topK',
                            fieldName: 'topK',
                            control: {
                                name: 'slider',
                                dataType: 'number',
                                defaultValue: 40,
                                attributes: [{
                                    minValue: 0,
                                    maxValue: 120,
                                    numberPrecision: 0
                                }],

                            }
                        }
                    ],
                },
            },
            {
                label: "迭代控制",
                fieldName: "lterateControl",
                conditionRules: {             // 显示条件
                    addBy: {
                        addoptions: ['lterateControl'], // 当mode为htmlToMarkdown时显示
                    },
                },
                control: {
                    name: 'collection',
                    dataType: 'options',
                    options: [
                        {
                            label: '返回的代数',
                            fieldName: 'generations',
                            control: {
                                name: 'input',
                                dataType: 'number',
                                defaultValue: 1
                            }
                        }, {
                            label: '最大迭代',
                            fieldName: 'maxIterations',
                            control: {
                                name: 'input',
                                dataType: 'number',
                                defaultValue: 1
                            }
                        }
                    ],
                },
            },
            {
                label: '',
                fieldName: 'addoptions',
                control: {
                    name: 'selectadd',
                    dataType: 'multiOptions',
                    defaultValue: '增加选项',
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
                    ]
                }
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