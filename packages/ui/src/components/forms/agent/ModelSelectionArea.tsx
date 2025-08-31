import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PremiumEmptyModelMessage } from '../../shared/ModelSectionComponents';
import { FormField } from '../../basic';
import { ButtonGroup } from '../../basic/ButtonGroup';
import type { ModelInfo } from '@repo/common';
import type { ButtonOption } from '../../basic/ButtonGroup';
import { RiLoopLeftLine } from "react-icons/ri";
import { SlOrganization } from "react-icons/sl";
import { VscTools } from "react-icons/vsc";
import { HiOutlineLink } from "react-icons/hi2";
import { TbDatabaseCog } from "react-icons/tb";



// 模型选择区域
const ModelSelectionContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);  
  //border-top:none;
  padding: 8px 18px;
  border-radius:0px 0px 8px 8px;
`;


const ModelCardsContainer = styled.div`
  position: relative;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px;
  /* 根据模态框宽度(90vw)计算：右列占一半(45vw) - ModelSelectionArea的左右padding(36px) - TwoColumnLayout的gap一半(12px) */
  width: calc(45vw - 80px);

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    height: 16px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const ModelCard = styled.div<{ $selected: boolean }>`
  position: relative;
  flex: 0 0 160px;
  width: 160px;
  height: 70px;
  padding: 7px;
  background: ${props => props.$selected
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(255, 255, 255, 0.08)'
  };
  border: 1px solid ${props => props.$selected
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(255, 255, 255, 0.15)'
  };
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  box-shadow: ${props => props.$selected
    ? '0 8px 32px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.05) inset'
    : 'none'
  };
  
  &:hover {
    background: ${props => props.$selected
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'
  };
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  ${props => props.$selected && `
    &::before {
      content: '✔';
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(34, 197, 94, 0.9);
      color: white;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      z-index: 1;
    }
  `}
`;

const ModelIcon = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  border-radius: 50%;
  padding:4px;
  background: #ffffff60;
  border: 1px solid rgba(255, 255, 255, 0.2);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 0 auto;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ModelInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  width: 100%;
  text-align: center;
  margin-top: 8px;
`;

const ModelName = styled.div`
  color: white;
  font-weight: 400;
  font-size: 13px;
  margin-bottom: 2px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const McpTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  border-bottom:1px solid #ffffff20;
`;



const McpCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-height: 343px;
  overflow-y: auto;
  padding: 2px;
  /* 响应式布局 */
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const McpCard = styled.div<{ selected?: boolean }>`
  background: ${props => props.selected
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
    : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.selected
    ? 'rgba(34, 197, 94, 0.4)'
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  min-height: 60px;

  &:hover {
    background: ${props => props.selected
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.15) 100%)'
    : 'rgba(255, 255, 255, 0.08)'};
    border-color: ${props => props.selected
    ? 'rgba(34, 197, 94, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'};
  }

  ${props => props.selected && `
    &::before {
      content: '✓';
      position: absolute;
      top: 8px;
      right: 8px;
      color: rgba(34, 197, 94, 0.8);
      font-weight: bold;
      font-size: 14px;
    }
  `}
`;

const WorkflowCard = styled.div<{ selected?: boolean }>`
  background: ${props => props.selected
    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)'
    : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.selected
    ? 'rgba(59, 130, 246, 0.4)'
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  min-height: 60px;

  &:hover {
    background: ${props => props.selected
    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)'
    : 'rgba(255, 255, 255, 0.08)'};
    border-color: ${props => props.selected
    ? 'rgba(59, 130, 246, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'};
  }

  ${props => props.selected && `
    &::before {
      content: '✓';
      position: absolute;
      top: 8px;
      right: 8px;
      color: rgba(59, 130, 246, 0.8);
      font-weight: bold;
      font-size: 14px;
    }
  `}
`;

const ConnectCard = styled.div<{ selected?: boolean }>`
  background: ${props => props.selected
    ? 'linear-gradient(135deg, rgba(248, 115, 226, 0.2) 0%, rgba(241, 50, 168, 0.1) 100%)'
    : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.selected
    ? 'rgba(168, 85, 247, 0.4)'
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  min-height: 60px;

  &:hover {
    background: ${props => props.selected
    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)'
    : 'rgba(255, 255, 255, 0.08)'};
    border-color: ${props => props.selected
    ? 'rgba(168, 85, 247, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'};
  }

  ${props => props.selected && `
    &::before {
      content: '✓';
      position: absolute;
      top: 8px;
      right: 8px;
      color: rgba(168, 85, 247, 0.8);
      font-weight: bold;
      font-size: 14px;
    }
  `}
`;

const ToolIcon = styled.div`
  width: 31px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 1.6rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  flex-shrink: 0;
`;

const McpInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const McpName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
`;

const ConnectInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConnectName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
  line-height: 1.2;
`;

const ConnectDescription = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ConnectCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-height: 343px;
  overflow-y: auto;
  padding: 2px;

  /* 响应式布局 */
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const McpType = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EmptyContainer = styled.div`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 20px;
  font-size: 12px;
  grid-column: 1 / -1;
`;


interface LLMConnect {
  id: string;
  name: string;
  ctype: string;
  mtype?: string;
}

interface ModelSelectionAreaProps {
  // 基本配置
  loading?: boolean;
  error?: string | null;

  // 连接相关
  llmConnects: LLMConnect[];
  selectedModel: string | null;
  onModelSelect: (modelId: string) => void;

  // 模型相关
  selectedModels: string[];
  selectedModelInfos: ModelInfo[];
  onModelsChange: (models: string[]) => void;
  modelSelectionCleared: boolean;
  onModelSelectionClear: () => void;

  // 编辑模式
  editMode?: boolean;
  editData?: {
    modelId?: string;
    modelName?: string;
    connectId?: string;
    connectid?: string;
  } | null;

  // 操作回调
  onSelectModel: () => void;
  onAddModel: () => void;

  // MCP相关属性
  mcpList?: any[];
  selectedMcpIds?: string[];
  onMcpSelect?: (mcpId: string) => void;

  // 工作流相关
  workflowConfigs?: any[];
  onFetchWorkflowConfigs?: () => Promise<any[]>;
  selectedWorkflowIds?: string[];
  onWorkflowSelect?: (workflowId: string) => void;

  // 连接相关
  connectConfigs?: any[];

  // 连接相关属性
  selectedConnectIds?: string[];
  onConnectSelect?: (connectId: string) => void;

  // 样式
  style?: React.CSSProperties;
  className?: string;
}

export const ModelSelectionArea: React.FC<ModelSelectionAreaProps> = ({
  loading = false,
  error = null,
  llmConnects,
  selectedModel,
  onModelSelect,
  selectedModels,
  selectedModelInfos,
  onModelsChange,
  modelSelectionCleared,
  onModelSelectionClear,
  editMode = false,
  editData,
  onSelectModel,
  onAddModel,
  // MCP相关属性
  mcpList = [],
  selectedMcpIds = [],
  onMcpSelect,
  // 工作流相关属性
  workflowConfigs = [],
  selectedWorkflowIds = [],
  onWorkflowSelect,
  // 连接相关属性
  connectConfigs = [],
  selectedConnectIds: propSelectedConnectIds = [],
  onConnectSelect,
  style,
  className
}) => {
  // Tab状态管理
  const [activeTab, setActiveTab] = useState<'mcp' | 'workflow' | 'connect'>('mcp');
  
  // 添加activeTab变化的日志
  useEffect(() => {
    console.log('🔄 activeTab changed to:', activeTab);
  }, [activeTab]);

  // Tab选项配置
  const tabOptions: ButtonOption[] = [
    { key: 'mcp', label: 'MCP工具' },
    { key: 'workflow', label: '工作流' },
    { key: 'connect', label: '连接' }
  ];

  // 连接选择处理函数
  const handleConnectSelect = (connectId: string) => {
    if (onConnectSelect) {
      onConnectSelect(connectId);
    } else {
      console.warn('onConnectSelect is not provided');
    }
  };

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

    // 默认返回原始顺序
    return llmConnects;
  }, [llmConnects, selectedModel, editMode, editData]);

  const handleRemoveSelectedModel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onModelsChange([]);
    onModelSelectionClear();
  };

  return (
    <ModelSelectionContainer style={style} className={className}>
      {loading ? (
        <div style={{ fontSize: "12px", color: 'white', textAlign: 'center', padding: '20px' }}>
          <RiLoopLeftLine /> 正在加载模型...
        </div>
      ) : error ? (
        <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '20px' }}>
          ⚠️ {error}
        </div>
      ) : (
        <>
          <FormField>
            <ModelCardsContainer>
              {llmConnects.length === 0 ? (
                <EmptyContainer style={{ fontSize: '14px' }}>
                  暂无可用的LLM模型配置
                </EmptyContainer>
              ) : (
                <>
                  {getOrderedConnects.map((connect, index) => (
                    <ModelCard
                      key={`connect-${connect.id || index}`}
                      $selected={selectedModel === connect.id}
                      onClick={() => onModelSelect(connect.id)}
                      title={connect.name}
                    >
                      <ModelIcon>
                        <img src={`/connects/llm/${connect.ctype}/${connect.ctype}.svg`} alt={connect.ctype} />
                      </ModelIcon>
                      <ModelInfo>
                        <ModelName title={connect.name}>{connect.name}</ModelName>
                      </ModelInfo>
                    </ModelCard>
                  ))}
                </>
              )}
              {/* 添加新模型的空框 */}
              <ModelCard
                $selected={false}
                onClick={() => {
                  // TODO: 实现添加新模型的逻辑
                }}
                title="添加新模型"
                style={{
                  border: '1px dashed rgba(255, 255, 255, 0.25)',
                  backgroundColor: 'transparent',
                  maxWidth: '100px'
                }}
              >
                <ModelIcon>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    +
                  </div>
                </ModelIcon>
                <ModelInfo>
                  <ModelName style={{ color: 'rgba(255, 255, 255, 0.6)' }}>模型链接</ModelName>
                </ModelInfo>
              </ModelCard>
            </ModelCardsContainer>
          </FormField>

          {/* 模型操作区域 */}
          <div style={{ marginTop: '16px' }}>
            <PremiumEmptyModelMessage style={{
              marginTop: '0',
              textAlign: 'center',
              fontSize: '14px',
              maxHeight: '204px',
              minHeight: 'auto',
            }}>
              {(() => {
                const hasSelectedModels = selectedModels.length > 0;
                const hasModelInfos = selectedModelInfos.length > 0;
                return hasSelectedModels && hasModelInfos;
              })() ? (
                <div style={{
                  marginTop: '-10px',
                  height: '31px'
                }}>
                  <div style={{ paddingRight: '30px' }}>
                    {selectedModelInfos.map((model, index) => (
                      <div key={`selected-model-${model.id || index}`} style={{ marginBottom: index < selectedModelInfos.length - 1 ? '10px' : '0' }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'rgba(255, 255, 255, 0.95)',
                          marginBottom: '0px'
                        }}>
                          {model.name}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: 'rgba(255, 255, 255, 0.7)'
                        }}>
                          {model.id}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleRemoveSelectedModel}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '0px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s',
                      zIndex: 1000,
                      minWidth: '24px',
                      minHeight: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.background = 'rgba(252, 252, 252, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : editMode && editData?.modelId && editData?.modelName && !modelSelectionCleared ? (
                // 编辑模式下显示已保存的模型信息
                <div style={{
                  position: 'relative',
                  padding: '8px 12px',
                  width: '100%',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '18px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '6px',
                }}>
                  <div style={{ paddingRight: '30px' }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'rgba(255, 255, 255, 0.95)',
                      marginBottom: '2px'
                    }}>
                      {editData.modelName}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      {editData.modelId}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(34, 197, 94, 0.8)',
                      marginTop: '4px'
                    }}>
                      ✓ 已保存的模型
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveSelectedModel}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s',
                      zIndex: 1000,
                      minWidth: '24px',
                      minHeight: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#dc2626';
                      e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    title="重新选择模型"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  请选择上方大模型凭证，再
                  <span
                    onClick={onSelectModel}
                    style={{
                      color: '#60a5fa',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginRight: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#60a5fa';
                    }}
                  >
                    选择模型
                  </span>
                  或
                  <span
                    onClick={onAddModel}
                    style={{
                      color: '#60a5fa',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginLeft: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#60a5fa';
                    }}
                  >
                    添加模型
                  </span>
                  来增加模型
                </div>
              )}
            </PremiumEmptyModelMessage>
          </div>

          {/* MCP工具、工作流和连接Tab区域 */}
          <div style={{ marginTop: '14px' }}>
            <McpTitleRow>
              <ButtonGroup
                options={tabOptions}
                activeKey={activeTab}
                activeBackground='#ffffff80'
                onChange={(key) => setActiveTab(key as 'mcp' | 'workflow' | 'connect')}
              />
            </McpTitleRow>

            {activeTab === 'mcp' && (
              <McpCardsContainer>
                {mcpList && mcpList.length > 0 ? (
                  mcpList.map((mcp, index) => (
                    <McpCard
                      key={`mcp-${mcp.id || index}`}
                      selected={selectedMcpIds.includes(mcp.id)}
                      onClick={() => onMcpSelect?.(mcp.id)}
                    >
                      <ToolIcon>
                        <VscTools size={16} />
                      </ToolIcon>
                      <McpInfo>
                        <McpName title={mcp.name || 'Unknown MCP'}>{mcp.name || 'Unknown MCP'}</McpName>
                        <McpType>{mcp.type || 'MCP'}</McpType>
                      </McpInfo>
                    </McpCard>
                  ))
                ) : (
                  <EmptyContainer key="mcp-empty-state">
                    <HiOutlineLink />暂无可用的MCP工具
                  </EmptyContainer>
                )}
              </McpCardsContainer>
            )}

            {activeTab === 'workflow' && (
              <McpCardsContainer>
                {workflowConfigs && workflowConfigs.length > 0 ? (
                  workflowConfigs.map((workflow, index) => (
                    <WorkflowCard
                      key={`workflow-${workflow.id || index}`}
                      selected={selectedWorkflowIds.includes(workflow.id)}
                      onClick={() => onWorkflowSelect?.(workflow.id)}
                    >
                      <ToolIcon>
                        <SlOrganization size={16} />
                      </ToolIcon>
                      <McpInfo>
                        <McpName title={workflow.name || 'Unknown Workflow'}>{workflow.name || 'Unknown Workflow'}</McpName>
                        {/* <McpType>{'WORKFLOW'}</McpType> */}
                      </McpInfo>
                    </WorkflowCard>
                  ))
                ) : (
                  <EmptyContainer key="workflow-empty-state">
                    <HiOutlineLink />暂无可用的工作流
                  </EmptyContainer>
                )}
              </McpCardsContainer>
            )}

            {activeTab === 'connect' && (
              <ConnectCardsContainer>
                {connectConfigs && connectConfigs.length > 0 ? (
                  connectConfigs.map((connect, index) => (
                    <ConnectCard
                      key={`connect-config-${connect.id || index}`}
                      selected={propSelectedConnectIds.includes(connect.id)}
                      onClick={() => handleConnectSelect(connect.id)}
                    >
                      <ToolIcon>
                        <TbDatabaseCog size={16} />
                      </ToolIcon>
                      <ConnectInfo>
                        <ConnectName title={connect.name || 'Unknown Connect'}>{connect.name || 'Unknown Connect'}</ConnectName>
                        <ConnectDescription title={connect.description || ''}>{connect.description || '暂无描述'}</ConnectDescription>
                      </ConnectInfo>
                    </ConnectCard>
                  ))
                ) : (
                  <EmptyContainer key="connect-empty-state">
                    <HiOutlineLink /> 暂无可用的数据库连接
                  </EmptyContainer>
                )}
              </ConnectCardsContainer>
            )}
          </div>
        </>
      )}
    </ModelSelectionContainer>
  );
};

export default ModelSelectionArea;
export type { ModelSelectionAreaProps, LLMConnect };