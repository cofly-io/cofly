// /**
//  * @deprecated 此文件已弃用，请使用 apps/web/src/hooks/useChatStream.ts
//  * 
//  * 架构重构说明：
//  * 1. UI 层不应该直接引用 @repo/engine
//  * 2. API 调用逻辑应该放在 web 应用层的 services 中
//  * 3. 聊天流逻辑已迁移到：
//  *    - apps/web/src/services/chatStreamService.ts (服务层)
//  *    - apps/web/src/hooks/useChatStream.ts (Hook层)
//  * 
//  * 迁移步骤：
//  * 1. 将组件中的 import 改为：import { useChatStream } from '../hooks/useChatStream'
//  * 2. 接口保持兼容，无需修改组件代码
//  */

// import { Message, TextMessage, AgentResult } from "@repo/engine"
// import { useState, useRef, useEffect } from "react";

// export interface ChatMessage {
//   id: string;
//   sender: string;
//   content: string;
//   timestamp: string;
//   avatar: string;
//   role?: 'user' | 'assistant';
// }

// export interface UseChatStreamOptions {
//   endpoint?: string;
//   userId?: string;
//   agentId?: string | null;
//   agentName?: string;
//   agentAvatar?: string;
// }

// export interface UseChatStreamReturn {
//   // State
//   messages: ChatMessage[];
//   isLoading: boolean;
//   threadId: string | null;
//   agentId: string | null;
//   isLoadingThread: boolean;

//   // Actions
//   sendMessage: (content: string) => Promise<void>;
//   loadThread: (threadId: string) => Promise<void>;
//   setAgent: (agentId: string) => Promise<void>;
//   startNewChat: () => void;
// }

// export function useChatStream({
//   endpoint = "/api/agentic",
//   userId = "admin",
//   agentId: initialAgentId = null,
//   agentName = "智能体",
//   agentAvatar = "robot",
// }: UseChatStreamOptions = {}): UseChatStreamReturn {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [threadId, setThreadId] = useState<string | null>(null);
//   const [agentId, setAgentIdState] = useState<string | null>(initialAgentId);
//   const [isLoadingThread, setIsLoadingThread] = useState(false);
//   const currentStreamController = useRef<AbortController | null>(null);

//   // Cleanup function for the current stream
//   const cleanupCurrentStream = () => {
//     if (currentStreamController.current) {
//       currentStreamController.current.abort();
//       currentStreamController.current = null;
//     }
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       cleanupCurrentStream();
//     };
//   }, []);

//   const setAgent = async (selectedAgentId: string) => {
//     setAgentIdState(selectedAgentId);
//   };

//   // 生成随机线程ID
//   const generateThreadId = () => {
//     return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   };

//   // 格式化时间戳
//   const formatTimestamp = () => {
//     return new Date().toLocaleString();
//   };

//   // Load thread history from database
//   const loadThread = async (selectedThreadId: string) => {
//     try {
//       setIsLoadingThread(true);
//       const response = await fetch(`/api/agentic/threads/${selectedThreadId}/messages`);

//       if (!response.ok) {
//         throw new Error("Failed to load thread history");
//       }

//       const data = await response.json();

//       // Convert database messages to UI messages
//       const uiMessages: ChatMessage[] = [];

//       for (const item of data) {
//         if (item.messageType === "user") {
//           // User message
//           const userMessage: ChatMessage = {
//             id: item.id || Date.now().toString(),
//             sender: '我',
//             content: item.content,
//             timestamp: formatTimestamp(),
//             avatar: 'user', // 使用avatarIconMap中的有效key
//             role: 'user'
//           };
//           uiMessages.push(userMessage);
//         } else if (item.messageType === "agent" && item.data) {
//           // Agent message
//           try {
//             const agentData = JSON.parse(item.data);
//             let content = '';
            
//             if (agentData.raw) {
//               try {
//                 const rawData = JSON.parse(agentData.raw);
//                 console.log('🔍 loadThread解析raw数据:', rawData);
                
//                 // 处理新的数据结构：rawData.choices[0].message
//                 if (rawData.choices && rawData.choices[0] && rawData.choices[0].message) {
//                   const message = rawData.choices[0].message;
//                   console.log('💬 loadThread从raw中收到消息:', message);
                  
//                   // 组合content和reasoning_content
//                   if (message.content) {
//                     content += message.content;
//                   }
//                   if (message.reasoning_content) {
//                     if (content) content += '\n\n';
//                     content += '<think>' + message.reasoning_content + '</think>';
//                   }
//                 }
//                 // 兼容旧的数据结构：rawData.message
//                 else if (rawData.message) {
//                   const message = rawData.message;
                  
//                   // 组合content和reasoning_content
//                   if (message.content) {
//                     content += message.content;
//                   }
//                   if (message.reasoning_content) {
//                     if (content) content += '\n\n';
//                     content += '<think>' + message.reasoning_content + '</think>';
//                   }
//                 }
//               } catch (e) {
//                 console.error('Failed to parse agent raw data:', e);
//               }
//             }

//             if (content) {
//               const assistantMessage: ChatMessage = {
//                 id: item.id || (Date.now() + 1).toString(),
//                 sender: agentName,
//                 content: content,
//                 timestamp: formatTimestamp(),
//                 avatar: agentAvatar || 'robot', // 使用传入的avatar或默认为robot
//                 role: 'assistant'
//               };
//               uiMessages.push(assistantMessage);
//             }
//           } catch (e) {
//             console.error('Failed to parse agent data:', e);
//           }
//         }
//       }

//       // Update state with loaded conversation
//       setMessages(uiMessages);
//       setThreadId(selectedThreadId);

//       console.log(
//         `📚 Loaded thread ${selectedThreadId} with ${uiMessages.length} UI messages`
//       );
//     } catch (error) {
//       console.error("Failed to load thread history:", error);
//       throw error; // Re-throw so caller can handle if needed
//     } finally {
//       setIsLoadingThread(false);
//     }
//   };

//   // Send a message and handle response
//   const sendMessage = async (content: string) => {
//       console.log('🚀 useChatStream.sendMessage 开始');
//       console.log('📝 参数:', { content: content.substring(0, 100) + '...', agentId, isLoading });
      
//       if (!content.trim() || isLoading || !agentId) {
//         console.warn('❌ 发送消息条件不满足:', { hasContent: !!content.trim(), isLoading, hasAgentId: !!agentId });
//         return;
//       }

//       cleanupCurrentStream();
//       currentStreamController.current = new AbortController();

//       // Create user message
//       const userMessage: ChatMessage = {
//           id: Date.now().toString(),
//           sender: '我',
//           content,
//           timestamp: formatTimestamp(),
//           avatar: 'user', // 使用avatarIconMap中的有效key
//           role: 'user'
//       };
      
//       console.log('👤 创建用户消息:', userMessage);

//       // Add user message to UI immediately
//       setMessages(prev => [...prev, userMessage]);
//       setIsLoading(true);
      
//       console.log('🔄 设置loading状态为true');

//       // Generate thread ID if not exists
//       const currentThreadId = threadId || generateThreadId();
//       if (!threadId) {
//           console.log('🆔 生成新的线程ID:', currentThreadId);
//           setThreadId(currentThreadId);
//       } else {
//           console.log('🆔 使用现有线程ID:', currentThreadId);
//       }

//       try {
//           const requestData = {
//               agentId: agentId,
//               input: content,
//               threadId: currentThreadId,
//               userId: userId,
//               waitOutput: false, // Wait for output to complete
//               stream: true,
//               // extSystemMessage: `Based on the content of the question,
//               //                    you need to determine that if your answer is plain text,
//               //                    if your answer is plain text, you should ignore this prompt. 
//               //                    However, if the content of your answer needs to be presented in markdown, 
//               //                    such as html, shell, javascript, java, etc., 
//               //                    then the content you return should be in markdown format`
//           };
          
//           console.log('📤 准备发送API请求:', { endpoint, requestData });

//           try {
//               let assistantMessage: ChatMessage = {
//                   id: (Date.now() + Math.random()).toString(),
//                   sender: agentName,
//                   content: "Thinking...",
//                   timestamp: formatTimestamp(),
//                   avatar: agentAvatar || 'robot',
//                   role: "assistant"
//               };
//               let renew = true;

//               console.log('🌐 发送fetch请求...');
//               const response = await fetch(endpoint, {
//                   method: "POST",
//                   headers: {
//                       "Content-Type": "application/json",
//                   },
//                   body: JSON.stringify(requestData),
//                   signal: currentStreamController.current.signal,
//               });
              
//               console.log('📡 收到响应:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 ok: response.ok,
//                 headers: Object.fromEntries(response.headers.entries())
//               });

//               if (!response.ok) {
//                   console.error('❌ API错误响应:', response.status, response.statusText);
//                   let errorMessage = "Failed to get response";
//                   try {
//                       const error = await response.json();
//                       console.error('❌ 错误详情:', error);
//                       errorMessage = error.error || errorMessage;
//                   } catch (e) {
//                       console.error('❌ 解析错误响应失败:', e);
//                       errorMessage = `HTTP ${response.status}: ${response.statusText}`;
//                   }
//                   throw new Error(errorMessage);
//               }

//               console.log('📖 开始读取流式响应...');
//               const reader = response.body?.getReader();
//               if (!reader) throw new Error("No reader available");

//               const decoder = new TextDecoder();
//               let buffer = "";
//               let eventCount = 0;
//               let fullContent = "";
//               let fullReasoning = "";

//               while (true) {
//                   const {done, value} = await reader.read();
//                   if (done) break;

//                   const newText = decoder.decode(value, {stream: true});
//                   buffer += newText;

//                   const lines = buffer.split("\n");
//                   buffer = lines.pop() || "";

//                   for (const line of lines) {
//                       if (!line.trim()) continue;
                      
//                       eventCount++;
//                       //console.log(`📋 处理事件 ${eventCount}:`, line.substring(0, 200) + (line.length > 200 ? '...' : ''));

//                       try {
//                           const event = JSON.parse(line);
//                           //console.log('✅ 解析事件成功:', event);

//                           let message;

//                           // 处理result中的raw数据
//                           if (event.data?.type === 'chunk') {
//                               //console.log(event.data.message);
//                               if(event.data.message.streamEnd) {
//                                   renew = true;
//                                   console.log(`${formatTimestamp()} renew`);
//                               } else {
//                                   fullContent += event.data.message.content;
//                                   fullReasoning += event.data.message.reasoning_content

//                                   message = event.data.message;
//                                   message.content = fullContent;
//                                   message.reasoning_content = fullReasoning;
//                               }
//                           } else if (event.data?.result) {
//                               const result = event.data?.result as AgentResult;
//                               if(result.toolCalls && result.toolCalls.length > 0) {
//                                   message = {
//                                       toolCalls: result.toolCalls
//                                   }
//                               }
//                           }

//                           if(message) {
//                               if(renew) {
//                                   assistantMessage = {
//                                       id: (Date.now() + Math.random()).toString(),
//                                       sender: agentName,
//                                       content: "Thinking...",
//                                       timestamp: formatTimestamp(),
//                                       avatar: agentAvatar || 'robot',
//                                       role: "assistant"
//                                   };

//                                   fullContent = "";
//                                   fullReasoning = "";
//                                   setMessages((prev) => [...prev, assistantMessage]);
//                                   console.log(`${formatTimestamp()} new message`);
//                                   renew = false;
//                               }

//                               try {
//                                   //console.log('💬 从raw中收到消息:', message);

//                                   let content = '';

//                                   // 组合content和reasoning_content
//                                   if (message.content) {
//                                       content += message.content;
//                                   }
//                                   if (message.reasoning_content) {
//                                       if (content) content += '\n\n';
//                                       content += '<think>' + message.reasoning_content + '</think>';
//                                   }
//                                   if(message.toolCalls) {
//                                       for (let call of message.toolCalls) {
//                                           if(content) content += '\n\n';
//                                           content += '### 调用：' + call.tool.name;
//                                           console.log(call);
//                                           if(call.content.data) {
//                                               content += '\n\n';
//                                               content += "```\n"
//                                               content += JSON.stringify(call.content.data);
//                                           }
//                                       }
//                                       renew = true;
//                                   }

//                                   if (content) {
//                                       assistantMessage.content = content;
//                                       //console.log('📝 添加AI消息到界面:', assistantMessage);
//                                       setMessages((prev) => [...prev.slice(0, prev.length - 1), assistantMessage]);
//                                   }
//                               } catch (e) {
//                                   console.error('❌ 解析result.raw失败:', e);
//                               }
//                           }

//                           if (event.data?.isCompleted === true) {
//                               console.log('✅ 对话完成');
//                               setIsLoading(false);
//                               cleanupCurrentStream();
//                           }
//                       } catch (e) {
//                           console.error("❌ 解析事件失败:", e, "原始数据:", line);
//                       }
//                   }
//               }
//           } catch (error: unknown) {
//               if (
//                   error &&
//                   typeof error === "object" &&
//                   "name" in error &&
//                   error.name === "AbortError"
//               ) {
//                   console.log('⏹️ 请求被取消');
//                   return;
//               }

//               console.error("❌ sendMessage发生错误:", error);
//               console.error("🔍 错误详情:", {
//                 name: error instanceof Error ? error.name : 'Unknown',
//                 message: error instanceof Error ? error.message : String(error),
//                 stack: error instanceof Error ? error.stack : undefined
//               });
              
//               setIsLoading(false);
//               const fallbackMessage = {
//                   id: (Date.now() + 1).toString(),
//                   sender: agentName,
//                   content: '抱歉，处理您的消息时出现了错误，请重试。',
//                   timestamp: formatTimestamp(),
//                   avatar: agentAvatar || 'robot',
//                   role: 'assistant'
//               } as ChatMessage;
              
//               console.log('⚠️ 添加错误回退消息:', fallbackMessage);
//               setMessages((prev) => [...prev, fallbackMessage]);
//               throw error; // Re-throw so caller can handle if needed
//           }

//           setIsLoading(false);
//           cleanupCurrentStream();

//       } catch (error: unknown) {
//           if (
//               error &&
//               typeof error === "object" &&
//               "name" in error &&
//               error.name === "AbortError"
//           ) {
//               return;
//           }

//           console.error("Error:", error);
//           setIsLoading(false);
//           setMessages((prev) => [
//               ...prev,
//               {
//                   id: (Date.now() + 2).toString(),
//                   sender: agentName,
//                   content: "抱歉，处理您的请求时发生错误。",
//                   timestamp: formatTimestamp(),
//                   avatar: agentAvatar || 'robot', // 使用传入的avatar或默认为robot
//                   role: 'assistant'
//               },
//           ]);
//           throw error; // Re-throw so caller can handle if needed
//       }
//   };

//   // Start a new chat session
//   const startNewChat = () => {
//     cleanupCurrentStream();
//     setMessages([]);
//     setThreadId(null);
//   };

//   return {
//     // State
//     messages,
//     isLoading,
//     threadId,
//     agentId,
//     isLoadingThread,

//     // Actions
//     sendMessage,
//     loadThread,
//     setAgent,
//     startNewChat,
//   };
// }