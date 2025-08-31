import { type HistoryConfig, type History, type StateData, AgentResult, type TextMessage } from "./agentic";
import { agenticThreadManager, AgenticThreadMessageData } from "@repo/common";

export class AgentThreadAdapter<T extends StateData>
    implements HistoryConfig<T> {

    /**
     * Create a new conversation thread.
     */
    createThread = async (
        {state, step}: History.CreateThreadContext<T>
    ): Promise<{ threadId: string }> => {

        const operation = async () => {
            const result = agenticThreadManager.mediator?.createThread({
                agentId: state.data.agentId,
                userId: state.data.userId || null,
                metadata: JSON.stringify(state.data)
            });
            return result;
        };

        const threadId = step
            ? await step.run("create-thread", operation)
            : await operation();

        if(!threadId) {
            throw new Error("❌ Create new thread failed.");
        }

        console.log(`🆕 Created new thread: ${threadId}`);
        return { threadId };
    };

    /**
     * Load conversation history from storage.
     *
     * Returns complete conversation context including both user messages and agent results.
     * User messages are converted to fake AgentResults (agentName: "user") to maintain
     * consistency with the client-side pattern and preserve conversation continuity.
     */
    get = async ({threadId, step}: History.Context<T>): Promise<AgentResult[]> => {
        if (!threadId) {
            return [];
        }

        const operation = async () => {
            // Load complete conversation history (both user messages and agent results)
            const result = await agenticThreadManager.mediator?.listMessages({
                threadId,
                limit: 5,
            });

            if(!result) {
                return [];
            }

            const conversationResults: AgentResult[] = [];

            for (const row of result) {
                if (row.messageType === 'user') {
                    // Convert user message to fake AgentResult (matching UI pattern)
                    const userMessage: TextMessage = {
                        type: "text",
                        role: "user",
                        content: row.content ?? "",
                        stop_reason: "stop"
                    };

                    const fakeUserResult = new AgentResult(
                        "user", // agentName: "user" (matches UI pattern)
                        [userMessage], // output contains the user message
                        [], // no tool calls for user messages
                        new Date(row.createdAt || Date.now())
                    );

                    conversationResults.push(fakeUserResult);
                } else if (row.messageType === 'agent') {
                    // Deserialize real AgentResult objects from JSONB
                    const data = JSON.parse(row.data ?? "{}");
                    if(data.output?.length > 0 && data.output[0].type === "text") {
                        const realAgentResult = new AgentResult(
                            data.agentName,
                            data.output,
                            data.toolCalls,
                            new Date(data.createdAt)
                        );

                        conversationResults.push(realAgentResult);
                    }
                }
            }

            return conversationResults.reverse();
        };

        const results = step
            ? ((await step.run(
                "load-complete-history",
                operation
            )) as unknown as AgentResult[])
            : await operation();

        return results;
    };

    /**
     * Save new conversation results to storage.
     */
    appendResults = async ({
                               threadId,
                               newResults,
                               userMessage,
                               step,
                               state,
                           }: History.Context<T> & {
        newResults: AgentResult[];
        userMessage?: {
            content: string;
            role: "user";
            timestamp: Date;
        };
    }): Promise<void> => {
        if (!threadId) {
            return;
        }

        if (!newResults?.length && !userMessage) {
            return;
        }

        try {
            const operation = async () => {

                const thread = await agenticThreadManager.mediator?.getThread(threadId);
                if(!thread) {
                    const savedId = await agenticThreadManager.mediator?.createThread({
                        id: threadId,
                        agentId: state.data.agentId,
                        userId: state.data.userId,
                        metadata: JSON.stringify({userId: state.data.userId})
                    });

                    if(threadId !== savedId) {
                        throw new Error("save message failed")
                    }
                }

                const messages : AgenticThreadMessageData[] = [];

                if (userMessage) {
                    const userChecksum = `user_${userMessage.timestamp.getTime()}_${userMessage.content.substring(
                        0,
                        50
                    )}`;

                    messages.push({
                        threadId: threadId,
                        messageType: "user",
                        content: userMessage.content,
                        checksum: userChecksum,
                        createdAt: userMessage.timestamp
                    });
                }

                if (newResults?.length > 0) {
                    for (const result of newResults) {
                        const exportedData = result.export();

                        messages.push({
                            threadId: threadId,
                            messageType: "agent",
                            agentName: result.agentName,
                            data: JSON.stringify(exportedData),
                            raw: result.raw,
                            checksum: result.checksum
                        });
                    }
                }

                await agenticThreadManager.mediator?.appendMessages({ threadId, messages });

                const totalSaved = (userMessage ? 1 : 0) + (newResults?.length || 0);
                console.log(
                    `💾 Saved ${totalSaved} messages to thread ${threadId} (${
                        userMessage ? "1 user + " : ""
                    }${newResults?.length || 0} agent)`
                );
            };

            step ? await step.run("save-results", operation) : await operation();
        } catch (error) {
            console.error("❌ appendResults failed:", error);
            throw error;
        }
    };
}