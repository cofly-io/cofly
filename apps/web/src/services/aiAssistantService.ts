import { ConnectConfigService } from './connectConfigService';
import { SystemModelSettingService } from './systemModelSettingService';

/**
 * AI助手服务配置接口
 */
export interface AIAssistantConfig {
    apiKey: string;
    model: string;
    baseUrl:String;
    series:string;
    isAppend: boolean;
}

/**
 * AI助手请求参数接口
 */
export interface AIAssistantRequest {
    prompt: string;
    content: string;
    tabkey?: string;
    connectId?: string;
    threadId?: string;
    userId?: string;
    input?: string;
}

/**
 * AI助手响应接口
 */
export interface AIAssistantResponse {
    success: boolean;
    content?: string;
    error?: string;
    isAppend?: boolean;
}

/**
 * Agent运行请求接口
 */
export interface AgentRunRequest {
    input: string;
    threadId: string;
    userId: string;
    waitOutput?: boolean;
    config: {
        id: string;
        name: string;
        description?: string;
        systemMessage?: string;
        chatModel: {
            series: string;
            model: string;
            apiKey: string;
            baseUrl: string;
            toolMode: string;
        };
    };
}

/**
 * AI助手服务类
 */
export class AIAssistantService {
    /**
     * 调用Agent运行接口
     * @param input 输入内容
     * @param tabkey 配置键
     * @param threadId 线程ID
     * @param userId 用户ID
     * @returns Agent运行结果
     */
    static async runAgent(input: string, tabkey: string = 'builtin-model', threadId?: string, userId?: string): Promise<any> {
        try {
            // 构建请求参数，按照测试成功的结构
             const agentRunRequest = {
                tabkey: tabkey,
                config: {
                     id: `agent-${Date.now()}`,
                     name: 'AI Assistant Agent',
                     chatModel: {
                         toolMode: 'prompt',
                         stream: false
                     }
                 },
                 agentInvokeOpts: {
                     input: input,
                     threadId: threadId || `thread-${Date.now()}`,
                     userId: userId || 'anonymous',
                     waitOutput: true
                 },
                //  step: 1
             };

            // 调用 /api/agent-run 接口
            const response = await fetch('/api/agent-run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agentRunRequest),
            });

            if (!response.ok) {
                throw new Error(`Agent run failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error running agent:', error);
            throw error;
        }
    }
    

    // /**
    //  * 根据tabkey获取连接配置
    //  * @param tabkey 配置键
    //  * @returns 连接配置
    //  */
    // static async getConnectCofig(tabkey: string): Promise<AIAssistantConfig | null> {
    //     try {
    //         // 调用SystemModelSettingService获取系统模型设置
    //         const systemModelSettingResponse = await SystemModelSettingService.getSystemModelSetting(tabkey);
            
    //         if (systemModelSettingResponse.success && systemModelSettingResponse.data) {
    //             const systemModelSetting = systemModelSettingResponse.data;
                
    //             // 获取连接配置数据
    //             const connectConfigData = await ConnectConfigService.getConnectConfig(systemModelSetting.tabDetails?.connectid);
    //             if (connectConfigData.success && connectConfigData.data) {
    //                 return {
    //                     apiKey: connectConfigData.data.config?.apiKey,
    //                     baseUrl: connectConfigData.data.config?.baseUrl,
    //                     model: systemModelSetting.tabDetails?.model,
    //                     isAppend: systemModelSetting.tabDetails?.isAppend,
    //                     series: connectConfigData.data.config?.series || 'openai',
    //                 };
    //             }
    //         }
    //     } catch (error) {
    //         console.error('获取系统模型设置失败:', error);
    //     }
    //     return null;
    // }
}