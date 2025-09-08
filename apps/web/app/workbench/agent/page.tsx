"use client";

import React, { useState, useEffect } from 'react';
import { AgentPage } from '@repo/ui/main/agent';
import { SiApachedolphinscheduler } from "react-icons/si";
import { useToast, ToastManager } from '@repo/ui/';

import { mcpConfigService } from '@/services/mcpConfigService';
import { ConnectService } from '@/services/connectService';
import { ConnectConfigService } from '@/services/connectConfigService';
import { AgentConfig, McpConfig, AiRagConfig } from '@repo/common';
import { getAllWorkflowConfigs, WorkflowConfigData } from '@/services/workflowConfigService';
import { useChatStream } from '@/hooks/useChatStream';

// 导入 AgentService 的类型和服务
import { AgentService } from '@/services/agentService';
import { AgentData } from '@repo/common';

// 导入 AiRagService
import { AiRagService } from '@/services/aiRagService';

// 类型转换函数：将 AgentData 转换为 AgentConfig
const convertAgentDataToConfig = (agentData: AgentData): AgentConfig => {
  return {
    id: agentData.id || '',
    name: agentData.name,
    description: agentData.description,
    prompt: agentData.prompt || undefined,
    avatar: agentData.avatar || undefined,
    connectid: agentData.connectid || '',
    modelId: agentData.modelId,
    modelName: agentData.modelName || undefined,
    createdAt: new Date(), // 使用当前时间作为默认值
    updatedAt: new Date(), // 使用当前时间作为默认值
    createUser: agentData.createUser || '',
    mcpTools: agentData.mcpTools,
    workflows: agentData.workflows,
    connectConfig: agentData.connectConfig ? {
      id: agentData.connectConfig.id,
      name: agentData.connectConfig.name,
      ctype: agentData.connectConfig.ctype,
      mtype: agentData.connectConfig.mtype || ''
    } : undefined,
    // 从 mcpTools 中提取 mcpIds
    mcpIds: agentData.mcpTools ? agentData.mcpTools.map((tool: any) => tool.id) : [],
    // 从 workflowIds 字段或 workflows 中提取 workflowIds
    workflowIds: agentData.workflowIds || (agentData.workflows ? agentData.workflows.map((workflow: any) => workflow.id) : []),
    // 从 connectIds 中提取连接配置 ID
    connectIds: agentData.connectIds || [],
    // 添加 agentInfo 字段
    agentInfo: agentData.agentInfo
  };
};

export default function AgentPageContainer() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [mcpConfigs, setMcpConfigs] = useState<McpConfig[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<AiRagConfig[]>([]);
  const [workflowConfigs, setWorkflowConfigs] = useState<WorkflowConfigData[]>([]);
  const toastHook = useToast();
  const { toasts, removeToast } = toastHook;

  // 使用 useChatStream hook 获取流式聊天相关数据
  const {
    messages: streamMessages,
    isLoading: streamIsLoading,
    threadId,
    isLoadingThread,
    sendMessage: onStreamSendMessage,
    loadThread: onLoadThread,
    setAgent: onSetAgent,
    startNewChat: onStartNewChat,
  } = useChatStream({
    endpoint: "/api/agentic",
    userId: "admin",
    agentId: null, // 初始为null，会在选择agent时动态设置
    agentName: "智能体",
    agentAvatar: "🤖",
  });

  // 获取智能体数据
  const handleFetchAgents = async (): Promise<AgentConfig[]> => {
    try {
      const result = await AgentService.getAgents();

      if (result.success) {
        const agentsData: AgentData[] = result.data || [];
        const agentConfigs = agentsData.map(convertAgentDataToConfig);
        setAgents(agentConfigs);
        return agentConfigs;
      } else {
        setAgents([]);
        return [];
      }
    } catch (error) {
      console.error('获取智能体列表失败:', error);
      setAgents([]);
      return [];
    }
  };

  // 删除智能体
  const handleDeleteAgent = async (agentId: string): Promise<boolean> => {
    try {
      const result = await AgentService.deleteAgent(agentId);

      if (result.success) {
        // 重新获取智能体列表
        await handleFetchAgents();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('删除智能体失败:', error);
      return false;
    }
  };

  // 获取智能体详情（包含完整数据如prompt）
  const handleFetchAgentDetail = async (agentId: string): Promise<AgentConfig | null> => {
    try {
      const result = await AgentService.getAgent(agentId);

      if (result.success && result.data) {
        return convertAgentDataToConfig(result.data);
      } else {
        console.error('获取智能体详情失败:', result.error);
        return null;
      }
    } catch (error) {
      console.error('获取智能体详情异常:', error);
      return null;
    }
  };

  // 编辑智能体
  const handleEditAgent = (_agent: AgentConfig) => {
    // 这里可以添加编辑逻辑，比如打开编辑模态框等
  };

  // 打开智能体
  const handleOpenAgent = (agentId: string) => {
    const shareUrl = `${window.location.origin}/copilot?agent=${agentId}`;
    window.open(shareUrl, '_blank');
  };

  // 分享智能体 - 暂时注释掉，让AgentList使用本地模态窗
  // const handleShareAgent = (agentId: string) => {
  //   // 分享功能的具体实现
  //   console.log('分享智能体:', agentId);
  // };

  const handleMcpSave = async (data: any): Promise<boolean> => {
    try {
      const result = await mcpConfigService.saveMcpConfig(data);

      if (result.success) {
        // 重新获取MCP配置列表
        await handleFetchMcpConfigs();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // MCP更新回调函数
  const handleMcpUpdate = async (id: string, data: any): Promise<boolean> => {
    try {
      const result = await mcpConfigService.updateMcpConfig(id, data);

      if (result.success) {
        // 重新获取MCP配置列表
        await handleFetchMcpConfigs();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // MCP删除回调函数
  const handleDeleteMcp = async () => {
    try {
      await handleFetchMcpConfigs();
    } catch (error) {
      console.error('❌ [page.tsx] MCP列表刷新失败:', error);
    }
  };

  // 统一的连接获取函数，支持所有类型的连接
  const handleFetchConnects = async (mtype?: string) => {
    try {
      const result = await ConnectConfigService.getConnectConfigs({ mtype: mtype });

      if (result.success) {
        // LLM连接直接返回原始数据，其他连接需要转换格式
        if (mtype === 'llm') {
          return result.data || [];
        } else {
          // 将连接配置数据转换为符合UI组件期望的结构
          const transformedData = (result.data || []).map((item: any) => ({
            id: item.id || item.ctype,
            name: item.name,
            ctype: item.ctype,
            description: item.description || `${item.ctype} 数据库连接`
          }));
          return transformedData;
        }
      } else {
        throw new Error(result.error || '获取连接配置失败');
      }
    } catch (error) {
      console.error('❌ handleFetchConnects 错误:', error);
      if (mtype === 'llm') {
        return []; // LLM连接失败时返回空数组
      } else {
        throw error; // 其他连接失败时抛出错误
      }
    }
  };

  // 获取在线模型列表
  const handleFetchOnlineModels = async (datasourceId: string, search?: string) => {
    try {
      // 导入dataFetchers
      const { fetchConnectDetail } = await import('../flow/utils/dataFetchers');
      // 使用 JSON.stringify 确保格式正确
      // 调用fetchConnectDetail获取模型列表，传递type参数作为search
      const result = await fetchConnectDetail(datasourceId, search);

      if (!result.error && result.tableOptions && result.tableOptions.length > 0) {
        // 将tableOptions转换为ModelInfo格式，但保持原有的对象结构
        const transformedOptions = result.tableOptions.map((option: any) => ({
          value: option.value,
          label: option.label || option.value,
          id: option.value,
          name: option.label || option.value,
          group: getModelGroup(option.value),
          description: option.description || `模型`,
          tags: getModelTags(option.value)
        }));
        // 返回包含tableOptions的对象，符合AgentConfigModal的期望
        const finalResult = {
          ...result,
          tableOptions: transformedOptions
        };
        return finalResult;
      } else {
        return {
          error: result.error || '未获取到模型数据',
          tableOptions: []
        };
      }
    } catch (error) {
      console.error('❌ [page.tsx] 获取模型失败:', error);
      return {
        error: error instanceof Error ? error.message : '获取模型失败',
        tableOptions: []
      };
    }
  };

  // 根据模型ID推断分组
  const getModelGroup = (modelId: string): string => {
    const id = modelId.toLowerCase();
    if (id.includes('qwen')) return 'Qwen';
    if (id.includes('deepseek')) return 'DeepSeek';
    if (id.includes('glm') || id.includes('chatglm')) return 'GLM';
    if (id.includes('internlm')) return 'InternLM';
    if (id.includes('yi-')) return 'Yi';
    if (id.includes('baichuan')) return 'Baichuan';
    if (id.includes('llama')) return 'Llama';
    if (id.includes('mistral')) return 'Mistral';
    if (id.includes('gemma')) return 'Gemma';
    if (id.includes('phi')) return 'Phi';
    if (id.includes('gpt')) return 'OpenAI';
    if (id.includes('claude')) return 'Anthropic';
    if (id.includes('gemini')) return 'Gemini';
    return 'Other';
  };

  // 根据模型ID推断标签
  const getModelTags = (modelId: string): string[] => {
    const id = modelId.toLowerCase();
    const tags: string[] = [];
    if (id.includes('chat') || id.includes('instruct')) {
      tags.push('推理');
    }
    if (id.includes('vision') || id.includes('vl') || id.includes('视觉')) {
      tags.push('视觉');
    }
    if (id.includes('coder') || id.includes('code')) {
      tags.push('代码');
    }
    if (id.includes('free') || id.includes('免费')) {
      tags.push('免费');
    }
    if (id.includes('embedding')) {
      tags.push('嵌入');
    }
    // 如果没有任何标签，添加默认标签
    if (tags.length === 0) {
      tags.push('推理');
    }
    return tags;
  };

  const handleFetchMcpConfigs = async () => {
    try {
      const result = await mcpConfigService.getMcpConfigs();

      if (result.success) {
        const mcpData = result.data || [];
        setMcpConfigs(mcpData);
        return mcpData;
      } else {
        setMcpConfigs([]);
        return [];
      }
    } catch (error) {
      setMcpConfigs([]);
      return [];
    }
  };

  // 获取工作流配置
  const handleFetchWorkflowConfigs = async () => {
    try {
      const result = await getAllWorkflowConfigs();

      if (result.success) {
        const workflowData = result.data || [];
        setWorkflowConfigs(workflowData);
        return workflowData;
      } else {
        setWorkflowConfigs([]);
        return [];
      }
    } catch (error) {
      setWorkflowConfigs([]);
      return [];
    }
  };

  const handleAgentSave = async (data: any): Promise<boolean> => {
    try {
      const result = await AgentService.saveAgent(data);

      if (result.success) {
        // 重新获取智能体列表
        await handleFetchAgents();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // 智能体更新回调函数
  const handleAgentUpdate = async (id: string, data: any): Promise<boolean> => {
    try {
      const result = await AgentService.updateAgent(id, data);

      if (result.success) {
        // 重新获取智能体列表
        await handleFetchAgents();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // 统一的智能体保存处理函数，根据是否有id判断新建还是更新
  const handleAgentSaveOrUpdate = async (data: any): Promise<boolean> => {
    if (data.id) {
      // 有id则为更新操作
      return await handleAgentUpdate(data.id, data);
    } else {
      // 无id则为新建操作
      return await handleAgentSave(data);
    }
  };

  // 获取知识库列表
  const handleFetchKnowledgeBases = async (): Promise<AiRagConfig[]> => {
    try {
      const result = await AiRagService.getAiRags();

      if (result.success) {
        const kbData = result.data || [];
        setKnowledgeBases(kbData);
        return kbData;
      } else {
        setKnowledgeBases([]);
        return [];
      }
    } catch (error) {
      console.error('获取知识库列表失败:', error);
      setKnowledgeBases([]);
      return [];
    }
  };

  // 删除知识库
  const handleDeleteKnowledgeBase = async (kbId: string): Promise<boolean> => {
    try {
      const result = await AiRagService.deleteAiRag(kbId);

      if (result.success) {
        // 重新获取知识库列表
        await handleFetchKnowledgeBases();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('删除知识库失败:', error);
      return false;
    }
  };

  // 编辑知识库
  const handleEditKnowledgeBase = async (kb: AiRagConfig): Promise<AiRagConfig | null> => {
    try {
      if (!kb.id) {
        console.error('知识库ID不存在');
        return null;
      }

      // 根据ID获取知识库详细信息
      const result = await AiRagService.getAiRag(kb.id);

      if (result.success && result.data) {
        return result.data;
      } else {
        console.error('获取知识库详情失败:', result.error);
        return null;
      }
    } catch (error) {
      console.error('获取知识库详情异常:', error);
      return null;
    }
  };

  // 更新知识库
  const handleUpdateKnowledgeBase = async (id: string, data: any): Promise<boolean> => {
    try {
      // 将 KnowledgeBaseModal 的数据转换为 UpdateAiRagRequest 格式
      const updateData = {
        name: data.name,
        vectorConnectId: data.vectorConnectId,
        embeddingConnectId: data.embeddingConnectId,
        embeddingModelId: data.embeddingModelId,
        rerankerConnectId: data.rerankerConnectId,
        rerankerModelId: data.rerankerModelId,
        chunkSize: data.chunkSize,
        chunkOverlap: data.chunkOverlap,
        embeddingDimension: data.embeddingDimension,
        matchingThreshold: data.matchingThreshold
      };

      const result = await AiRagService.updateAiRag(id, updateData);

      if (result.success) {
        console.log('知识库更新成功:', result.data);
        // 重新获取知识库列表
        await handleFetchKnowledgeBases();
        return true;
      } else {
        console.error('知识库更新失败:', result.error);
        return false;
      }
    } catch (error) {
      console.error('知识库更新异常:', error);
      return false;
    }
  };

  // 知识库保存处理函数（支持新建和更新）
  const handleKnowledgeBaseSave = async (data: any, editData?: AiRagConfig): Promise<boolean> => {
    try {
      // 如果有editData且有id，则为更新操作
      if (editData && editData.id) {
        return await handleUpdateKnowledgeBase(editData.id, data);
      } else {
        // 否则为新建操作
        // 将 KnowledgeBaseModal 的数据转换为 CreateAiRagRequest 格式
        const aiRagData = {
          name: data.name,
          vectorConnectId: data.vectorConnectId,
          embeddingConnectId: data.embeddingConnectId,
          embeddingModelId: data.embeddingModelId,
          embeddingDimension: data.embeddingDimension, // 默认维度
          documentCount: 0, // 初始文档数量
          rerankerConnectId: data.rerankerConnectId,
          rerankerModelId: data.rerankerModelId,
          chunkSize: data.chunkSize || 1000,
          chunkOverlap: data.chunkOverlap || 200,
          matchingThreshold: data.matchingThreshold || null
        };

        const result = await AiRagService.createAiRag(aiRagData);

        if (result.success) {
          console.log('知识库创建成功:', result.data);
          // 重新获取知识库列表
          await handleFetchKnowledgeBases();
          return true;
        } else {
          console.error('知识库创建失败:', result.error);
          return false;
        }
      }
    } catch (error) {
      console.error('知识库保存异常:', error);
      return false;
    }
  };

  // 连接保存的回调函数
  const handleConnectSave = async (data: any) => {
    try {
      const result = await ConnectService.saveConnectConfig(data);
      return result.success;
    } catch (error) {
      console.error('❌ handleConnectSave 错误:', error);
      return false;
    }
  };

  // 连接测试的回调函数
  const handleConnectTest = async (config: Record<string, any>, message?: string) => {
    try {
      // 这里需要根据config中的connectId来调用测试
      const connectId = config.connectId || 'unknown';
      const result = await ConnectService.testConnection(connectId, config, message);
      return result;
    } catch (error) {
      console.error('❌ handleConnectTest 错误:', error);
      throw error;
    }
  };

  // 文件上传处理函数
  const handleFileUpload = async (
    knowledgeBaseId: string,
    file: File,
    onProgress?: (progress: {
      fileId: string;
      fileName: string;
      progress: number;
      uploadSpeed?: number;
      estimatedTimeRemaining?: number;
      uploadedBytes?: number;
      totalBytes?: number;
    }) => void
  ) => {
    try {
      console.log('🔧 [AgentPage] 开始文件上传:', {
        knowledgeBaseId,
        fileName: file.name,
        fileSize: file.size
      });

      const result = await AiRagService.uploadFileToKnowledgeBase(
        knowledgeBaseId,
        file,
        onProgress
      );

      if (result.success) {
        console.log('🔧 [AgentPage] 文件上传成功:', result.data);
        return {
          success: true,
          fileId: result.data?.fileId,
          message: result.message || '文件上传成功'
        };
      } else {
        console.error('🔧 [AgentPage] 文件上传失败:', result.error);
        return {
          success: false,
          error: result.error?.message || '文件上传失败'
        };
      }
    } catch (error) {
      console.error('🔧 [AgentPage] 文件上传异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '文件上传异常'
      };
    }
  };

  // 加载文档列表处理函数
  const handleLoadDocuments = async (
    knowledgeBaseId: string,
    params: {
      page: number;
      limit: number;
      status?: string;
      fileType?: string;
      search?: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    }
  ) => {
    try {
      console.log('🔧 [AgentPage] 开始加载文档列表:', { knowledgeBaseId, params });

      const result = await AiRagService.loadDocuments(knowledgeBaseId, params);

      if (result.success) {
        console.log('🔧 [AgentPage] 文档列表加载成功:', result.data);
        return result;
      } else {
        console.error('🔧 [AgentPage] 文档列表加载失败:', result.error);
        return result;
      }
    } catch (error) {
      console.error('🔧 [AgentPage] 文档列表加载异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '文档列表加载异常'
      };
    }
  };

  // 删除文档处理函数
  const handleDeleteDocument = async (knowledgeBaseId: string, documentId: string) => {
    console.log('🔧 [AgentPage] ========== 接收删除请求 ==========');
    console.log('🔧 [AgentPage] 删除参数:', { knowledgeBaseId, documentId });
    
    try {
      console.log('🔧 [AgentPage] 开始调用 AiRagService.deleteDocument...');
      
      const startTime = Date.now();
      const result = await AiRagService.deleteDocument(knowledgeBaseId, documentId);
      const endTime = Date.now();
      
      console.log('🔧 [AgentPage] AiRagService.deleteDocument 调用完成');
      console.log('🔧 [AgentPage] 耗时:', endTime - startTime + 'ms');
      console.log('🔧 [AgentPage] 服务返回结果:', result);

      if (result.success) {
        console.log('🔧 [AgentPage] ✅ 文档删除成功');
        console.log('🔧 [AgentPage] ========== 删除请求成功结束 ==========');
        return result;
      } else {
        console.error('🔧 [AgentPage] ❌ 文档删除失败:', result.error);
        return result;
      }
    } catch (error) {
      console.error('🔧 [AgentPage] ❌ 文档删除异常:', error);
      console.error('🔧 [AgentPage] 异常详情:', {
        message: error instanceof Error ? error.message : '未知错误',
        stack: error instanceof Error ? error.stack : undefined
      });
      console.log('🔧 [AgentPage] ========== 删除请求异常结束 ==========');
      return {
        success: false,
        error: error instanceof Error ? error.message : '文档删除异常'
      };
    }
  };

  // 删除文档片段处理函数
  const handleDeleteDocumentChunk = async (knowledgeBaseId: string, documentId: string, chunkId: string) => {
    try {
      console.log('🔧 [AgentPage] 开始删除文档片段:', { knowledgeBaseId, documentId, chunkId });

      const result = await AiRagService.deleteDocumentChunk(knowledgeBaseId, documentId, chunkId);

      if (result.success) {
        console.log('🔧 [AgentPage] 文档片段删除成功');
        return result;
      } else {
        console.error('🔧 [AgentPage] 文档片段删除失败:', result.error);
        return result;
      }
    } catch (error) {
      console.error('🔧 [AgentPage] 文档片段删除异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '文档片段删除异常'
      };
    }
  };

  // 重新处理文档处理函数
  const handleReprocessDocument = async (knowledgeBaseId: string, documentId: string) => {
    try {
      console.log('🔧 [AgentPage] 开始重新处理文档:', { knowledgeBaseId, documentId });

      const result = await AiRagService.reprocessDocument(knowledgeBaseId, documentId);

      if (result.success) {
        console.log('🔧 [AgentPage] 文档重新处理成功');
        return result;
      } else {
        console.error('🔧 [AgentPage] 文档重新处理失败:', result.error);
        return result;
      }
    } catch (error) {
      console.error('🔧 [AgentPage] 文档重新处理异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '文档重新处理异常'
      };
    }
  };

  // 下载文档处理函数
  const handleDownloadDocument = async (knowledgeBaseId: string, documentId: string) => {
    try {
      console.log('🔧 [AgentPage] 开始下载文档:', { knowledgeBaseId, documentId });

      const result = await AiRagService.downloadDocument(knowledgeBaseId, documentId);

      if (result.success) {
        console.log('🔧 [AgentPage] 文档下载成功');
        return result;
      } else {
        console.error('🔧 [AgentPage] 文档下载失败:', result.error);
        return result;
      }
    } catch (error) {
      console.error('🔧 [AgentPage] 文档下载异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '文档下载异常'
      };
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // 并行获取智能体、MCP配置、知识库和工作流配置数据
        await Promise.all([
          handleFetchAgents(),
          handleFetchMcpConfigs(),
          handleFetchKnowledgeBases(),
          handleFetchWorkflowConfigs()
        ]);
      } catch (error) {
        console.error('数据初始化失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <AgentPage
        loading={loading}
        DocumentIcon={SiApachedolphinscheduler}
        title='智能体工坊'
        slogan='无需编写代码，通过直观的可视化界面快速配置和部署AI智能体。支持自定义知识库、MCP和交互逻辑，让每个人都能轻松打造专属AI助手。'
        agents={agents}
        mcpConfigs={mcpConfigs}
        knowledgeBases={knowledgeBases}
        workflowConfigs={workflowConfigs}
        onMcpSave={handleMcpSave}
        onMcpUpdate={handleMcpUpdate}
        onDeleteMcp={handleDeleteMcp}
        onFetchConnects={handleFetchConnects}
        onFetchMcpConfigs={handleFetchMcpConfigs}
        onFetchWorkflowConfigs={handleFetchWorkflowConfigs}
        onFetchAgents={handleFetchAgents}
        onFetchAgentDetail={handleFetchAgentDetail}
        onAgentSave={handleAgentSaveOrUpdate}
        onKnowledgeBaseSave={handleKnowledgeBaseSave}
        onFetchKnowledgeBases={handleFetchKnowledgeBases}
        onDeleteKnowledgeBase={handleDeleteKnowledgeBase}
        onEditKnowledgeBase={handleEditKnowledgeBase}
        onDeleteAgent={handleDeleteAgent}
        onEditAgent={handleEditAgent}
        onOpenAgent={handleOpenAgent}
        onFetchConnectDetails={handleFetchOnlineModels}
        onConnectSave={handleConnectSave}
        onConnectTest={handleConnectTest}
        onFileUpload={handleFileUpload}
        onLoadDocuments={handleLoadDocuments}
        onDeleteDocument={handleDeleteDocument}
        onDeleteDocumentChunk={handleDeleteDocumentChunk}
        onReprocessDocument={handleReprocessDocument}
        onDownloadDocument={handleDownloadDocument}

        toastHook={toastHook}
        // 流式聊天相关 props
        streamMessages={streamMessages}
        streamIsLoading={streamIsLoading}
        threadId={threadId}
        isLoadingThread={isLoadingThread}
        onStreamSendMessage={onStreamSendMessage}
        onLoadThread={onLoadThread}
        onSetAgent={onSetAgent}
        onStartNewChat={onStartNewChat}
        userId="admin"
      />
      {/* Toast 管理器 - 确保在最高层级 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999999
      }}>
        <ToastManager toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
}