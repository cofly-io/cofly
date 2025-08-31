import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { McpToolsTab } from './tabs/McpToolsTab';
import { RelationWkTab   } from './tabs/RelationWkTab';
import { ConnetCreDentialTab } from './tabs/ConnetCreDentialTab';
import { getAllWorkflowConfigs } from '../../../../../src/services/workflowConfigService';
import { ConnectConfigService } from '../../../../../src/services/connectConfigService';

export interface McpConfig {
  id: string;
  name: string;
  type: string;
  mcpinfo: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface McpConfigState {
  configs: McpConfig[];
  loading: boolean;
  error: string | null;
  fetchConfigs: () => Promise<void>;
  saveConfig: (config: Omit<McpConfig, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteConfig: (id: string) => Promise<{ success: boolean; error?: string }>;
}

interface McpDrawerContentProps {
  mcpConfigState: McpConfigState;
  selectedNodeId?: string;
  selectedNodeDetails?: any;
  onResourcesChange?: (nodeId: string, resources: {
    mcpList: Array<{id: string, name: string, type?: string}>;
    workflowList: Array<{id: string, name: string, version?: string}>;
    connectList: Array<{id: string, name: string, ctype?: string}>;
  }) => void;
}

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TabHeader = styled.div`
  display: flex;
  margin: 0 25px;
  border-bottom: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  font-size: 14px;
  flex-shrink: 0;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: ${props => props.$active ? props.theme.colors.accent : props.theme.colors.textSecondary};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.accent : 'transparent'};
  transition: color 0.2s ease;
  font-weight: ${props => props.$active ? '400' : '200'};
  font-size: 14px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

type TabType = 'mcp-tools' | 'relation-wk' | 'connetCredential';

export const McpDrawerContent: React.FC<McpDrawerContentProps> = ({ 
  mcpConfigState, 
  selectedNodeId, 
  selectedNodeDetails,
  onResourcesChange 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('mcp-tools');
  
  // 使用 ref 来存储最新的回调函数，避免依赖项变化
  const onResourcesChangeRef = useRef(onResourcesChange);
  onResourcesChangeRef.current = onResourcesChange;

  // 使用 ref 来存储上一次的选中状态，避免重复更新
  const prevSelectionRef = useRef<{
    mcpIds: string[];
    workflowIds: string[];
    connectIds: string[];
    nodeId: string | null;
  }>({
    mcpIds: [],
    workflowIds: [],
    connectIds: [],
    nodeId: null
  });
  
  // 工作流配置状态
  const [workflowConfigs, setWorkflowConfigs] = useState<any[]>([]);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  
  // 连接配置状态
  const [connectConfigs, setConnectConfigs] = useState<any[]>([]);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // 选中状态管理
  const [selectedMcpIds, setSelectedMcpIds] = useState<string[]>([]);
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<string[]>([]);
  const [selectedConnectIds, setSelectedConnectIds] = useState<string[]>([]);

  // 当选中的节点改变时，从节点详情中加载已选中的资源
  useEffect(() => {
    if (selectedNodeId && selectedNodeDetails?.agentResources) {
      const resources = selectedNodeDetails.agentResources;
      // 从新的数据结构中提取id列表
       setSelectedMcpIds(resources.mcpList?.map((item: {id: string, name: string}) => item.id) || []);
       setSelectedWorkflowIds(resources.workflowList?.map((item: {id: string, name: string}) => item.id) || []);
       setSelectedConnectIds(resources.connectList?.map((item: {id: string, name: string}) => item.id) || []);
    } else {
      // 如果没有节点详情，清空选中状态
      setSelectedMcpIds([]);
      setSelectedWorkflowIds([]);
      setSelectedConnectIds([]);
    }
  }, [selectedNodeId, selectedNodeDetails]);

  // 获取工作流配置
  const fetchWorkflowConfigs = useCallback(async () => {
    setWorkflowLoading(true);
    setWorkflowError(null);
    try {
      const response = await getAllWorkflowConfigs();
      if (response.success && response.data) {
        setWorkflowConfigs(response.data);
      } else {
        setWorkflowError(response.error || '获取工作流配置失败');
        setWorkflowConfigs([]);
      }
    } catch (error) {
      setWorkflowError('网络错误，请检查连接');
      setWorkflowConfigs([]);
    } finally {
      setWorkflowLoading(false);
    }
  }, []);

  // 获取连接配置
  const fetchConnectConfigs = useCallback(async () => {
    setConnectLoading(true);
    setConnectError(null);
    try {
      const response = await ConnectConfigService.getConnectConfigs();
      if (response.success && response.data) {
        setConnectConfigs(response.data);
      } else {
        setConnectError(response.error || '获取连接配置失败');
        setConnectConfigs([]);
      }
    } catch (error) {
      setConnectError('网络错误，请检查连接');
      setConnectConfigs([]);
    } finally {
      setConnectLoading(false);
    }
  }, []);

  // 当切换到对应标签页时获取数据
  useEffect(() => {
    if (activeTab === 'relation-wk' && workflowConfigs.length === 0 && !workflowLoading) {
      fetchWorkflowConfigs();
    }
  }, [activeTab, workflowConfigs.length, workflowLoading, fetchWorkflowConfigs]);

  useEffect(() => {
    if (activeTab === 'connetCredential' && connectConfigs.length === 0 && !connectLoading) {
      fetchConnectConfigs();
    }
  }, [activeTab, connectConfigs.length, connectLoading, fetchConnectConfigs]);

  // 选中处理函数
  const handleMcpSelect = (mcpId: string) => {
    setSelectedMcpIds(prev => 
      prev.includes(mcpId) 
        ? prev.filter(id => id !== mcpId)
        : [...prev, mcpId]
    );
  };

  const handleWorkflowSelect = (workflowId: string) => {
    setSelectedWorkflowIds(prev => 
      prev.includes(workflowId) 
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const handleConnectSelect = (connectId: string) => {
    setSelectedConnectIds(prev => 
      prev.includes(connectId) 
        ? prev.filter(id => id !== connectId)
        : [...prev, connectId]
    );
  };



  // 监听选中状态变化，异步更新节点资源
  useEffect(() => {
    // 只有当有选中的节点ID时才更新
    if (!selectedNodeId) return;

    // 检查是否真的发生了变化
    const prevSelection = prevSelectionRef.current;
    const hasChanged = 
      prevSelection.nodeId !== selectedNodeId ||
      JSON.stringify(prevSelection.mcpIds) !== JSON.stringify(selectedMcpIds) ||
      JSON.stringify(prevSelection.workflowIds) !== JSON.stringify(selectedWorkflowIds) ||
      JSON.stringify(prevSelection.connectIds) !== JSON.stringify(selectedConnectIds);

    if (!hasChanged) return;

    // 更新 ref 中的值
    prevSelectionRef.current = {
      mcpIds: [...selectedMcpIds],
      workflowIds: [...selectedWorkflowIds],
      connectIds: [...selectedConnectIds],
      nodeId: selectedNodeId
    };

    // 使用 setTimeout 将更新延迟到下一个事件循环
    const timeoutId = setTimeout(() => {
      const currentCallback = onResourcesChangeRef.current;
      if (!currentCallback) return;

      // 构建包含id和name的对象列表
      const mcpList = selectedMcpIds.map(id => {
        const mcpConfig = mcpConfigState.configs.find(config => config.id === id);
        return {
          id,
          name: mcpConfig?.name || '',
          type: mcpConfig?.type
        };
      });

      const workflowList = selectedWorkflowIds.map(id => {
        const workflowConfig = workflowConfigs.find(config => config.id === id);
        return {
          id,
          name: workflowConfig?.name || '',
          version: workflowConfig?.version
        };
      });

      const connectList = selectedConnectIds.map(id => {
        const connectConfig = connectConfigs.find(config => config.id === id);
        return {
          id,
          name: connectConfig?.name || '',
          ctype: connectConfig?.ctype
        };
      });

      // 通知父组件更新节点详情
      currentCallback(selectedNodeId, {
        mcpList,
        workflowList,
        connectList
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [selectedMcpIds, selectedWorkflowIds, selectedConnectIds, selectedNodeId]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mcp-tools':
        return (
          <McpToolsTab 
            mcpConfigState={mcpConfigState}
            selectedMcpIds={selectedMcpIds}
            onMcpSelect={handleMcpSelect}
          />
        );
      case 'relation-wk':
        return (
          <RelationWkTab 
            workflowConfigs={workflowConfigs}
            loading={workflowLoading}
            error={workflowError}
            onRefresh={fetchWorkflowConfigs}
            selectedWorkflowIds={selectedWorkflowIds}
            onWorkflowSelect={handleWorkflowSelect}
          />
        );
      case 'connetCredential':
        return (
          <ConnetCreDentialTab 
            connectConfigs={connectConfigs}
            loading={connectLoading}
            error={connectError}
            onRefresh={fetchConnectConfigs}
            selectedConnectIds={selectedConnectIds}
            onConnectSelect={handleConnectSelect}
          />
        );
      default:
        return (
          <McpToolsTab 
            mcpConfigState={mcpConfigState}
            selectedMcpIds={selectedMcpIds}
            onMcpSelect={handleMcpSelect}
          />
        );
    }
  };

  return (
    <TabContainer>
      <TabHeader>
        <TabButton 
          $active={activeTab === 'mcp-tools'}
          onClick={() => setActiveTab('mcp-tools')}
        >
          MCP工具
        </TabButton>
        <TabButton 
          $active={activeTab === 'relation-wk'}
          onClick={() => setActiveTab('relation-wk')}
        >
          工作流
        </TabButton>
        <TabButton 
          $active={activeTab === 'connetCredential'}
          onClick={() => setActiveTab('connetCredential')}
        >
          连接
        </TabButton>
      </TabHeader>
      <TabContent>
        {renderTabContent()}
      </TabContent>
    </TabContainer>
  );
};