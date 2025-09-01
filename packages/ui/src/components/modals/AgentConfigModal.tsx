import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { avatarOptions, getAvatarIcon } from '../../utils/avatarUtils';
import { ToastType } from '@repo/common';
import {
  ModalBackdrop,
  PremiumModalContainer,
  PremiumTitleDesc,
  ModalHeader,
  ModalContent,
  CloseButton,
  FormLabel,
  FormInput,
  FormButtonGroup,
  PremiumFormButton,
  LiquidToast,
  AvatarPanel,
  ButtonGroup
} from '../basic';
import { ModelSelectionArea, ModelConfigArea } from '../forms/agent';
import { useTheme } from '../../context/ThemeProvider';
// import type { ModelSelectionAreaProps } from '../forms/agent';
import { ModelSelectorModal } from '../forms/connect/ModelSelectorModal';
import { AddModelModal } from '../forms/connect/AddModelModal';
import { LLMConnectSelectorModal } from './LLMConnectSelectorModal';
import type { ModelInfo } from '@repo/common';

// 模态框内 Toast 包装器 - 确保在模态框之上显示
const ModalToastWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2147483647; /* 最高层级 */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20px;
  
  & > * {
    pointer-events: auto;
  }
`;

// 左右两列布局容器
const TwoColumnLayout = styled.div`
  display: flex;
  gap: 0px;
  height: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const LeftColumn = styled.div`
  flex: 0 0 50%;
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
`;

const RightColumn = styled.div`
  flex: 0 0 50%;
  width: 50%;
  display: flex;
  flex-direction: column;
  //gap: 16px;
  overflow: hidden;
`;

// 头像选择区域
const AvatarSection = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 12px 20px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
`;

// 头像选择区域
const RightTopSection = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 0px;
  border-radius: 8px 8px 0px 0px;
  padding: 12px 12px 0px 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 水平靠右 */
  gap: 20px;
`;


const SelectedAvatar = styled.div`
  width: 70px;
  height: 60px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)'};
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

// AvatarPanel 模态窗口
const AvatarPanelModal = styled(ModalBackdrop)`
  z-index: 10000;
`;

export const FormInputNoborder = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 0;
  font-size: 16px;
  background: transparent; /* 完全透明背景 */
  color: #ffffff; /*${({ theme }) => theme.colors.textPrimary};*/

  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border}; 
  }
`;

const AvatarPanelContainer = styled.div`
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const AvatarPanelCloseButton = styled(CloseButton)`
  color: white;
  font-size: 24px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

// 表单区域样式
const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const PremiumFormLabel = styled(FormLabel)`
  color: white;
  font-weight: 600;
  padding: 0px 6px;
`;

// // MCP选择区域
// const McpSelectionArea = styled.div`
//   background: rgba(255, 255, 255, 0.1);
//   border: 1px solid rgba(255, 255, 255, 0.2);
//   border-radius: 12px;
//   padding: 8px 20px;
// `;



// 自定义选择框样式
const CustomSelect = styled.select`
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  width: 100%;
  
  option {
    background: #0f172a !important;
    color: white !important;
    padding: 8px !important;
  }
  
  option:hover {
    background: #1e293b !important;
  }
  
  option:checked {
    background: #3b82f6 !important;
  }
`;

interface AgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => Promise<boolean>;
  onSaveSuccess?: () => Promise<void>; // 添加保存成功回调
  editMode?: boolean;
  editData?: any;
  onFetchLLMConnects?: () => Promise<any[]>;
  onFetchMcpConfigs?: () => Promise<any[]>;
  onFetchWorkflowConfigs?: () => Promise<any[]>; // 获取工作流配置
  workflowConfigs?: any[]; // 工作流配置数据
  // LLM连接创建相关
  onFetchConnects?: (mtype: string) => Promise<any[]>; // 获取连接定义列表
  onFetchConnectDetails?: (connectId: string) => Promise<any>; // 获取连接详情
  onSaveConnect?: (data: any) => Promise<boolean>; // 保存连接，返回boolean表示成功状态
  onTestConnect?: (config: Record<string, any>, message?: string) => Promise<any>; // 测试连接
}

export const AgentConfigModal: React.FC<AgentConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveSuccess,
  editMode = false,
  editData,
  onFetchLLMConnects,
  onFetchMcpConfigs,
  onFetchWorkflowConfigs,
  workflowConfigs,
  onFetchConnects,
  onFetchConnectDetails,
  onSaveConnect,
  onTestConnect
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'quick' | 'json'>('quick');

  // 获取默认头像颜色的函数
  const getDefaultAvatarColor = () => {
    return theme.mode === 'dark' ? '#FFFFFF' : '#29c18d';
  };

  // 状态声明
  const [configMode, setConfigMode] = useState<'basic' | 'advanced'>('basic'); // 添加基本/高级模式切换状态
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedMcps, setSelectedMcps] = useState<string[]>([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [selectedConnects, setSelectedConnects] = useState<string[]>([]);

  // 模型配置相关状态
  const [webSearch, setWebSearch] = useState<boolean>(false);
  const [mcpMode, setMcpMode] = useState<'prompt' | 'function'>('prompt');
  const [workflow, setWorkflow] = useState<boolean>(false);
  const [linkEnabled, setLinkEnabled] = useState<boolean>(false);
  const [deepThinking, setDeepThinking] = useState<boolean>(false);
  const [maxTokens, setMaxTokens] = useState<number>(4000);
  const [maxThoughtTokens, setMaxThoughtTokens] = useState<number>(2000);
  const [minP, setMinP] = useState<number>(0.05);
  const [topP, setTopP] = useState<number>(0.9);
  const [topK, setTopK] = useState<number>(40);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [returnGenerations, setReturnGenerations] = useState<number>(1);
  const [maxIterations, setMaxIterations] = useState<number>(1);

  // 头像相关状态
  const [selectedAvatar, setSelectedAvatar] = useState<string>('user'); // 头像key
  const [selectedAvatarColor, setSelectedAvatarColor] = useState<string>(getDefaultAvatarColor()); // 头像颜色
  const [isAvatarPanelOpen, setIsAvatarPanelOpen] = useState(false);

  // 当主题变化时，如果当前使用的是默认颜色，则更新为新主题的默认颜色
  useEffect(() => {
    const darkDefault = '#FFFFFF';
    const lightDefault = '#1f2937';

    // 如果当前颜色是旧的默认颜色，则更新为新主题的默认颜色
    if (selectedAvatarColor === darkDefault && theme.mode === 'light') {
      setSelectedAvatarColor(lightDefault);
    } else if (selectedAvatarColor === lightDefault && theme.mode === 'dark') {
      setSelectedAvatarColor(darkDefault);
    }
  }, [theme.mode, selectedAvatarColor]);

  // 模型选择相关状态
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [showAddModelModal, setShowAddModelModal] = useState<boolean>(false);
  const [showModelSelector, setShowModelSelector] = useState<boolean>(false);
  const [customModels, setCustomModels] = useState<ModelInfo[]>([]);
  const [showLLMConnectModal, setShowLLMConnectModal] = useState<boolean>(false);
  const [modelSelectionCleared, setModelSelectionCleared] = useState<boolean>(false);

  // 存储从数据库获取的数据
  const [llmConnects, setLlmConnects] = useState<any[]>([]);
  const [mcpConfigs, setMcpConfigs] = useState<any[]>([]);
  const [connectConfigs, setConnectConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [systemModels, setSystemModels] = useState<any[]>([]);


  // 获取 LLM 连接配置
  const fetchLLMConnects = async () => {
    if (!onFetchLLMConnects) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const connects = await onFetchLLMConnects();
      setLlmConnects(connects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取连接配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取 MCP 配置
  const fetchMcpConfigs = async () => {
    if (!onFetchMcpConfigs) {
      return;
    }

    try {
      const configs = await onFetchMcpConfigs();
      setMcpConfigs(configs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取MCP配置失败');
    }
  };

  // 获取 Connect 配置
  const fetchConnectConfigs = async (): Promise<any[]> => {
    if (!onFetchConnects) {
      return [];
    }

    try {
      const configs = await onFetchConnects('db');
      setConnectConfigs(configs || []);
      return configs || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取连接配置失败');
      return [];
    }
  };

  // 获取工作流配置
  const fetchWorkflowConfigs = async () => {
    if (!onFetchWorkflowConfigs) {
      return;
    }

    try {
      const configs = await onFetchWorkflowConfigs();
      // 注意：workflowConfigs 是通过 props 传递的，不需要设置状态
      // 这里只是触发获取，实际数据通过 workflowConfigs prop 传递
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取工作流配置失败');
    }
  };

  // 当模态框打开时获取数据
  React.useEffect(() => {
    if (isOpen) {
      // 每次打开模态框时重置为'能力集'界面
      setConfigMode('basic');
      fetchLLMConnects();
      fetchMcpConfigs();
      fetchConnectConfigs();
      fetchWorkflowConfigs();
    }
  }, [isOpen]);



  // 监听Escape键关闭头像选择器
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isAvatarPanelOpen) {
        setIsAvatarPanelOpen(false);
      }
    };

    if (isAvatarPanelOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAvatarPanelOpen]);

  // 编辑模式下初始化数据
  React.useEffect(() => {
    if (editMode && editData) {
      setAgentName(editData.name || '');
      setAgentDescription(editData.description || '');
      setAgentPrompt(editData.prompt || '');
      setModelSelectionCleared(false); // 重置模型清空状态

      // 使用connectid来选中对应的连接
      const connectIdToSelect = editData.connectid || editData.modelId || '';

      // 验证连接是否存在于连接列表中
      if (connectIdToSelect && llmConnects.length > 0) {
        const foundConnect = llmConnects.find(connect => connect.id === connectIdToSelect);
        if (foundConnect) {
          setSelectedModel(connectIdToSelect);
        } else {
          setToast({ message: '智能体关联的连接已不存在，请重新选择连接', type: 'error' });
          setSelectedModel('');
        }
      } else {
        setSelectedModel(connectIdToSelect);
      }

      // 初始化选中的模型（如果有modelId）
      if (editData.modelId) {
        setSelectedModels([editData.modelId]);
      }


      // 如果mcpIds为空但mcpTools有数据，从mcpTools中提取ID
      let mcpIdsToSet = editData.mcpIds || [];
      if ((!mcpIdsToSet || mcpIdsToSet.length === 0) && editData.mcpTools && editData.mcpTools.length > 0) {
        mcpIdsToSet = editData.mcpTools.map((tool: any) => tool.id);
      }

      // 如果workflowIds为空但workflows有数据，从workflows中提取ID
      let workflowIdsToSet = editData.workflowIds || [];
      if ((!workflowIdsToSet || workflowIdsToSet.length === 0) && editData.workflows && editData.workflows.length > 0) {
        workflowIdsToSet = editData.workflows.map((workflow: any) => workflow.id);
      }

      setSelectedMcps(mcpIdsToSet);
      setSelectedWorkflows(workflowIdsToSet);

      // 处理连接配置ID（注意：connectid是LLM连接ID，不是连接配置ID）
      let connectIdsToSet = editData.connectIds || [];
      // connectid是LLM连接的ID，不应该用于连接配置

      setSelectedConnects(connectIdsToSet);

      // 初始化工具模式


      // 初始化头像，支持字符串、JSON字符串或对象格式
      if (editData.avatar) {
        if (typeof editData.avatar === 'string') {
          try {
            // 尝试解析为JSON（新格式）
            const avatarObj = JSON.parse(editData.avatar);
            if (avatarObj.name) {
              setSelectedAvatar(avatarObj.name);
              setSelectedAvatarColor(avatarObj.color || getDefaultAvatarColor());
            } else {
              // 如果解析出的对象没有name属性，则当作旧格式处理
              setSelectedAvatar(editData.avatar);
              setSelectedAvatarColor(getDefaultAvatarColor());
            }
          } catch {
            // JSON解析失败，当作旧格式：纯字符串头像名称
            setSelectedAvatar(editData.avatar);
            setSelectedAvatarColor(getDefaultAvatarColor()); // 使用默认颜色
          }
        } else if (typeof editData.avatar === 'object' && editData.avatar.name) {
          // 直接传递的对象格式（理论上不会出现，但保留兼容性）
          setSelectedAvatar(editData.avatar.name);
          setSelectedAvatarColor(editData.avatar.color || getDefaultAvatarColor());
        }
      }
    }
  }, [editMode, editData, llmConnects]); // 添加llmConnects依赖，确保连接列表加载后再选中

  // 单独处理 agentInfo 配置数据的初始化
  React.useEffect(() => {
    if (editMode && editData && (editData.agentInfo || editData.agentinfo)) {

      try {
        const agentInfoString = editData.agentInfo || editData.agentinfo;
        const configData = JSON.parse(agentInfoString);

        // 设置ModelConfigArea的各项配置，使用默认值作为fallback
        setWebSearch(configData.useInternet ?? false);
        setMcpMode(configData.mcpMode ?? 'prompt');
        setWorkflow(configData.useWorkflow ?? false);
        setLinkEnabled(configData.useConnection ?? false);
        setMaxTokens(configData.maxTokens ?? 4000);
        setDeepThinking(configData.enableThinking ?? false);
        setMaxThoughtTokens(configData.thinkingBudget ?? 2000);
        setMinP(configData.minP ?? 0.05);
        setTopP(configData.topP ?? 0.9);
        setTopK(configData.topK ?? 40);
        setTemperature(configData.temperature ?? 0.7);
        setReturnGenerations(configData.frequencyPenalty ?? 1);
        setMaxIterations(configData.maxIter ?? 1);
      } catch (e) {
        console.warn('解析agentInfo失败，使用默认配置:', e);
      }
    }
  }, [editMode, editData]); // 只依赖 editMode 和 editData

  // 组件关闭时重置状态
  React.useEffect(() => {
    if (!isOpen) {
      setAgentName('');
      setAgentDescription('');
      setAgentPrompt('');
      setSelectedModel('');
      setSelectedMcps([]);
      setSelectedWorkflows([]);

      setSelectedModels([]);
      setSelectedAvatar('user'); // 重置为默认头像
      setSelectedAvatarColor(getDefaultAvatarColor()); // 重置为默认颜色
      setIsAvatarPanelOpen(false);
      setToast(null);
      setSystemModels([]);
      setModelSelectionCleared(false);

      // 重置ModelConfigArea配置
      setWebSearch(false);
      setMcpMode('prompt');
      setWorkflow(false);
      setLinkEnabled(false);
      setMaxTokens(4000);
      setDeepThinking(false);
      setMaxThoughtTokens(2000);
      setMinP(0.05);
      setTopP(0.9);
      setTopK(40);
      setTemperature(0.7);
      setReturnGenerations(1);
      setMaxIterations(1);
    }
  }, [isOpen]);



  // 初始化默认模型列表（当没有选择连接时显示）
  const defaultSystemModels = React.useMemo(() => {
    // 这里暂时使用llmConnects作为可选模型，你可以根据实际需求调整
    return llmConnects.map((connect) => ({
      id: connect.id,
      name: connect.name,
      group: connect.ctype || 'LLM',
      description: `${connect.ctype || 'LLM'} 类型模型`,
      tags: [(connect.ctype || 'llm').toLowerCase(), '推理']
    }));
  }, [llmConnects]);

  // 获取连接列表，在编辑模式下优先显示当前智能体使用的连接
  const getOrderedConnects = React.useMemo(() => {
    if (!llmConnects.length) {
      return llmConnects;
    }

    // 编辑模式下，优先显示已保存的连接
    if (editMode && editData && (editData.connectId || editData.connectid)) {
      const savedConnectId = editData.connectId || editData.connectid;
      const savedConnect = llmConnects.find(connect => connect.id === savedConnectId);
      const otherConnects = llmConnects.filter(connect => connect.id !== savedConnectId);

      if (savedConnect) {
        return [savedConnect, ...otherConnects];
      }
    }

    // 如果当前有选中的连接，也排在前面
    // if (selectedModel) {
    //   const selectedConnect = llmConnects.find(connect => connect.id === selectedModel);
    //   const otherConnects = llmConnects.filter(connect => connect.id !== selectedModel);

    //   if (selectedConnect) {
    //     return [selectedConnect, ...otherConnects];
    //   }
    // }

    // 默认返回原始顺序
    return llmConnects;
  }, [llmConnects, selectedModel, editMode, editData]);

  // 获取选中的模型信息，包含自定义模型
  const selectedModelInfos = React.useMemo(() => {
    return selectedModels.map(modelId => {
      // 先在systemModels（从supportedModels转换的数据）中查找
      const supportedModel = systemModels.find(m => m.id === modelId) ||
        defaultSystemModels.find(m => m.id === modelId);
      if (supportedModel) {
        return {
          id: supportedModel.id,
          name: supportedModel.name,
          group: supportedModel.group || 'LLM'
        } as ModelInfo;
      }

      // 再在自定义模型中查找
      const customModel = customModels.find(m => m.id === modelId);
      if (customModel) {
        return customModel;
      }

      // 编辑模式下，如果在上述列表中找不到，且用户没有手动清空选择，尝试从 editData 中获取模型信息
      if (editMode && editData && editData.modelId === modelId && !modelSelectionCleared) {
        return {
          id: editData.modelId,
          name: editData.modelName || modelId,
          group: 'LLM'
        } as ModelInfo;
      }

      // 如果都找不到，返回一个基础的模型信息
      return {
        id: modelId,
        name: modelId,
        group: 'LLM'
      } as ModelInfo;
    }).filter(Boolean) as ModelInfo[];
  }, [selectedModels, systemModels, defaultSystemModels, customModels, editMode, editData, modelSelectionCleared]);



  // 模型选择处理函数
  const handleSelectModel = async () => {
    // 检查是否选择了连接
    if (!selectedModel) {
      setToast({ message: '请先选择一个连接', type: 'error' });
      return;
    }

    // 直接打开模型选择器，在线模型获取由ModelSelectorModal内部处理
    setShowModelSelector(true);
  };

  const handleAddModelClick = () => {
    // 检查是否选择了连接 - 与"选择模型"保持一致的约束
    if (!selectedModel) {
      setToast({ message: '请先选择一个连接', type: 'error' });
      return;
    }

    setShowAddModelModal(true);
  };

  // 处理模型选择确认
  const handleModelSelect = (modelIds: string[]) => {
    // 与现有选中的模型合并，去重
    setSelectedModels(prev => {
      const merged = [...new Set([...prev, ...modelIds])];
      return merged;
    });
    setModelSelectionCleared(false); // 重置清空状态，因为用户重新选择了模型
    setShowModelSelector(false);
  };

  // 处理添加模型
  const handleAddModel = (model: { id: string; name: string }) => {
    // 创建新的模型信息
    const newModel: ModelInfo = {
      id: model.id,
      name: model.name,
      group: 'Custom' // 自定义模型默认分组
    };

    // 添加到自定义模型列表
    setCustomModels(prev => [...prev, newModel]);

    // 自动选择新添加的模型
    setSelectedModels(prev => [...prev, model.id]);
    setModelSelectionCleared(false); // 重置清空状态，因为用户添加了模型
  };

  // 获取在线模型的函数（供ModelSelectorModal使用）
  const handleFetchOnlineModels = async (connectId: string): Promise<ModelInfo[]> => {
    if (!onFetchConnectDetails) {
      throw new Error('获取连接详情的函数未提供');
    }

    try {
      const selectedConnect = llmConnects.find(connect => connect.id === connectId);
      if (!selectedConnect) {
        throw new Error('未找到选中的连接信息');
      }

      // 使用连接配置的ID去获取连接详情
      const connectDetails = await onFetchConnectDetails(selectedConnect.id);
      console.log('[AgentConfigModal] 获取在线模型结果:', connectDetails);

      // 检查返回的数据结构：可能是数组或包含tableOptions的对象
      let modelsArray: any[] = [];

      if (Array.isArray(connectDetails)) {
        modelsArray = connectDetails;
      } else if (connectDetails && connectDetails.tableOptions && Array.isArray(connectDetails.tableOptions)) {
        modelsArray = connectDetails.tableOptions;
      }

      if (modelsArray.length > 0) {
        // 将模型数据转换为ModelInfo格式
        const modelsForSelector = modelsArray.map((model: any) => ({
          id: model.id || model.value,
          name: model.name || model.label || model.id || model.value,
          group: model.group || selectedConnect.ctype,
          description: model.description || `${model.group || selectedConnect.ctype} 模型`,
          tags: model.tags || [selectedConnect.ctype.toLowerCase(), '推理']
        }));

        console.log('[AgentConfigModal] 转换后的在线模型数据:', modelsForSelector.length, '个模型');
        return modelsForSelector;
      } else {
        console.log('[AgentConfigModal] 未找到在线模型数据');
        return [];
      }
    } catch (error) {
      console.error('[AgentConfigModal] 获取在线模型失败:', error);
      throw error;
    }
  };

  // 移除单个模型
  const handleRemoveModel = (modelId: string) => {
    setSelectedModels(prev => prev.filter(id => id !== modelId));
  };

  // 连接创建成功后的处理
  const handleConnectCreated = () => {
    setShowLLMConnectModal(false);
    // 重新获取LLM连接列表
    fetchLLMConnects();
    setToast({ message: 'LLM连接创建成功！', type: 'success' });
  };

  const handleSave = async () => {
    // 验证必填字段
    if (agentName.trim() === '') {
      setToast({ message: '请输入智能体名称', type: 'error' });
      return;
    }

    if (agentDescription.trim() === '') {
      setToast({ message: '请输入智能体描述', type: 'error' });
      return;
    }

    if (!selectedModel) {
      setToast({ message: '请选择一个连接', type: 'error' });
      return;
    }

    // 检查模型选择：编辑模式下可以使用已保存的模型，创建模式下必须选择新模型
    if (selectedModels.length === 0 && (!editMode || !editData?.modelId)) {
      setToast({ message: '请选择至少一个模型', type: 'error' });
      return;
    }

    try {
      // 获取模型信息：优先使用新选择的模型，否则使用已保存的模型
      let primaryModelId: string;
      let primaryModelName: string;

      if (selectedModels.length > 0) {
        // 用户重新选择了模型
        primaryModelId = selectedModels[0] || '';
        const primaryModelInfo = selectedModelInfos.find(model => model.id === primaryModelId);
        primaryModelName = primaryModelInfo?.name || '未知模型';
      } else if (editMode && editData?.modelId) {
        // 编辑模式下使用已保存的模型
        primaryModelId = editData.modelId;
        primaryModelName = editData.modelName || '未知模型';
      } else {
        setToast({ message: '请选择一个模型', type: 'error' });
        return;
      }

      // 构建ModelConfig数据
      const modelConfig = {
        useInternet: webSearch,
        mcpMode: mcpMode,
        useWorkflow: workflow,
        useConnection: linkEnabled,
        maxTokens: maxTokens,
        enableThinking: deepThinking,
        thinkingBudget: maxThoughtTokens,
        minP: minP,
        topP: topP,
        topK: topK,
        temperature: temperature,
        frequencyPenalty: returnGenerations,
        maxIter: maxIterations
      };

      // 构建保存数据
      const agentData = {
        ...(editMode && editData?.id && { id: editData.id }), // 编辑模式下包含ID
        name: agentName,
        description: agentDescription,
        prompt: agentPrompt,
        avatar: JSON.stringify({
          name: selectedAvatar,
          color: selectedAvatarColor
        }), // 保存头像信息为JSON字符串
        modelId: primaryModelId, // 选择的具体模型ID
        modelName: primaryModelName, // 模型显示名称
        connectId: selectedModel as string, // 连接配置ID
        mcpIds: selectedMcps,
        workflowIds: selectedWorkflows, // 添加工作流IDs
        connectIds: selectedConnects, // 添加连接IDs
        mcpmode: mcpMode, // 添加MCP模式到agentInfo
        modelConfig: modelConfig, // 添加模型配置数据
        createUser: 'system' // 这里可以从用户上下文获取
      };

      // 使用onSave回调处理保存逻辑，符合monorepo架构要求
      if (onSave) {
        const success = await onSave(agentData);

        if (success) {
          setToast({
            message: `智能体配置${editMode ? '更新' : '保存'}成功！`,
            type: 'success'
          });

          // 调用成功回调，刷新列表
          if (onSaveSuccess) {
            await onSaveSuccess();
          }

          // 延迟关闭模态框，让用户看到成功消息
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setToast({
            message: `${editMode ? '更新' : '保存'}失败，请重试`,
            type: 'error'
          });
        }
      } else {
        setToast({
          message: '保存功能未配置，请联系开发者',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        message: `${editMode ? '更新' : '保存'}失败，请检查网络连接`,
        type: 'error'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop>
      <PremiumModalContainer style={{ height: '90vh' }}>
        <ModalHeader>
          <PremiumTitleDesc>
            <h4>智能体配置</h4>
            <p>创建和配置您的专属AI智能体，打造个性化的智能助手</p>
          </PremiumTitleDesc>
          <CloseButton onClick={onClose} style={{ color: 'white' }}>×</CloseButton>
        </ModalHeader>

        <ModalContent style={{ height: 'calc(90vh - 80px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <TwoColumnLayout style={{ padding: '0 24px', flex: '1 1 auto', height: 'auto' }}>
            {/* 左列：头像和基本信息 */}
            <LeftColumn style={{ height: '100%', overflowY: 'auto', paddingRight: '12px', display: 'flex', flexDirection: 'column' }}>
              {/* 头像选择区域 */}
              <AvatarSection>
                <SelectedAvatar
                  onClick={() => setIsAvatarPanelOpen(true)}
                >
                  {React.cloneElement(getAvatarIcon(selectedAvatar) as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
                    style: { color: selectedAvatarColor, fontSize: '32px' }
                  })}
                </SelectedAvatar>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                  <FormInputNoborder
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="请输入智能体名称"
                  />
                  <FormInputNoborder
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    placeholder="请输入智能体的详细描述和功能说明"
                    type="text"
                    style={{
                      fontSize: '12px'
                    }}
                  />
                </div>
              </AvatarSection>

              {/* 基本信息区域 */}
              <FormSection style={{ flex: '1 1 auto' }}>
                <PremiumFormLabel>智能体提示语</PremiumFormLabel>
                <FormInput
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  placeholder="请输入智能体的系统提示语，用于指导AI的行为和回复风格"
                  as="textarea"
                  rows={10}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${theme.colors.border}`,
                    // color: theme.colors.textPrimary,
                    color:'#ffffff',
                    resize: 'vertical',
                    minHeight: '200px',
                    flex: '1 1 auto',
                    padding:'8px'
                  }}
                />

              </FormSection>
            </LeftColumn>
            {/* 右列：模型和MCP选择 */}
            <RightColumn style={{ height: '100%', paddingLeft: '12px', display: 'flex', flexDirection: 'column' }}>
              {/* 基本/高级切换按钮 */}
              <RightTopSection>
                <ButtonGroup
                  options={[
                    { key: 'basic', label: '能力集' },
                    { key: 'advanced', label: '参数' }
                  ]}
                  activeKey={configMode}
                  onChange={(key) => setConfigMode(key as 'basic' | 'advanced')}
                />
              </RightTopSection>

              {/* 根据当前模式显示不同组件 */}
              {configMode === 'basic' ? (
                /* 模型选择区域 - 基本模式 */
                <ModelSelectionArea
                  style={{ flex: '1 1 auto', minHeight: '0' }}
                  loading={loading}
                  error={error}
                  llmConnects={llmConnects}
                  selectedModel={selectedModel}
                  onModelSelect={(modelId) => {
                    // 使用当前点击的连接ID进行比较，避免状态异步更新问题
                    const newConnectId = modelId;
                    const currentSelectedModel = selectedModel;

                    // 只有当选择了不同的连接时，才清空已选择的模型
                    if (currentSelectedModel !== newConnectId) {
                      setSelectedModels([]);
                      setSystemModels([]); // 同时清空系统模型缓存
                      setModelSelectionCleared(true); // 标记模型选择已被清空
                    }
                    setSelectedModel(newConnectId);
                  }}
                  selectedModels={selectedModels}
                  selectedModelInfos={selectedModelInfos}
                  onModelsChange={setSelectedModels}
                  modelSelectionCleared={modelSelectionCleared}
                  onModelSelectionClear={() => setModelSelectionCleared(true)}
                  editMode={editMode}
                  editData={editData}
                  onSelectModel={handleSelectModel}
                  onAddModel={handleAddModelClick}
                  // MCP相关属性
                  mcpList={mcpConfigs}
                  selectedMcpIds={selectedMcps}
                  onMcpSelect={(mcpId) => {
                    setSelectedMcps(prev =>
                      prev.includes(mcpId)
                        ? prev.filter(id => id !== mcpId)
                        : [...prev, mcpId]
                    );
                  }}
                  // 工作流相关属性
                  workflowConfigs={workflowConfigs}
                  onFetchWorkflowConfigs={onFetchWorkflowConfigs}
                  selectedWorkflowIds={selectedWorkflows}
                  onWorkflowSelect={(workflowId) => {
                    setSelectedWorkflows(prev =>
                      prev.includes(workflowId)
                        ? prev.filter(id => id !== workflowId)
                        : [...prev, workflowId]
                    );
                  }}
                  // 连接相关属性
                  connectConfigs={connectConfigs}
                  // onFetchConnectConfigs={fetchConnectConfigs}
                  selectedConnectIds={selectedConnects}
                  onConnectSelect={(connectId) => {
                    setSelectedConnects(prev =>
                      prev.includes(connectId)
                        ? prev.filter(id => id !== connectId)
                        : [...prev, connectId]
                    );
                  }}
                />
              ) : (
                /* 模型配置区域 - 高级模式 */
                <ModelConfigArea
                  style={{ flex: '1 1 auto', minHeight: '0' }}
                  webSearch={webSearch}
                  onWebSearchChange={setWebSearch}
                  mcpMode={mcpMode}
                  onMcpModeChange={setMcpMode}
                  workflow={workflow}
                  onWorkflowChange={setWorkflow}
                  link={linkEnabled}
                  onLinkChange={setLinkEnabled}
                  deepThinking={deepThinking}
                  onDeepThinkingChange={setDeepThinking}
                  maxTokens={maxTokens}
                  onMaxTokensChange={setMaxTokens}
                  maxChainTokens={maxThoughtTokens}
                  onMaxChainTokensChange={setMaxThoughtTokens}
                  minP={minP}
                  onMinPChange={setMinP}
                  topP={topP}
                  onTopPChange={setTopP}
                  topK={topK}
                  onTopKChange={setTopK}
                  temperature={temperature}
                  onTemperatureChange={setTemperature}
                  generations={returnGenerations}
                  onGenerationsChange={setReturnGenerations}
                  maxIterations={maxIterations}
                  onMaxIterationsChange={setMaxIterations}
                />
              )}
            </RightColumn>
          </TwoColumnLayout>

          {/* 操作按钮区域 */}
          <FormButtonGroup style={{ flexShrink: 0, padding: '20px 24px 0 24px', justifyContent: 'space-between', display: 'flex', gap: '0px' }}>
            <PremiumFormButton
              $variant="primary"
              onClick={handleSave}
              style={{
                background: theme.colors.accent,
                border: 'none',
                fontWeight: '600',
                flex: '1',
                marginRight: '12px',
                height: '36px'
              }}
            >
              保存配置
            </PremiumFormButton>
            <PremiumFormButton
              $variant="secondary"
              onClick={onClose}
              style={{
                flex: '1',
                marginLeft: '12px',
                height: '36px'
              }}
            >
              取消
            </PremiumFormButton>
          </FormButtonGroup>
        </ModalContent>
      </PremiumModalContainer>
      {toast && (
        <ModalToastWrapper>
          <LiquidToast
            title={toast.type === 'success' ? '成功' : '错误'}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </ModalToastWrapper>
      )}

      {/* 模型选择弹窗 */}
      <ModelSelectorModal
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        models={systemModels.length > 0 ? systemModels : defaultSystemModels}
        selectedModels={selectedModels}
        onSelectModels={handleModelSelect}
        title="AI智能体模型选择"
        connectId={selectedModel}
        onFetchOnlineModels={handleFetchOnlineModels}
      />

      {/* 添加模型弹窗 */}
      <AddModelModal
        isOpen={showAddModelModal}
        onClose={() => setShowAddModelModal(false)}
        onAddModel={handleAddModel}
      />

      {/* LLM连接选择弹窗 */}
      <LLMConnectSelectorModal
        isOpen={showLLMConnectModal}
        onClose={() => setShowLLMConnectModal(false)}
        onConnectCreated={handleConnectCreated}
        onFetchLLMConnects={onFetchLLMConnects}
        onFetchConnectDetails={onFetchConnectDetails}
        onSaveConnect={onSaveConnect}
        onTestConnect={onTestConnect}
      />

      {/* 头像选择面板 */}
      {isAvatarPanelOpen && (
        <AvatarPanelModal onClick={(e) => e.target === e.currentTarget && setIsAvatarPanelOpen(false)}>
          <AvatarPanelContainer>
            <AvatarPanel
              selectedAvatar={selectedAvatar}
              selectedColor={selectedAvatarColor}
              onAvatarSelect={(avatarKey) => {
                setSelectedAvatar(avatarKey);
              }}
              onColorSelect={(color) => {
                setSelectedAvatarColor(color);
              }}
            />

            {/* <AvatarPanelActions>
              <FormButton
                $variant="primary"
                onClick={() => setIsAvatarPanelOpen(false)}
                style={{
                  background: theme.colors.accent,
                  border: 'none',
                  fontWeight: '600'
                }}
              >
                确认选择
              </FormButton>
              <FormButton
                $variant="secondary"
                onClick={() => setIsAvatarPanelOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white'
                }}
              >
                取消
              </FormButton>
            </AvatarPanelActions> */}
          </AvatarPanelContainer>
        </AvatarPanelModal>
      )}
    </ModalBackdrop>
  );
};