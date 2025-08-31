"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { InputSelect } from '../../controls/inputselect';
import { Switch } from '../../controls/switch';
import { SettingsCard } from './SettingsCard';
import {
  SettingsContainer,
  FormGroup,
  Label,
  Select,
  Button
} from './SharedStyles';

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const SwitchLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const HelpIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  color: rgba(59, 130, 246, 0.8);
  font-size: 12px;
  cursor: help;
  margin-left: 4px;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
  }
`;

const HelpText = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.4;
`;



const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  
  .message {
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .link {
    color: #3b82f6;
    text-decoration: underline;
    cursor: pointer;
    
    &:hover {
      color: #2563eb;
    }
  }
`;

interface ConnectConfig {
  id: string;
  name: string;
  ctype: string;
}

interface ModelOption {
  value: string;
  label: string;
}

interface BuiltinModelSettingsProps {
  onSave?: (settings: any) => void;
  onLoadModels?: (connectId: string) => Promise<ModelOption[]>;
  onLoadConnections?: () => Promise<ConnectConfig[]>;
  connections?: ConnectConfig[];
  onSaveSettings?: (tabkey: string, tabDetails: string) => Promise<boolean>;
  onNavigateToConnections?: () => void;
  builtinModelSettings?: {
    connectid?: string;
    model?: string;
    isAppend?: boolean;
  } | null;
  onShowToast?: {
    showSuccess: (title: string, message: string) => void;
    showError: (title: string, message: string) => void;
    showWarning: (title: string, message: string) => void;
  };
}

export const BuiltinModelSettings: React.FC<BuiltinModelSettingsProps> = ({ 
  onSave, 
  onLoadModels, 
  onLoadConnections, 
  connections: propConnections,
  onSaveSettings,
  onNavigateToConnections,
  builtinModelSettings,
  onShowToast
}) => {
  const [connections, setConnections] = useState<ConnectConfig[]>(propConnections || []);
  const [selectedConnection, setSelectedConnection] = useState<string>(builtinModelSettings?.connectid || '');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(builtinModelSettings?.model || '');
  const [isAppend, setIsAppend] = useState<boolean>(builtinModelSettings?.isAppend || false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  // 添加模型缓存
  const [modelsCache, setModelsCache] = useState<Record<string, ModelOption[]>>({});
  
  // 使用传入的Toast方法或默认的空函数
  const showSuccess = onShowToast?.showSuccess || (() => {});
  const showError = onShowToast?.showError || (() => {});
  const showWarning = onShowToast?.showWarning || (() => {});

  // 处理连接配置变更
  const handleConnectionChange = (connectionId: string) => {
    setSelectedConnection(connectionId);
    setSelectedModel(''); // 清空已选择的模型
    
    // 如果没有选择连接，清空模型列表
    if (!connectionId) {
      setModels([]);
    }
  };

  // 加载连接配置
  useEffect(() => {
    if (propConnections) {
      setConnections(propConnections);
    } else if (onLoadConnections) {
      const fetchConnections = async () => {
        try {
          const data = await onLoadConnections();
          setConnections(data);
        } catch (error) {
          console.error('获取连接配置失败:', error);
        }
      };
      fetchConnections();
    }
  }, [propConnections, onLoadConnections]);

  // 当builtinModelSettings变化时更新状态
  useEffect(() => {
    if (builtinModelSettings) {
      setSelectedConnection(builtinModelSettings.connectid || '');
      setSelectedModel(builtinModelSettings.model || '');
      setIsAppend(builtinModelSettings.isAppend || false);
    }
  }, [builtinModelSettings]);

  // 加载模型列表
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedConnection) {
        setModels([]);
        setSelectedModel('');
        return;
      }

      // 先检查缓存
      if (modelsCache[selectedConnection]) {
        setModels(modelsCache[selectedConnection]);
        return;
      }

      setLoading(true);
      try {
        if (onLoadModels) {
          const modelOptions = await onLoadModels(selectedConnection);
          setModels(modelOptions);
          // 将数据存入缓存
          setModelsCache(prev => ({
            ...prev,
            [selectedConnection]: modelOptions
          }));
        } else {
          setModels([]);
        }
      } catch (error) {
        console.error('获取模型列表失败:', error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [selectedConnection, connections, onLoadModels]);

  // 提交设置
  const handleSubmit = async () => {  
    if (!selectedConnection || !selectedModel) {
      showWarning('提示', '请选择连接配置和模型');
      return;
    }

    setLoading(true);
    try {
      const tabDetails = {
        connectid: selectedConnection,
        model: selectedModel,
        isAppend: isAppend
      };

      if (onSaveSettings) {
        const success = await onSaveSettings('builtin-model', JSON.stringify(tabDetails));
        if (success) {
          showSuccess('成功', '内置模型设置保存成功');
        } else {
          showError('失败', '内置模型设置保存失败');
        }
      } else {
        // 如果没有提供onSaveSettings回调，显示错误信息
        showError('配置错误', '缺少保存设置的服务配置，请联系管理员');
        return;
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      showError('错误', '保存设置时发生错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 跳转到连接页面
  const handleGoToConnections = () => {
    if (onNavigateToConnections) {
      onNavigateToConnections();
    } else {
      // 兼容旧版本，直接跳转
      window.location.href = '/workbench/connections';
    }
  };

  if (connections.length === 0) {
    return (
      <SettingsContainer>
        <SettingsCard
          title="内置模型"
          description="配置系统默认使用的AI模型，用于AI助手功能"
        >
          <EmptyState>
            <div className="message">
              您还未配置大模型连接，请点击
              <span className="link" onClick={handleGoToConnections}>
                [连接]
              </span>
              -[选择模型供应商]
            </div>
          </EmptyState>
        </SettingsCard>
      </SettingsContainer>
    );
  }

  return (
    <SettingsContainer>
      <SettingsCard
        title="内置模型"
        description="配置系统默认使用的AI模型，用于AI助手功能。"
      >
        <FormGroup>
          <Label>连接配置</Label>
          <Select
            value={selectedConnection}
            onChange={(e) => handleConnectionChange(e.target.value)}
            style={{fontSize:'12px'}}
          >
            <option value="">请选择连接配置</option>
            {connections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>模型选择</Label>
          <InputSelect
            options={models.map(model => model.value)}
            value={selectedModel}
            onChange={setSelectedModel}
            placeholder="请先选择连接配置"
            disabled={!selectedConnection || loading}
            style={{fontSize:'12px'}}
          />
        </FormGroup>

        <FormGroup>
          <SwitchContainer>
            <SwitchLabel>是否追加</SwitchLabel>
            <Switch
              value={isAppend}
              onChange={setIsAppend}
            />
            <HelpIcon
              onClick={() => setShowHelp(!showHelp)}
              title="点击查看说明"
            >
              ?
            </HelpIcon>
          </SwitchContainer>
          {showHelp && (
            <HelpText>
              AI辅助依据您输入的内容生成新内容，新内容是否覆盖你填写的内容。
            </HelpText>
          )}
        </FormGroup>

        <Button
          onClick={handleSubmit}
          disabled={loading || !selectedConnection || !selectedModel}
        >
          {loading ? '获取模型' : '提交'}
        </Button>
      </SettingsCard>
    </SettingsContainer>
  );
};

export default BuiltinModelSettings;