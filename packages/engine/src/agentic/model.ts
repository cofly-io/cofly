import { type AiAdapter } from "@inngest/ai";
import { adapters } from "./adapters";
import { type Message, TextMessage } from "./types";
import { type Tool } from "./tool";
import { getStepTools } from "./util";

export type onStream = (message: TextMessage) => Promise<void>;

export const createAgenticModelFromAiAdapter = <
  TAiAdapter extends AiAdapter.Any,
>(
  adapter: TAiAdapter
): AgenticModel<TAiAdapter> => {
  const opts = adapters[adapter.format as AiAdapter.Format];

  return new AgenticModel({
    model: adapter,
    requestParser:
      opts.request as unknown as AgenticModel.RequestParser<TAiAdapter>,
    responseParser:
      opts.response as unknown as AgenticModel.ResponseParser<TAiAdapter>,
  });
};

export class AgenticModel<TAiAdapter extends AiAdapter.Any> {
  #model: TAiAdapter;
  requestParser: AgenticModel.RequestParser<TAiAdapter>;
  responseParser: AgenticModel.ResponseParser<TAiAdapter>;

  constructor({
    model,
    requestParser,
    responseParser,
  }: AgenticModel.Constructor<TAiAdapter>) {
    this.#model = model;
    this.requestParser = requestParser;
    this.responseParser = responseParser;
  }

  async infer(
    stepID: string,
    input: Message[],
    tools: Tool.Any[],
    tool_choice: Tool.Choice,
    onStream: onStream
  ): Promise<AgenticModel.InferenceResponse> {
    const body = this.requestParser(this.#model, input, tools, tool_choice);
    let result: AiAdapter.Input<TAiAdapter>;

    const step = await getStepTools();
    if (!step) {
      throw new Error("can not find a step");
    }

    // Allow the model to mutate options and body for this call
    const modelCopy = {...this.#model};
    this.#model.onCall?.(modelCopy, body);

    const url = new URL(modelCopy.url || "");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Make sure we handle every known format in `@inngest/ai`.
    const formatHandlers: Record<AiAdapter.Format, () => void> = {
      "openai-chat": () => {
        headers["Authorization"] = `Bearer ${modelCopy.authKey}`;
      },
      "azure-openai": () => {
      },
      anthropic: () => {
        headers["x-api-key"] = modelCopy.authKey;
        headers["anthropic-version"] = "2023-06-01";
      },
      gemini: () => {
      },
      grok: () => {
      },
    };

    formatHandlers[modelCopy.format as AiAdapter.Format]();

    return (await step.run(stepID, async () => {

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      if (modelCopy.options?.defaultParameters?.stream && onStream) {

        console.debug("start stream request");

        const controller = new AbortController();
        const signal = controller.signal;
        let fullResponse = '';
        let fullReasonResponse = '';
        result = {};
        let toolCalls = [];

        try {
          // 发送流式请求
          const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
            signal // 绑定中断信号
          });

          if (!response.ok || !response.body) {
            console.error(`请求失败: ${response.status} ${response.statusText}`);
          } else {
            // 获取可读流
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            // 循环读取流数据
            while (true) {
              const {value, done} = await reader.read();
              if (done) break;

              // 解码数据块并追加到缓冲区
              buffer += decoder.decode(value, {stream: true});

              // 处理完整的事件（SSE 格式）
              while (buffer.includes('\n\n')) {
                const eventEndIndex = buffer.indexOf('\n\n');
                const eventData = buffer.substring(0, eventEndIndex);
                buffer = buffer.substring(eventEndIndex + 2);

                // 解析 SSE 事件数据
                if (eventData.startsWith('data: ')) {
                  const jsonStr = eventData.substring(6).trim();

                  // 检查流结束标记
                  if (jsonStr === '[DONE]') {
                    break;
                  }

                  try {
                    result = JSON.parse(jsonStr);
                    const content = result.choices[0]?.delta?.content || '';
                    const reasoning_content = result.choices[0]?.delta?.reasoning_content || '';
                    if(result.choices[0].delta?.tool_calls && result.choices[0].delta?.tool_calls.length > 0) {
                      if (toolCalls.length === 0) {
                        toolCalls.push(...result.choices[0].delta.tool_calls);
                        toolCalls[0].function.arguments = '';
                      }
                      const args = result.choices[0]?.delta?.tool_calls[0].function.arguments || '';
                      if (args) {
                        toolCalls[0].function.arguments += args;
                      }
                    }

                    if (content || reasoning_content) {
                      fullResponse += content;
                      fullReasonResponse += reasoning_content;
                      await onStream({
                        type: "text",
                        role: "assistant",
                        content: content,
                        reasoning_content: reasoning_content,
                      } as TextMessage);
                    }
                  } catch (error) {
                    console.error(error);
                  }
                }
              }
            }

            if(result.choices[0].finish_reason == "tool_calls") {
              result.choices[0].message = {
                role: "assistant",
                content: fullResponse,
                reasoning_content: fullReasonResponse,
                tool_calls: toolCalls,
              }
            } else {
              result.choices[0].message = {
                role: "assistant",
                content: fullResponse,
                reasoning_content: fullReasonResponse
              }
            }

            await onStream({
              type: "text",
              role: "assistant",
              streamEnd: true
            } as TextMessage);
          }
        } catch (error) {
          console.error(error);
          throw error;
        } finally {
          // 确保中断控制器
          controller.abort();
        }
      } else {
        result = await (
            await fetch(url, {
              method: "POST",
              headers,
              body: JSON.stringify(body),
            })
        ).json();
      }

      if (!result) {
        throw new Error("AI request error.")
      }

      return {output: this.responseParser(result), raw: result};
    })) as unknown as AgenticModel.InferenceResponse;
  }
}

export namespace AgenticModel {
  export type Any = AgenticModel<AiAdapter.Any>;

  /**
   * InferenceResponse is the response from a model for an inference request.
   * This contains parsed messages and the raw result, with the type of the raw
   * result depending on the model's API repsonse.
   */
  export type InferenceResponse<T = unknown> = {
    output: Message[];
    raw: T;
  };

  export interface Constructor<TAiAdapter extends AiAdapter.Any> {
    model: TAiAdapter;
    requestParser: RequestParser<TAiAdapter>;
    responseParser: ResponseParser<TAiAdapter>;
  }

  export type RequestParser<TAiAdapter extends AiAdapter.Any> = (
      model: TAiAdapter,
      state: Message[],
      tools: Tool.Any[],
      tool_choice: Tool.Choice
  ) => AiAdapter.Input<TAiAdapter>;

  export type ResponseParser<TAiAdapter extends AiAdapter.Any> = (
      output: AiAdapter.Output<TAiAdapter>
  ) => Message[];
}
