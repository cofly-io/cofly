import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

import {
  GlassListCards,
  ListCardButtons,
  ListCardIcons
} from '../../components/shared/ui-components';
import { ToolbarControls } from '../chat/ToolbarControls';
import { useGlobalConfirm } from '../../components/basic/GlobalConfirmManager';
import { useToast, ToastManager } from '../../components/basic/LiquidToast';
import { useTheme } from '../../context/ThemeProvider';
import { IConnectConfig } from '@repo/common';

// Models 标签容器
const ModelsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
`;

// 单个 Model 标签
const ModelTag = styled.span`
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 10px;
  color: rgba(147, 197, 253, 0.9);
  font-weight: 500;
  backdrop-filter: blur(4px);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Models 标题
const ModelsLabel = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-right: 6px;
  font-weight: 500;
`;


interface DeleteResult {
  success: boolean;
  error?: string;
  message?: string;
  errorType?: 'REFERENCED_BY_AGENTS' | 'GENERAL_ERROR';
}

interface ConnectListProps {
  connects: IConnectConfig[];
  activeTab: string;
  categories: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
  }>;
  onConnectClick?: (connectId: string) => void;
  onDeleteConnect?: (connectId: string) => Promise<DeleteResult | boolean>;
  onEditConnect?: (connect: IConnectConfig) => Promise<any> | any;
  onDebugConnect?: (connect: IConnectConfig) => Promise<{success: boolean; message?: string}> | void;
}

export const ConnectList: React.FC<ConnectListProps> = ({
  connects,
  activeTab,
  categories,
  // onConnectClick,
  onDeleteConnect,
  onEditConnect,
  onDebugConnect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('last-updated');
  const { theme } = useTheme();

  // 根据activeTab过滤连接
  const filteredConnects = useMemo(() => {
    let filtered = connects;

    // 如果不是"全部"标签，则按类型过滤
    if (activeTab !== 'all') {
      filtered = connects.filter(connect => connect.mType === activeTab);
    }

    // 根据搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(connect =>
        connect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (connect.mType && connect.mType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 排序
    if (sortBy === 'last-updated') {
      filtered = [...filtered].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [connects, activeTab, searchTerm, sortBy]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏区域 */}
      <ToolbarControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="搜索连接配置..."
        sortBy={sortBy}
        onSortChange={() => setSortBy(sortBy === 'last-updated' ? 'name' : 'last-updated')}
      />

      {/* 连接配置卡片区域 */}
      <div style={{
        flex: 1,
        padding: '0 30px',
        overflowY: 'auto',
        marginBottom: '20px'
      }}>
        {filteredConnects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: theme.page.colors.textSecondary
          }}>
            {activeTab === 'all' ? '暂无连接配置' : `暂无 ${categories.find(c => c.type === activeTab)?.name || activeTab} 类型的连接配置`}
          </div>
        ) : (
          filteredConnects.map((connect) => (
            <ConnectCard
              key={connect.id}
              connect={connect}
              categories={categories}
              //onConnectClick={onConnectClick}
              onDeleteConnect={onDeleteConnect}
              onEditConnect={onEditConnect}
              onDebugConnect={onDebugConnect}
            />
          ))
        )}
      </div>
    </div>
  );
};

// 连接配置卡片组件
interface ConnectCardProps {
  connect: IConnectConfig;
  categories: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
  }>;
  //onConnectClick?: (connectId: string) => void;
  onDeleteConnect?: (connectId: string) => void;
  onEditConnect?: (connect: IConnectConfig) => Promise<any> | any;
  onDebugConnect?: (connect: IConnectConfig) => Promise<{success: boolean; message?: string}> | void;
}

const ConnectCard: React.FC<ConnectCardProps> = ({
  connect,
  categories,
  //onConnectClick,
  onDeleteConnect,
  onEditConnect,
  onDebugConnect,
}) => {
  const { showConfirm } = useGlobalConfirm();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const { theme } = useTheme();
  const categoryName = categories.find(c => c.type === connect.mType)?.name || connect.mType;
  
  // 添加测试状态管理
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isTestLoading, setIsTestLoading] = useState(false);

  // 获取图标路径
  const getIconPath = (cType: string, mType?: string) => {
    return `/connects/${mType}/${cType}/${cType}.svg`;
  };

  // 处理测试连接
  const handleTestConnection = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTestLoading) return;
    
    setIsTestLoading(true);
    setTestStatus('testing');
    
    try {
      if (onDebugConnect) {
        const result = await onDebugConnect(connect);
        
        // 如果返回了结果对象，根据 success 字段判断
        if (result && typeof result === 'object' && 'success' in result) {
          if (result.success) {
            setTestStatus('success');
          } else {
            setTestStatus('error');
          }
        } else {
          // 如果没有返回结果，默认为成功（向后兼容）
          setTestStatus('success');
        }
      }
      
      // 3秒后重置状态
      setTimeout(() => {
        setTestStatus('idle');
      }, 5000);
      
    } catch (error) {
      console.error('❌ [ConnectList] 连接测试异常:', error);
      setTestStatus('error');
      
      // 3秒后重置状态
      setTimeout(() => {
        setTestStatus('idle');
      }, 3000);
    } finally {
      setIsTestLoading(false);
    }
  };

  // 获取测试按钮显示内容
  const getTestButtonContent = () => {
    switch (testStatus) {
      case 'testing':
        return '⏳ 测试中';
      case 'success':
        return '✅ 成功';
      case 'error':
        return '❌ 失败';
      default:
        return '⚙️ 测试';
    }
  };

  return (
    <>
      <ToastManager toasts={toasts} onRemove={removeToast} />
      <GlassListCards>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '16px' }}>
            {/* 连接图标 */}
            <ListCardIcons>
              <img
                src={getIconPath(connect.cType, connect.mType)}
                alt={categoryName}
                style={{ width: '38px', height: '38px' }}
                onError={(e) => {
                  // 如果图标加载失败，显示默认图标
                  const img = e.target as HTMLImageElement;
                  //const container = img.parentElement;
                  // if (container) {
                  //   container.innerHTML = '<span style="fontSize: 24px; color: rgba(255, 255, 255, 0.7)">🔗</span>';
                  // }
                }}
              />
            </ListCardIcons>
            {/* 连接信息 */}
            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: '0 0 5px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.page.colors.textPrimary
              }}>
                {connect.name}
              </h4>
              <div style={{
                fontSize: '13px',
                color: theme.page.colors.textSecondary,
                marginBottom: '8px'
              }}>
                类型：{categoryName}
              </div>
              <div style={{
                fontSize: '12px',
                color: theme.page.colors.textTertiary
              }}>
                创建时间：{new Date(connect.createdAt).toLocaleDateString()}
                {connect.creator && ` | 创建者：${connect.creator}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <ListCardButtons 
              onClick={handleTestConnection}
              disabled={isTestLoading}
              style={{
                opacity: isTestLoading ? 0.7 : 1,
                cursor: isTestLoading ? 'not-allowed' : 'pointer',
                backgroundColor: testStatus === 'success' ? 'rgba(34, 197, 94, 0.2)' : 
                                testStatus === 'error' ? 'rgba(239, 68, 68, 0.2)' : undefined,
                borderColor: testStatus === 'success' ? 'rgba(34, 197, 94, 0.3)' : 
                            testStatus === 'error' ? 'rgba(239, 68, 68, 0.3)' : undefined
              }}
            >
              {getTestButtonContent()}
            </ListCardButtons>
            {/* <button
            onClick={(e) => {
              e.stopPropagation();
              onDebugConnect?.(connect);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              padding: '2px 14px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            <RiLoader2Line /> 调试
          </button> */}
            <ListCardButtons onClick={async (e) => {
              e.stopPropagation();
              if (onEditConnect) {
                await onEditConnect(connect);
              }
            }}>
              ✏️ 编辑
            </ListCardButtons>
            <ListCardButtons onClick={async (e) => {
              e.stopPropagation();
              const confirmed = await showConfirm({
                title: '删除连接',
                message: `确定要删除连接 "${connect.name}" 吗？\n\n此操作不可撤销。`,
                confirmText: '删除',
                cancelText: '取消',
                triggerElement: e.currentTarget as HTMLElement,
                positioning: 'below-trigger'
              });
              if (confirmed) {
                try {
                  if (onDeleteConnect) {
                    const result = await (onDeleteConnect as (connectId: string) => Promise<DeleteResult | boolean>)(connect.id);

                    if (result && typeof result === 'object' && 'success' in result) {
                      // 新的返回格式，包含详细信息
                      const deleteResult = result as DeleteResult;
                      if (deleteResult.success) {
                        showSuccess('删除成功', deleteResult.message || '连接配置删除成功');
                      } else {
                        if (deleteResult.errorType === 'REFERENCED_BY_AGENTS') {
                          showError('删除失败', deleteResult.message || '该连接正在被智能体使用，无法删除');
                        } else {
                          showError('删除失败', deleteResult.error || '删除连接配置失败');
                        }
                      }
                    } else {
                      // 兼容旧的返回格式（boolean）
                      const boolResult = result as boolean;
                      if (boolResult) {
                        showSuccess('删除成功', '连接配置删除成功');
                      } else {
                        showError('删除失败', '删除连接配置失败');
                      }
                    }
                  } else {
                    showError('删除失败', '删除功能未实现');
                  }
                } catch (error) {
                  console.error('删除连接配置时发生错误:', error);
                  showError('删除失败', '网络错误，请稍后重试');
                }
              }
            }}>
              🗑️ 删除
            </ListCardButtons>
            {/* <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`确定要删除连接 "${connect.name}" 吗？`)) {
                onDeleteConnect?.(connect.id);
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.color = '#ff6b6b';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            🗑️ 删除
          </button> */}
          </div>
        </div>
      </GlassListCards>
    </>
  );
};