import { AbstractAgent, BaseEvent, EventType, RunAgentInput } from '@ag-ui/client';
import { CopilotRuntime, GraphQLContext } from "@copilotkit/runtime";
import { Observable } from "rxjs";
import { subscribe } from "@inngest/realtime";
import { AgentInvokeOptions, agentManager, AgentResult, inngest, TextMessage } from "@repo/engine";
import { loadThreadState, ThreadStateResponse } from "./threadStateService";
import { AgenticData } from "@repo/common";

export class AguiAgent extends AbstractAgent {
    readonly #agent: AgenticData;

    constructor(agent: AgenticData) {
        super({
            agentId: agent.id,
            description: agent.description || agent.name || undefined,
            threadId: undefined,
            initialMessages: undefined,
            initialState: undefined,
        });

        this.#agent = agent;
    }

    protected run(input: RunAgentInput): Observable<BaseEvent> {
        return new Observable<BaseEvent>((observer) => {

            const userMessage = input.messages.filter(item => item.role == 'user')?.at(-1) || undefined;

            observer.next({
                type: EventType.RUN_STARTED,
                threadId: input.threadId,
                runId: "admin", // todo: load jwt
            } as any);

            const runOpts: AgentInvokeOptions = {
                input: userMessage?.content || '',
                agentId: this.#agent.id,
                stream: true,
                threadId: input.threadId,
                userId: "admin", // todo: load jwt
                waitOutput: true,
                persistentHistory: true,
                usingDefaultSystemMessage: true
            }

            agentManager.invoke(runOpts).then((result) => {
                observer.next({
                    type: EventType.RUN_FINISHED,
                    threadId: input.threadId,
                    runId: input.runId,
                } as any);

                observer.complete();
            }).catch(error => {
                observer.next({
                    type: EventType.RUN_ERROR,
                    message: error.message,
                } as any)

                observer.error(error)
            });

            subscribe({
                app: inngest,
                channel: `chat/${this.#agent.id}/${input.threadId}`,
                topics: ["messages"],
            }).then((stream) => {
                const readableStream: ReadableStream = stream.getEncodedStream();
                const reader = readableStream.getReader();
                const decoder = new TextDecoder();

                const readStream = async () => {
                    let buffer = "";
                    let end = false;
                    let messageId = Date.now();
                    let thinking = false;

                    while (!end) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const newText = decoder.decode(value, { stream: true });
                        buffer += newText;

                        const lines = buffer.split("\n");
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            if (!line.trim()) continue;

                            const event = JSON.parse(line);

                            // 处理result中的raw数据
                            if (event.data?.type === 'chunk') {
                                //console.log(event.data.message);
                                const message = event.data.message as TextMessage;
                                if (message.streamEnd) {

                                } else {
                                    let delta;
                                    if (message.reasoning_content) {
                                        delta = message.reasoning_content;
                                        if (!thinking) {
                                            delta = "<think>" + delta;
                                            thinking = true;
                                        }
                                    } else if (message.content) {
                                        delta = message.content;
                                        if (thinking) {
                                            delta = "</think>" + delta;
                                            thinking = false;
                                        }
                                    }

                                    observer.next({
                                        type: EventType.TEXT_MESSAGE_CHUNK,
                                        messageId: messageId,
                                        delta: delta,
                                        timestamp: Date.now()
                                    } as any)
                                }
                            } else if (event.data?.result) {
                                const result = event.data?.result as AgentResult;
                                if (result.toolCalls && result.toolCalls.length > 0) {
                                    for (const toolCall of result.toolCalls) {
                                        try {
                                            observer.next({
                                                type: EventType.TEXT_MESSAGE_CHUNK,
                                                parentMessageId: messageId,
                                                delta: '<tool_call>\n' +
                                                    JSON.stringify({
                                                        id: toolCall.tool.id,
                                                        name: toolCall.tool.name,
                                                        result: {
                                                            query: toolCall.tool.input,
                                                            status: "success",
                                                            results: [
                                                                toolCall.content
                                                            ]
                                                        }
                                                    })
                                                    + "\n</tool_call>",
                                                timestamp: Date.now()
                                            } as any)
                                        } catch (error) {
                                            console.error(error);
                                        }
                                    }
                                }

                                messageId = Date.now();
                            }

                            if (event.data?.isCompleted === true) {
                                end = true;
                            }
                        }
                    }
                };

                // 开始读取流
                readStream().catch(error => {
                    observer.next({
                        type: EventType.RUN_ERROR,
                        message: error.message,
                        timestamp: Date.now()
                    } as any)

                    observer.error(error)
                });
            }).catch(error => {
                observer.next({
                    type: EventType.RUN_ERROR,
                    message: error.message,
                    timestamp: Date.now()
                } as any)

                observer.error(error)
            });
        });
    }
}

export class AguiRuntime extends CopilotRuntime {

    /**
     * 重写 loadAgentState 方法以实现自定义逻辑。
     * @param graphqlContext 包含了请求的上下文信息。
     * @param threadId 线程ID。
     * @param agentName Agent 的唯一名称。
     * @returns 一个 Promise，返回 Agent 的状态。
     */
    public async loadAgentState(
        graphqlContext: GraphQLContext,
        threadId: string,
        agentName: string
    ): Promise<ThreadStateResponse> {
        console.log(`[AguiRuntime] 正在加载 Agent: ${agentName} 的状态，线程ID: ${threadId}`);

        try {
            // 从数据库加载线程状态和消息
            return await loadThreadState(threadId);
        } catch (error) {
            console.error(`[AguiRuntime] 加载线程状态失败:`, error);

            // 返回空状态作为fallback
            return {
                threadId,
                threadExists: false,
                state: "{}",
                messages: "[]"
            };
        }
    }

    /**
     * 获取线程的消息历史（辅助方法）
     * @param threadId 线程ID
     * @returns 消息列表
     */
    public async getThreadMessages(threadId: string) {
        try {
            const threadState = await loadThreadState(threadId);
            return threadState.messages;
        } catch (error) {
            console.error(`[AguiRuntime] 获取线程消息失败:`, error);
            return [];
        }
    }

    /**
     * 检查线程是否存在（辅助方法）
     * @param threadId 线程ID
     * @returns 是否存在
     */
    public async checkThreadExists(threadId: string): Promise<boolean> {
        try {
            const threadState = await loadThreadState(threadId);
            return threadState.threadExists;
        } catch (error) {
            console.error(`[AguiRuntime] 检查线程存在性失败:`, error);
            return false;
        }
    }
}