import { INode, INodeBasic, INodeDetail, IExecuteOptions, ToolMode } from '@repo/common';
import { AgentInstance, AgentInvokeOptions, agentManager, TextMessage } from "@repo/engine";
import { credentialManager } from '@repo/common';
export class AiAgentSystem implements INode {
    node: INodeBasic = {
        kind: "agent-system",
        name: "智能体引用",
        icon: "agent-system.svg",
        catalog: "AI",
        "version": 1,
        nodeWidth: 600,
        resource: ['mcp', 'connect', 'workflow'],
        description: "引用已创建的智能体，复用智能体的配置和能力",
        //合并到inngest任务
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
                    dataType: 'string',
                    connectType: "llm",
                    validation: { required: true }
                },
                linkage: {
                    targets: ['model']
                }
            },
            {
                label: '模型名称',
                fieldName: 'model',
                control: {
                    name: 'input',
                    dataType: 'string',
                    validation: { required: true }
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
                    validation: { required: true }
                }
            },
            {
                label: '系统提示语',
                fieldName: 'prompt',
                conditionRules: {
                    addBy: {
                        addoptions: ['prompt']
                    }
                },
                control: {
                    name: 'textarea',
                    dataType: 'string'
                }
            },
            {
                label: '工具调用',
                fieldName: 'mcpMode',
                conditionRules: {
                    addBy: {
                        addoptions: ['mcpMode']
                    }
                },
                control: {
                    name: 'select',
                    dataType: 'string',
                    options: [{
                        name: '提示词',
                        value: 'prompt',
                        description: ''
                    },
                    {
                        name: '函数',
                        value: 'function',
                        description: '执行SELECT查询获取数据'
                    }]
                }
            },
            {
                label: '联网搜索',
                fieldName: 'webSearch',
                conditionRules: {
                    addBy: {
                        addoptions: ['webSearch']
                    }
                },
                control: {
                    name: 'switch',
                    dataType: 'boolean',
                    defaultValue: false
                }
            },
            {
                label: '链接访问',
                fieldName: 'link',
                conditionRules: {
                    addBy: {
                        addoptions: ['link']
                    }
                },
                control: {
                    name: 'switch',
                    dataType: 'boolean',
                    defaultValue: false
                }
            },
            {
                label: '深度思考',
                fieldName: 'deepThinking',
                conditionRules: {
                    addBy: {
                        addoptions: ['deepThinking']
                    }
                },
                control: {
                    name: 'switch',
                    dataType: 'boolean',
                    defaultValue: false,
                    attributes: [{
                        text: '开启,关闭'
                    }]
                }
            },
            {
                label: '温度控制',
                fieldName: 'tempcontrol',
                conditionRules: {
                    addBy: {
                        addoptions: ['tempcontrol']
                    }
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
                                }]
                            }
                        }
                    ]
                }
            },
            {
                label: '高级参数',
                fieldName: 'advancedParam',
                conditionRules: {
                    addBy: {
                        addoptions: ['advancedParam']
                    }
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
                                }]
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
                                }]
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
                                }]
                            }
                        }
                    ]
                }
            },
            {
                label: '迭代控制',
                fieldName: 'lterateControl',
                conditionRules: {
                    addBy: {
                        addoptions: ['lterateControl']
                    }
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
                    ]
                }
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
                            value: 'prompt'
                        },
                        {
                            name: '工具调用模式',
                            value: 'mcpMode'
                        },
                        {
                            name: '联网搜索',
                            value: 'webSearch'
                        },
                        {
                            name: '链接访问',
                            value: 'link'
                        },
                        {
                            name: '深度思考',
                            value: 'deepThinking'
                        },
                        {
                            name: '温度控制',
                            value: 'tempcontrol'
                        },
                        {
                            name: '高级参数',
                            value: 'advancedParam'
                        },
                        {
                            name: '迭代控制',
                            value: 'lterateControl'
                        }
                    ]
                }
            }
        ],
    };

    async execute(opts: IExecuteOptions): Promise<any> {
        // 从opts.inputs中获取用户配置的参数
        const inputs = opts.inputs || {};
        const agentResources = inputs.agentResources || {};

        // 获取连接信息
        const connectConfig = await credentialManager.mediator?.get(inputs.connectid);
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
        const link = inputs.link || false;
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
            workflows: agentResources.workflowList,
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
            usingDefaultSystemMessage: true
        };

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