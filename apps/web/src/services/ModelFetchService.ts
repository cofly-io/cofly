import { ModelInfo } from '@repo/common';

/**
 * 模型获取服务
 * 负责从不同的LLM提供商API动态获取模型列表
 */
export class ModelFetchService {
  /**
   * 根据连接配置获取模型列表
   * @param connectConfig 连接配置对象
   * @returns 模型信息数组
   */
  // static async getModels(connectConfig: any): Promise<ModelInfo[]> {
  //   const { modelUrl, apiKey } = connectConfig;
    
  //   if (!modelUrl) {
  //     console.log('[ModelFetchService] No modelUrl provided, returning empty array');
  //     return [];
  //   }
    
  //   console.log('[ModelFetchService] Starting to fetch models from API:', modelUrl);
    
  //   try {
  //     // 转换URL为API端点
  //     const apiUrl = this.convertToApiUrl(modelUrl);
  //     console.log('[ModelFetchService] Converted API URL:', apiUrl);
      
  //     // 调用API获取数据
  //     const data = await this.fetchFromApi(apiUrl, apiKey);
      
  //     // 解析响应数据
  //     const models = this.parseModelResponse(data, modelUrl);
  //     console.log('[ModelFetchService] Successfully parsed models count:', models.length);
      
  //     return models;
  //   } catch (error) {
  //     console.error('[ModelFetchService] Error fetching models:', error);
  //     return [];
  //   }
  // }
  
  /**
   * 将网页链接转换为API端点
   * @param url 原始URL
   * @returns API端点URL
   */
  // private static convertToApiUrl(url: string): string {
  //   // 硅基流动网页链接转换
  //   if (url.includes('cloud.siliconflow.cn/models')) {
  //     return 'https://api.siliconflow.cn/v1/models';
  //   }
    
  //   // OpenAI格式的API地址
  //   if (url.includes('/v1/models')) {
  //     return url;
  //   }
    
  //   // 其他提供商的转换规则可以在这里添加
  //   // 例如：
  //   if (url.includes('other-provider.com')) {
  //     return 'https://api.other-provider.com/v1/models';
  //   }
    
  //   // 默认返回原URL
  //   return url;
  // }
  
  /**
   * 从API获取数据
   * @param url API地址
   * @param apiKey API密钥（可选）
   * @returns API响应数据
   */
  // private static async fetchFromApi(url: string, apiKey?: string): Promise<any> {
  //   const headers: Record<string, string> = {
  //     'Content-Type': 'application/json'
  //   };
    
  //   // 添加认证头
  //   if (apiKey) {
  //     headers['Authorization'] = `Bearer ${apiKey}`;
  //     console.log('[ModelFetchService] Adding Authorization header');
  //   }
    
  //   const response = await fetch(url, { headers });
    
  //   if (!response.ok) {
  //     throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  //   }
    
  //   return await response.json();
  // }
  
  /**
   * 解析不同提供商的模型数据
   * @param data API响应数据
   * @param originalUrl 原始URL，用于推断格式
   * @returns 标准化的模型信息数组
   */
  // private static parseModelResponse(data: any, originalUrl: string): ModelInfo[] {
  //   console.log('[ModelFetchService] Parsing model response, data type:', typeof data);
    
  //   // 硅基流动 API 格式：{ "object": "list", "data": [...] }
  //   if (data.object === "list" && Array.isArray(data.data)) {
  //     console.log('[ModelFetchService] Detected SiliconFlow API format');
  //     return data.data
  //       .filter((model: any) => model.id && model.id.includes('/')) // 过滤有效的模型ID
  //       .map((model: any) => ({
  //         id: model.id,
  //         name: model.id.split('/').pop() || model.id,
  //         group: this.getModelGroup(model.id),
  //         description: `${this.getModelGroup(model.id)} 模型 - ${model.id}`,
  //         tags: this.getModelTags(model.id)
  //       }));
  //   }
    
  //   // OpenAI 格式：{ "data": [...] }
  //   if (data.data && Array.isArray(data.data)) {
  //     console.log('[ModelFetchService] Detected OpenAI format');
  //     return data.data.map((model: any) => ({
  //       id: model.id,
  //       name: model.id,
  //       group: this.getModelGroup(model.id),
  //       description: model.description || `${this.getModelGroup(model.id)} 模型`,
  //       tags: this.getModelTags(model.id)
  //     }));
  //   }
    
  //   // 直接的数组格式
  //   if (Array.isArray(data)) {
  //     console.log('[ModelFetchService] Detected array format');
  //     return data.map((model: any) => {
  //       const modelId = typeof model === 'string' ? model : model.id;
  //       return {
  //         id: modelId,
  //         name: modelId.split('/').pop() || modelId,
  //         group: this.getModelGroup(modelId),
  //         description: `${this.getModelGroup(modelId)} 模型`,
  //         tags: this.getModelTags(modelId)
  //       };
  //     });
  //   }
    
  //   console.log('[ModelFetchService] Unknown format, returning empty array');
  //   return [];
  // }
  
  /**
   * 根据模型ID推断分组
   * @param modelId 模型ID
   * @returns 模型分组名称
   */
  // private static getModelGroup(modelId: string): string {
  //   const id = modelId.toLowerCase();
    
  //   // 主流大模型分组
  //   if (id.includes('qwen')) return 'Qwen';
  //   if (id.includes('deepseek')) return 'DeepSeek';
  //   if (id.includes('glm') || id.includes('chatglm')) return 'GLM';
  //   if (id.includes('internlm')) return 'InternLM';
  //   if (id.includes('yi-')) return 'Yi';
  //   if (id.includes('baichuan')) return 'Baichuan';
  //   if (id.includes('llama')) return 'Llama';
  //   if (id.includes('mistral')) return 'Mistral';
  //   if (id.includes('gemma')) return 'Gemma';
  //   if (id.includes('phi')) return 'Phi';
    
  //   // 图像生成模型
  //   if (id.includes('stable-diffusion') || id.includes('sd')) return 'Stable Diffusion';
  //   if (id.includes('flux')) return 'FLUX';
  //   if (id.includes('kolors')) return 'Kolors';
    
  //   // 语音模型
  //   if (id.includes('cosyvoice')) return 'CosyVoice';
  //   if (id.includes('sensevoice')) return 'SenseVoice';
  //   if (id.includes('fish-speech')) return 'Fish Speech';
    
  //   // 视频模型
  //   if (id.includes('hunyuan') && id.includes('video')) return 'HunyuanVideo';
  //   if (id.includes('ltx-video')) return 'LTX-Video';
    
  //   // 嵌入和重排序模型
  //   if (id.includes('bge') || id.includes('embedding')) return 'BGE';
  //   if (id.includes('bce')) return 'BCE';
    
  //   // 通用模型
  //   if (id.includes('gpt')) return 'OpenAI';
  //   if (id.includes('claude')) return 'Anthropic';
  //   if (id.includes('gemini')) return 'Gemini';
    
  //   return 'Other';
  // }
  
  /**
   * 根据模型ID推断标签
   * @param modelId 模型ID
   * @returns 模型标签数组
   */
  // private static getModelTags(modelId: string): string[] {
  //   const id = modelId.toLowerCase();
  //   const tags: string[] = [];
    
  //   // 基础功能标签
  //   if (id.includes('chat') || id.includes('instruct')) {
  //     tags.push('推理');
  //   }
    
  //   if (id.includes('vision') || id.includes('vl') || id.includes('视觉')) {
  //     tags.push('视觉');
  //   }
    
  //   if (id.includes('coder') || id.includes('code')) {
  //     tags.push('代码');
  //   }
    
  //   if (id.includes('math')) {
  //     tags.push('数学');
  //   }
    
  //   if (id.includes('embedding')) {
  //     tags.push('嵌入');
  //   }
    
  //   if (id.includes('rerank')) {
  //     tags.push('重排');
  //   }
    
  //   // 模态标签
  //   if (id.includes('tts') || id.includes('speech') || id.includes('voice') || id.includes('audio')) {
  //     tags.push('语音');
  //   }
    
  //   if (id.includes('diffusion') || id.includes('flux') || id.includes('kolors') || id.includes('image')) {
  //     tags.push('图像');
  //   }
    
  //   if (id.includes('video')) {
  //     tags.push('视频');
  //   }
    
  //   // 特殊标签
  //   if (id.includes('free') || id.includes('免费') || 
  //       id.includes('qwen2.5-7b') || id.includes('glm-4-9b')) {
  //     tags.push('免费');
  //   }
    
  //   if (id.includes('pro') || id.includes('turbo') || id.includes('plus')) {
  //     tags.push('高级');
  //   }
    
  //   // 如果没有任何标签，添加默认标签
  //   if (tags.length === 0) {
  //     tags.push('推理');
  //   }
    
  //   return tags;
  // }
}