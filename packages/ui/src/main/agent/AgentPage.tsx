import React, { useState, useRef, useEffect } from 'react';

// 导入UI组件样式
import {
  GlassContainer,
  GlassMain,
  GlassHeader,
  GlassDescription,
  GlassTabNav,
  GlassTab,
  GlassDescInfo
} from '../../components/shared/ui-components';
import {
  HeaderContainer,
  TitleContainer,
  ButtonGroup,
  WelcomeContainer,
  WelcomeContent,
  IconContainer,
  WelcomeTitle,
  PlaceholderContainer,
  EmptyContainer
}
  from '../shared/styles/welcome';

import { MdGroupAdd } from "react-icons/md";
import { GiSecretBook } from "react-icons/gi";
import { RiHealthBookLine } from "react-icons/ri";
import { CoButton } from '../../components/basic/Buttons';

import {
  CreateButtonContainer,
  DropdownContent,
  DropdownItem
} from './agent-styles';


import { McpConfigModal } from '../../components/modals/McpConfigModal';
import { AgentConfigModal } from '../../components/modals/AgentConfigModal';
import { KnowledgeBaseModal } from '../../components/modals/KnowledgeBaseModal';
import { AgentList } from './AgentList';
import { McpList } from './McpList';
import { KnowledgeBaseList } from './KnowledgeBaseList';
import { AgentConfig, McpConfig, AiRagConfig } from '@repo/common';

interface AgentPageProps {
  DocumentIcon: React.ComponentType;
  loading: boolean;
  title: string;
  slogan: string;
  agents?: AgentConfig[];
  mcpConfigs?: McpConfig[];
  knowledgeBases?: AiRagConfig[]; // 知识库配置列表
  workflowConfigs?: any[]; // 工作流配置列表
  onMcpSave?: (data: any) => Promise<boolean>;
  onMcpUpdate?: (id: string, data: any) => Promise<boolean>;
  onDeleteMcp?: () => Promise<void>;
  onAgentSave?: (data: any) => Promise<boolean>;
  onKnowledgeBaseSave?: (data: any) => Promise<boolean>; // 知识库保存回调
  onFetchKnowledgeBases?: () => Promise<AiRagConfig[]>; // 获取知识库列表
  onDeleteKnowledgeBase?: (kbId: string) => Promise<boolean>; // 删除知识库
  onEditKnowledgeBase?: (kb: AiRagConfig) => Promise<AiRagConfig | null>; // 编辑知识库

  onFetchMcpConfigs?: () => Promise<any[]>;
  onFetchWorkflowConfigs?: () => Promise<any[]>; // 获取工作流配置
  onFetchAgents?: () => Promise<AgentConfig[]>;
  onFetchAgentDetail?: (agentId: string) => Promise<AgentConfig | null>;
  onDeleteAgent?: (agentId: string) => Promise<boolean>;
  onEditAgent?: (agent: AgentConfig) => void;
  onShareAgent?: (agentId: string) => void;
  onOpenAgent?: (agentId: string) => void;
  // 连接相关
  onFetchConnectDetails?: (connectId: string,search?:string) => Promise<any>; // 获取连接详情
  onConnectSave?: (data: any) => Promise<boolean>; // 保存连接
  onConnectTest?: (config: Record<string, any>, message?: string) => Promise<any>; // 测试连接
  onFetchConnects?: (mtype?: string) => Promise<any[]>; // 获取连接配置列表
  onFetchOnlineModels?: (datasourceId: string, search?: string) => Promise<any>; // 获取在线模型列表
  
  // 文件上传相关
  onFileUpload?: (
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
  ) => Promise<{
    success: boolean;
    fileId?: string;
    error?: string;
    message?: string;
  }>;
  
  // 文档管理相关
  onLoadDocuments?: (
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
  ) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
  onDeleteDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onDeleteDocumentChunk?: (knowledgeBaseId: string, documentId: string, chunkId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onReprocessDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onDownloadDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }>;

  // Toast hook实例
  toastHook?: any; // Toast hook实例
  // 流式聊天相关 props
  streamMessages?: any[];
  streamIsLoading?: boolean;
  threadId?: string | null;
  isLoadingThread?: boolean;
  onStreamSendMessage?: (message: string) => Promise<void>;
  onLoadThread?: (threadId: string) => Promise<void>;
  onSetAgent?: (agentId: string) => Promise<void>;
  onStartNewChat?: () => void;
  userId?: string;
}

export const AgentPage: React.FC<AgentPageProps> = ({
  DocumentIcon,
  title,
  slogan,
  agents = [],
  mcpConfigs = [],
  knowledgeBases = [],
  workflowConfigs = [],
  onMcpSave,
  onMcpUpdate,
  onDeleteMcp,
  onAgentSave,
  onKnowledgeBaseSave,
  onFetchKnowledgeBases,
  onDeleteKnowledgeBase,
  onEditKnowledgeBase,

  onFetchMcpConfigs,
  onFetchWorkflowConfigs,
  onFetchAgents,
  onFetchAgentDetail,
  onDeleteAgent,
  onEditAgent,
  onShareAgent,
  onOpenAgent,
  onFetchConnects,
  onFetchConnectDetails,
  onConnectSave,
  onConnectTest,
  onFileUpload,
  onLoadDocuments,
  onDeleteDocument,
  onDeleteDocumentChunk,
  onReprocessDocument,
  onDownloadDocument,
  // onFetchOnlineModels,

  toastHook,
  // 流式聊天相关 props
  streamMessages,
  streamIsLoading,
  threadId,
  isLoadingThread,
  onStreamSendMessage,
  onLoadThread,
  onSetAgent,
  onStartNewChat,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState('agent');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isKnowledgeBaseModalOpen, setIsKnowledgeBaseModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
  const [editingMcp, setEditingMcp] = useState<McpConfig | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const [mcpModalMode, setMcpModalMode] = useState<'quick' | 'json'>('quick');

  const handleCreateMcp = () => {
    setDropdownOpen(false);
    setEditingMcp(null);
    setMcpModalMode('quick');
    setIsMcpModalOpen(true);
  };

  const handleImportMcp = () => {
    setDropdownOpen(false);
    setEditingMcp(null);
    setMcpModalMode('json');
    setIsMcpModalOpen(true);
  };

  const handleMcpModalClose = () => {
    setIsMcpModalOpen(false);
    setEditingMcp(null);
  };

  const handleCreateAgent = () => {
    setDropdownOpen(false);
    setEditingAgent(null);
    setIsAgentModalOpen(true);
  };

  const handleOpenKnowledgeBase = () => {
    // 切换到知识库标签页
    setActiveTab('knowledge');
    // 打开知识库模态框
    setIsKnowledgeBaseModalOpen(true);
  };

  const handleKnowledgeBaseModalClose = () => {
    setIsKnowledgeBaseModalOpen(false);
  };

  const handleKnowledgeBaseSave = async (data: any) => {
    try {
      if (onKnowledgeBaseSave) {
        return await onKnowledgeBaseSave(data);
      } else {
        console.log('保存知识库配置:', data);
        return true;
      }
    } catch (error) {
      console.error('保存知识库配置失败:', error);
      return false;
    }
  };

  const handleKnowledgeBaseSaveWithSuccess = async (data: any) => {
    try {
      const success = await handleKnowledgeBaseSave(data);
      if (success) {
        // 关闭模态框
        setIsKnowledgeBaseModalOpen(false);
        // 切换到知识库列表
        setActiveTab('knowledge');
        // 刷新知识库列表
        if (onFetchKnowledgeBases) {
          await onFetchKnowledgeBases();
        }
      }
      return success;
    } catch (error) {
      console.error('保存知识库配置失败:', error);
      return false;
    }
  };

  const handleAgentModalClose = () => {
    setIsAgentModalOpen(false);
    setEditingAgent(null);
  };

  const handleAgentClick = async (agentId: string) => {
    // 根据agentId找到对应的agent
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
      console.error('未找到对应的智能体:', agentId);
      return;
    }

    try {
      // 使用传入的回调函数获取包含完整数据（包括prompt）的智能体信息
      if (onFetchAgentDetail) {
        const fullAgentData = await onFetchAgentDetail(agent.id);

        if (fullAgentData) {
          // 使用完整的数据设置编辑状态
          setEditingAgent(fullAgentData);
          setIsAgentModalOpen(true);
          if (onEditAgent) {
            onEditAgent(fullAgentData);
          }
        } else {
          // 如果获取失败，使用原有数据
          console.error('获取智能体详情失败');
          setEditingAgent(agent);
          setIsAgentModalOpen(true);
          if (onEditAgent) {
            onEditAgent(agent);
          }
        }
      } else {
        // 如果没有提供回调函数，直接使用原有数据
        setEditingAgent(agent);
        setIsAgentModalOpen(true);
        if (onEditAgent) {
          onEditAgent(agent);
        }
      }
    } catch (error) {
      // 如果请求失败，使用原有数据
      setEditingAgent(agent);
      setIsAgentModalOpen(true);
      if (onEditAgent) {
        onEditAgent(agent);
      }
    }
  };

  const handleDeleteAgent = async (agentId: string): Promise<boolean> => {
    if (onDeleteAgent) {
      try {
        const success = await onDeleteAgent(agentId);
        if (success) {
          // 刷新列表
          if (onFetchAgents) {
            await onFetchAgents();
          }
        }
        return success;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  const handleEditAgentFromList = async (agent: AgentConfig) => {
    try {
      // 使用传入的回调函数获取包含完整数据（包括prompt）的智能体信息
      if (onFetchAgentDetail) {
        const fullAgentData = await onFetchAgentDetail(agent.id);

        if (fullAgentData) {
          // 使用完整的数据设置编辑状态
          setEditingAgent(fullAgentData);
          setIsAgentModalOpen(true);
          if (onEditAgent) {
            onEditAgent(fullAgentData);
          }
        } else {
          // 如果获取失败，使用原有数据
          setEditingAgent(agent);
          setIsAgentModalOpen(true);
          if (onEditAgent) {
            onEditAgent(agent);
          }
        }
      } else {
        // 如果没有提供回调函数，直接使用原有数据
        setEditingAgent(agent);
        setIsAgentModalOpen(true);
        if (onEditAgent) {
          onEditAgent(agent);
        }
      }
    } catch (error) {
      // 如果请求失败，使用原有数据
      setEditingAgent(agent);
      setIsAgentModalOpen(true);
      if (onEditAgent) {
        onEditAgent(agent);
      }
    }
  };

  const handleDebugAgent = (agent: AgentConfig) => {
    // 这里可以实现调试功能
    //alert(`正在调试智能体: ${agent.name}\nID: ${agent.id}`);
  };

  // MCP 相关处理函数
  const handleMcpClick = (mcpId: string) => {
    // 可以实现MCP详情查看逻辑
  };

  // 知识库相关处理函数
  const handleKnowledgeBaseClick = (kbId: string) => {
    // 可以实现知识库详情查看逻辑
  };

  const handleDeleteKnowledgeBase = async (kbId: string) => {
    // 调用传入的删除回调函数
    if (onDeleteKnowledgeBase) {
      await onDeleteKnowledgeBase(kbId);
      // 刷新知识库列表
      if (onFetchKnowledgeBases) {
        await onFetchKnowledgeBases();
      }
    }
  };

  const handleEditKnowledgeBase = (kb: AiRagConfig) => {
    // 编辑知识库逻辑
    onEditKnowledgeBase?.(kb);
  };

  const handleDebugKnowledgeBase = (kb: AiRagConfig) => {
    // 调试知识库逻辑
    console.log('调试知识库:', kb.name);
  };

  const handleDeleteMcp = async (mcpId: string) => {
    //console.log('🔍 [AgentPage] 收到删除MCP回调:', mcpId);
    // 调用传入的删除回调函数
    if (onDeleteMcp) {
      //console.log('🔍 [AgentPage] 调用onDeleteMcp回调');
      await onDeleteMcp();
      //console.log('🔍 [AgentPage] onDeleteMcp回调完成');
    } else {
      //console.log('🔍 [AgentPage] onDeleteMcp 不存在');
    }
  };

  const handleEditMcp = (mcp: McpConfig) => {
    setEditingMcp(mcp);
    setMcpModalMode('quick');
    setIsMcpModalOpen(true);
  };

  const handleDebugMcp = (mcp: McpConfig) => {
    // alert(`正在调试MCP配置: ${mcp.name}`);
  };

  const handleAgentSaveSuccess = async () => {
    setIsAgentModalOpen(false);
    setEditingAgent(null);
    // 切换到智能体列表
    setActiveTab('agent');
    // 刷新智能体列表
    if (onFetchAgents) {
      await onFetchAgents();
    }
  };

  const handleMcpSave = async (data: any): Promise<boolean> => {
    try {
      let success = false;
      if (editingMcp) {
        // 编辑模式 - 使用更新回调
        if (onMcpUpdate) {
          success = await onMcpUpdate(editingMcp.id, data);
        }

        if (!success) {
          alert('更新MCP配置失败');
        }
      } else {
        // 创建模式 - 使用原有的保存逻辑
        if (onMcpSave) {
          success = await onMcpSave(data);
        }
      }

      if (success) {
        setIsMcpModalOpen(false);
        setEditingMcp(null);
        // 切换到MCP列表
        setActiveTab('mcp');
        // 刷新MCP配置列表
        if (onFetchMcpConfigs) {
          await onFetchMcpConfigs();
        }
      }
      return success;
    } catch (error) {
      console.error('保存MCP配置失败:', error);
      alert('保存失败，请重试');
      return false;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <GlassContainer>
      {/* <LiquidBackground /> */}
      <GlassMain>
        <GlassHeader>
          <GlassDescription>
            <HeaderContainer>
              <TitleContainer>
                <h3>{title}</h3>
              </TitleContainer>
              <CreateButtonContainer ref={dropdownRef}>
                <ButtonGroup>
                  <CoButton variant='liquid' radian="left" onClick={handleCreateAgent}>
                    <MdGroupAdd />
                    <span> 创建智能体</span>
                  </CoButton>
                  <CoButton variant='liquid' radian="middle"
                    onClick={toggleDropdown}
                  >
                    MCP +
                  </CoButton>
                  <DropdownContent $isOpen={dropdownOpen}>
                    <DropdownItem onClick={handleCreateMcp}>快速创建 <RiHealthBookLine />
                    </DropdownItem>
                    <DropdownItem onClick={handleImportMcp}>JSON导入 <RiHealthBookLine />
                    </DropdownItem>
                  </DropdownContent>
                  <CoButton variant='liquid' radian="right" onClick={handleOpenKnowledgeBase}>
                    <GiSecretBook />
                    <span> 知识库</span>
                  </CoButton>
                </ButtonGroup>
              </CreateButtonContainer>
            </HeaderContainer>
            <GlassDescInfo>
              {slogan}
            </GlassDescInfo>
          </GlassDescription>

          <GlassTabNav>
            <GlassTab $active={activeTab === 'agent'} onClick={() => setActiveTab('agent')}>
              智能体
            </GlassTab>
            <GlassTab $active={activeTab === 'mcp'} onClick={() => setActiveTab('mcp')}>
              MCP
            </GlassTab>
            <GlassTab $active={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')}>
              知识库
            </GlassTab>
          </GlassTabNav>
        </GlassHeader>
        {(() => {
          if (activeTab === 'agent') {
            if (agents.length === 0) {
              return (
                <WelcomeContainer>
                  <WelcomeContent>
                    <IconContainer>
                      <DocumentIcon />
                    </IconContainer>
                    <WelcomeTitle>
                      还没有任何智能体
                      <p>点击上方的"创建智能体"按钮开始配置你的第一个智能体</p>
                    </WelcomeTitle>
                    <CoButton onClick={handleCreateAgent}>
                      快速创建智能体
                    </CoButton>
                    <PlaceholderContainer />
                  </WelcomeContent>
                </WelcomeContainer>
              );
            } else {
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginTop: '4px' }}>
                  <AgentList
                    agents={agents}
                    activeTab={activeTab}
                    onAgentClick={handleAgentClick}
                    onDeleteAgent={handleDeleteAgent}
                    onEditAgent={handleEditAgentFromList}
                    onDebugAgent={handleDebugAgent}
                    onShareAgent={onShareAgent}
                    onOpenAgent={onOpenAgent}
                    // 流式聊天相关 props
                    streamMessages={streamMessages}
                    streamIsLoading={streamIsLoading}
                    threadId={threadId}
                    isLoadingThread={isLoadingThread}
                    onStreamSendMessage={onStreamSendMessage}
                    onLoadThread={onLoadThread}
                    onSetAgent={onSetAgent}
                    onStartNewChat={onStartNewChat}
                    userId={userId}
                  />
                </div>
              );
            }
          } else if (activeTab === 'mcp') {
            // MCP标签页内容
            if (mcpConfigs.length === 0) {
              return (
                <WelcomeContainer>
                  <WelcomeContent>
                    <IconContainer>
                      <DocumentIcon />
                    </IconContainer>
                    <WelcomeTitle>
                      还没有任何MCP配置
                      <p>点击上方的"MCP +"按钮开始配置你的第一个MCP工具</p>
                    </WelcomeTitle>
                    <CoButton onClick={handleCreateMcp}>
                      快速创建MCP
                    </CoButton>
                    <PlaceholderContainer />
                  </WelcomeContent>
                </WelcomeContainer>
              );
            } else {
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginTop: '4px' }}>
                  <McpList
                    mcpConfigs={mcpConfigs}
                    activeTab={activeTab}
                    onMcpClick={handleMcpClick}
                    onDeleteMcp={handleDeleteMcp}
                    onEditMcp={handleEditMcp}
                    onDebugMcp={handleDebugMcp}
                    toastHook={toastHook}
                  />
                </div>
              );
            }
          } else if (activeTab === 'knowledge') {
            // 知识库标签页内容
            if (knowledgeBases.length === 0) {
              return (
                <WelcomeContainer>
                  <WelcomeContent>
                    <IconContainer>
                      <DocumentIcon />
                    </IconContainer>
                    <WelcomeTitle>
                      还没有任何知识库配置
                      <p>点击上方的"知识库"按钮开始配置你的第一个知识库</p>
                    </WelcomeTitle>
                    <CoButton onClick={handleOpenKnowledgeBase}>
                      快速创建知识库
                    </CoButton>
                    <PlaceholderContainer />
                  </WelcomeContent>
                </WelcomeContainer>
              );
            } else {
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginTop: '4px' }}>
                  <KnowledgeBaseList
                    knowledgeBases={knowledgeBases}
                    activeTab={activeTab}
                    onKnowledgeBaseClick={handleKnowledgeBaseClick}
                    onDeleteKnowledgeBase={handleDeleteKnowledgeBase}
                    onEditKnowledgeBase={onEditKnowledgeBase}
                    onSaveKnowledgeBase={onKnowledgeBaseSave}
                    onDebugKnowledgeBase={handleDebugKnowledgeBase}
                    onFileUpload={onFileUpload}
                    onLoadDocuments={onLoadDocuments}
                    onDeleteDocument={onDeleteDocument}
                    onDeleteDocumentChunk={onDeleteDocumentChunk}
                    onReprocessDocument={onReprocessDocument}
                    onDownloadDocument={onDownloadDocument}
                    toastHook={toastHook}
                    onFetchConnects={onFetchConnects}
                    onFetchConnectDetails={onFetchConnectDetails}
                  />
                </div>
              );
            }
          }
          return <EmptyContainer />;
        })()}
      </GlassMain>

      {/* 智能体配置弹窗 */}
      <AgentConfigModal
        isOpen={isAgentModalOpen}
        onClose={handleAgentModalClose}
        onSave={onAgentSave}
        onSaveSuccess={handleAgentSaveSuccess}
        onFetchLLMConnects={onFetchConnects ? () => onFetchConnects('llm') : undefined}
        onFetchMcpConfigs={onFetchMcpConfigs}
        onFetchWorkflowConfigs={onFetchWorkflowConfigs}
        workflowConfigs={workflowConfigs}
        editMode={!!editingAgent}
        editData={editingAgent}
        onFetchConnects={onFetchConnects}
        onFetchConnectDetails={onFetchConnectDetails}
        onSaveConnect={onConnectSave}
        onTestConnect={onConnectTest}
      />

      {/* MCP配置弹窗 */}
      <McpConfigModal
        isOpen={isMcpModalOpen}
        onClose={handleMcpModalClose}
        onSave={handleMcpSave}
        editMode={!!editingMcp}
        editData={editingMcp}
        mode={mcpModalMode}
      />

      {/* 知识库配置弹窗 */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseModalOpen}
        onClose={handleKnowledgeBaseModalClose}
        onSave={handleKnowledgeBaseSaveWithSuccess}
        onLoadConnections={onFetchConnects ? () => onFetchConnects('vector-db') : undefined}
        onFetchLLMConnects={onFetchConnects ? async () => {
          return await onFetchConnects('llm');
        } : undefined}
        onFetchOnlineModels={onFetchConnectDetails}
        onLoadModels={onFetchConnectDetails ? async (connectId: string) => {
          const result = await onFetchConnectDetails(connectId);
          return result.options || [];
        } : undefined}
      />
    </GlassContainer>
  )
};