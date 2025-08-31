import React, { useState, useMemo, useCallback, useEffect } from 'react';
// 使用液态玻璃样式
import { ToolbarControls } from '../chat/ToolbarControls';
import ChatDisplay from '../chat/ChatDisplay';
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useGlobalConfirm } from '../../components/basic/GlobalConfirmManager';
import { useToast, ToastManager } from '../../components/basic/LiquidToast';
import { useTheme } from '../../context/ThemeProvider';
import {
  EditContainer,
  DrawerBackdrop,
  DrawerContainer,
  DrawerHeader,
  HeaderTitle,
  CloseButton,
  DrawerContent,
  ResizeHandle,
  ShareContainer,
} from './agent-styles';
import { CoButton } from '@repo/ui/';
// 导入头像工具
import { getAvatarIcon } from '../../utils/avatarUtils';
// 导入对话图标
import { AgentConfig } from '@repo/common';
import { FaUserEdit } from "react-icons/fa";
import { BiConversation } from "react-icons/bi";
import { FiShare2, FiExternalLink } from "react-icons/fi";
import { AgentShareModal } from '../../components/modals/AgentShareModal';
import { Tooltip } from '../../components/basic';

interface AgentListProps {
  agents: AgentConfig[];
  activeTab: string;
  onAgentClick?: (agentId: string) => void;
  onDeleteAgent?: (agentId: string) => Promise<boolean>;
  onEditAgent?: (agent: AgentConfig) => void;
  onDebugAgent?: (agent: AgentConfig) => void;
  onShareAgent?: (agentId: string) => void;
  onOpenAgent?: (agentId: string) => void;
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

export const AgentList: React.FC<AgentListProps> = ({
  agents,
  activeTab,
  onAgentClick,
  onDeleteAgent,
  onEditAgent,
  onDebugAgent,
  onShareAgent,
  onOpenAgent,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('last-updated');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [drawerWidth, setDrawerWidth] = useState(window.innerWidth * 0.8);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWidth, setDragStartWidth] = useState(0);
  const [baseDrawerWidth, setBaseDrawerWidth] = useState(window.innerWidth * 0.8); // 基础抽屉宽度
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAgentId, setShareAgentId] = useState<string | null>(null);

  const { showConfirm } = useGlobalConfirm();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { theme } = useTheme();

  // 处理分享智能体
  const handleShareAgent = useCallback((agentId: string) => {
    if (onShareAgent) {
      onShareAgent(agentId);
    } else {
      // 如果没有传入onShareAgent，使用本地模态窗实现
      setShareAgentId(agentId);
      setIsShareModalOpen(true);
    }
  }, [onShareAgent]);

  // 处理打开智能体
  const handleOpenAgent = useCallback((agentId: string) => {
    if (onOpenAgent) {
      onOpenAgent(agentId);
    } else {
      // 默认行为：在新窗口打开分享链接
      const shareUrl = `${window.location.origin}/copilot?agent=${agentId}`;
      window.open(shareUrl, '_blank');
    }
  }, [onOpenAgent]);


  // 关闭分享模态窗
  const handleCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
    setShareAgentId(null);
  }, []);

  // 处理删除智能体
  const handleDeleteAgent = async (agentId: string) => {
    const confirmed = await showConfirm({
      title: '删除智能体',
      message: '确定要删除这个智能体吗？删除后将无法恢复。',
      confirmText: '删除',
      cancelText: '取消'
    });

    if (confirmed) {
      try {
        // 调用父组件的删除函数，等待其完成
        const success = onDeleteAgent ? await onDeleteAgent(agentId) : false;

        if (success) {
          showSuccess('成功', '智能体删除成功');
        } else {
          showError('删除失败', '删除智能体失败');
        }
      } catch (error) {
        console.error('删除智能体失败:', error);
        showError('网络错误', '删除智能体失败');
      }
    }
  };

  // 根据activeTab过滤智能体
  const filteredAgents = useMemo(() => {
    let filtered = agents;

    // 根据搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.mcpTools?.some(mcp => mcp.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [agents, searchTerm, sortBy]);

  // 处理抽屉打开
  const handleChatClick = (agent: AgentConfig) => {
    // console.log('🔍 handleChatClick 调用:', {
    //   clickedAgent: { id: agent.id, name: agent.name },
    //   currentSelectedAgent: selectedAgent ? { id: selectedAgent.id, name: selectedAgent.name } : null,
    //   isDrawerOpen,
    //   streamMessages: streamMessages?.length || 0
    // });

    // 如果切换到不同的agent，清空会话
    if (selectedAgent && selectedAgent.id !== agent.id && onStartNewChat) {
      //console.log('🧹 切换到不同agent，清空会话状态');
      onStartNewChat();
    } else if (selectedAgent && selectedAgent.id === agent.id) {
      //console.log('🔄 点击相同agent，保持会话状态');
    } else {
      //console.log('🆕 首次选择agent');
    }

    // 如果点击的是当前已选中的agent，直接打开抽屉，不清空状态
    setSelectedAgent(agent);
    setIsDrawerOpen(true);
    const initialWidth = window.innerWidth * 0.7;
    setBaseDrawerWidth(initialWidth);
    setDrawerWidth(initialWidth);
  };

  // 处理抽屉关闭
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  // 处理历史面板切换
  const handleHistoryToggle = (isVisible: boolean, historyWidth: number) => {
    if (isVisible) {
      setDrawerWidth(baseDrawerWidth + historyWidth);
    } else {
      setDrawerWidth(baseDrawerWidth);
    }
  };

  // 处理拖拽调整抽屉宽度
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartWidth(drawerWidth);
  }, [drawerWidth]);

  // 处理鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = dragStartX - e.clientX;
        //拖拽最大宽度为窗口宽度的85%
        const newWidth = Math.max(400, Math.min(window.innerWidth * 0.85, dragStartWidth + deltaX));
        setDrawerWidth(newWidth);
        setBaseDrawerWidth(newWidth); // 更新基础宽度
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartWidth]);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = window.innerWidth * 0.9;
      if (drawerWidth > maxWidth) {
        setDrawerWidth(maxWidth);
      }
      if (baseDrawerWidth > maxWidth) {
        setBaseDrawerWidth(maxWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawerWidth, baseDrawerWidth]);

  return (
    <>
      <ToolbarControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={() => setSortBy(sortBy === 'last-updated' ? 'name' : 'last-updated')}
      />

      <div style={{
        flex: 1,
        padding: '0 30px',
        overflowY: 'auto',
        marginBottom: '20px'
      }}>
        {(() => {
          if (filteredAgents.length === 0) {
            return (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: theme.page.colors.textSecondary
              }}>
                暂无智能体
              </div>
            );
          } else {
            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
                justifyContent: 'start'
              }}>
                {filteredAgents.map((agent, index) => {
                  return (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onAgentClick={onAgentClick}
                      onDeleteAgent={handleDeleteAgent}
                      onEditAgent={onEditAgent}
                      onDebugAgent={onDebugAgent}
                      onChatClick={handleChatClick}
                      onShareAgent={handleShareAgent}
                      onOpenAgent={handleOpenAgent}
                    />
                  );
                })}
              </div>
            );
          }
        })()}
      </div>

      {/* 聊天抽屉 */}
      <DrawerBackdrop $isOpen={isDrawerOpen} onClick={handleDrawerClose} />
      <DrawerContainer $isOpen={isDrawerOpen} $width={drawerWidth}>
        <ResizeHandle onMouseDown={handleMouseDown} />
        <DrawerHeader>
          <HeaderTitle>
            <BiConversation size={20} color={theme.colors.textSecondary} />
            与 <h4>{selectedAgent?.name}</h4> 对话
          </HeaderTitle>
          <CloseButton onClick={handleDrawerClose}>×</CloseButton>
        </DrawerHeader>
        <DrawerContent>
          {selectedAgent && (
            <ChatDisplay
              // 流式聊天相关 props
              streamMessages={streamMessages}
              streamIsLoading={streamIsLoading}
              threadId={threadId}
              isLoadingThread={isLoadingThread}
              onStreamSendMessage={onStreamSendMessage}
              onLoadThread={onLoadThread}
              onSetAgent={onSetAgent}
              onStartNewChat={onStartNewChat}

              // 配置相关 props
              agentId={selectedAgent.id}
              userId={userId}
              agentName={selectedAgent.name}
              agentAvatar={
                typeof selectedAgent.avatar === 'string'
                  ? selectedAgent.avatar
                  : typeof selectedAgent.avatar === 'object' && selectedAgent.avatar?.name
                    ? selectedAgent.avatar.name
                    : undefined
              }
              avatar={(() => {
                // 解析agent的avatar配置
                const getAvatarConfig = () => {
                  try {
                    if (!selectedAgent.avatar) {
                      return { name: 'user', color: theme.mode === 'dark' ? '#FFFFFF' : '#1f2937' };
                    }

                    // 如果是字符串，尝试解析为JSON
                    if (typeof selectedAgent.avatar === 'string') {
                      const parsed = JSON.parse(selectedAgent.avatar);
                      return {
                        name: parsed.name || 'user',
                        color: parsed.color || (theme.mode === 'dark' ? '#FFFFFF' : '#1f2937')
                      };
                    }

                    // 如果已经是对象
                    if (typeof selectedAgent.avatar === 'object' && selectedAgent.avatar !== null) {
                      return {
                        name: selectedAgent.avatar.name || 'user',
                        color: selectedAgent.avatar.color || (theme.mode === 'dark' ? '#FFFFFF' : '#1f2937')
                      };
                    }

                    return { name: 'user', color: theme.mode === 'dark' ? '#FFFFFF' : '#1f2937' };
                  } catch (error) {
                    console.error('解析avatar字段失败:', error);
                    return { name: 'user', color: theme.mode === 'dark' ? '#FFFFFF' : '#1f2937' };
                  }
                };

                const avatarConfig = getAvatarConfig();
                const avatarIcon = getAvatarIcon(avatarConfig.name);

                // 返回带有颜色样式的头像元素
                return (
                  <div style={{
                    color: avatarConfig.color,
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: `drop-shadow(0 0 6px ${avatarConfig.color}40)`,
                    textShadow: `0 0 10px ${avatarConfig.color}50`
                  }}>
                    {avatarIcon}
                  </div>
                );
              })()}
              onHistoryToggle={handleHistoryToggle}
            />
          )}
        </DrawerContent>
      </DrawerContainer>
      <ToastManager toasts={toasts} onRemove={removeToast} />

      {/* 分享模态窗 */}
      <AgentShareModal
        isOpen={isShareModalOpen}
        agentId={shareAgentId || ''}
        onClose={handleCloseShareModal}
      />
    </>
  );
};

// 智能体卡片组
interface AgentCardProps {
  agent: AgentConfig;
  onAgentClick?: (agentId: string) => void;
  onDeleteAgent?: (agentId: string) => void;
  onEditAgent?: (agent: AgentConfig) => void;
  onDebugAgent?: (agent: AgentConfig) => void;
  onChatClick?: (agent: AgentConfig) => void;
  onShareAgent?: (agentId: string) => void;
  onOpenAgent?: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onAgentClick,
  onDeleteAgent,
  onEditAgent,
  onDebugAgent,
  onChatClick,
  onShareAgent,
  onOpenAgent,
}) => {
  const { theme } = useTheme();

  // 解析avatar字段，获取头像图标和颜色
  const getAvatarConfig = () => {
    try {
      if (!agent.avatar) {
        return { name: 'user', color: theme.mode === 'dark' ? '#FFFFFF' : '#1f2937' };
      }

      // 如果是字符串，尝试解析为JSON
      if (typeof agent.avatar === 'string') {
        const parsed = JSON.parse(agent.avatar);
        return {
          name: parsed.name || 'user',
          color: parsed.color || (theme.mode === 'dark' ? '#FFFFFF' : '#1f2937')
        };
      }

      // 如果已经是对象
      if (typeof agent.avatar === 'object' && agent.avatar !== null) {
        return {
          name: agent.avatar.name || 'user',
          color: agent.avatar.color || (theme.mode === 'dark' ? '#FFFFFF' : '#1f2937')
        };
      }

      return { name: 'user', color: theme.mode === 'dark' ? '#FFFFFF' : '#1f2937' };
    } catch (error) {
      console.error('解析avatar字段失败:', error);
      return { name: 'user', color: theme.mode === 'dark' ? '#FFFFFF' : '#1f2937' };
    }
  };

  const avatarConfig = getAvatarConfig();
  const avatarIcon = getAvatarIcon(avatarConfig.name);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onChatClick?.(agent);
      }}
      style={{
        width: '240px',
        height: '340px',
        background: theme.mode === 'dark'
          ? `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(19, 29, 173, 0.15) 100%)`
          : `linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%)`,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '12px',
        padding: '0px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        position: 'relative',
        marginTop: '20px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        boxShadow: theme.mode === 'dark'
          ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      }}
    >
      {/* 装饰性背景渐变 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: `linear-gradient(135deg, ${avatarConfig.color}15 0%, transparent 100%)`,
        borderRadius: '20px 20px 0 0',
        zIndex: 0
      }}></div>

      {/* 底部装饰线 */}
      <div style={{
        position: 'absolute',
        bottom: '60px',
        left: '20px',
        right: '20px',
        height: '1px',
        background: `linear-gradient(90deg, transparent 0%, ${avatarConfig.color}50 50%, transparent 100%)`,
        zIndex: 0
      }}></div>

      {/* 智能体图标 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '18px',
        position: 'relative',
        zIndex: 2,
        marginTop: '12px'
      }}>
        {/* 图标背景光环 */}
        <div style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${avatarConfig.color}15 0%, transparent 70%)`,
          border: `2px solid ${avatarConfig.color}30`,
          zIndex: 0
        }}></div>
        {/* 图标本体 */}
        <div style={{
          color: avatarConfig.color,
          fontSize: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          position: 'relative',
          filter: `drop-shadow(0 0 10px ${avatarConfig.color}40)`,
          textShadow: `0 0 20px ${avatarConfig.color}50`
        }}>
          {avatarIcon}
        </div>
      </div>

      {/* 智能体名称 */}
      <h4 style={{
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: theme.page.colors.textPrimary,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '70%',
        position: 'relative',
        zIndex: 2
      }}
        title={agent.name} // 悬停显示完整名称
      >
        {agent.name}
      </h4>

      {/* 智能体描述 */}
      <div
        style={{
          flex: 1,
          fontSize: '12px',
          color: theme.page.colors.textSecondary,
          textAlign: 'center',
          lineHeight: '1.4',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          marginBottom: '12px',
          width: '90%',
          position: 'relative',
          zIndex: 2,
          minHeight: '52px',
          maxHeight: '52px'
        }}
        title={agent.description} // 悬停显示完整描述
      >
        {agent.description}
      </div>

      {/* 模型信息行 */}
      <div style={{
        fontSize: '12px',
        color: theme.page.colors.textSecondary,
        textAlign: 'center',
        marginBottom: '16px',
        width: '90%',
        position: 'relative',
        zIndex: 2,
        height: '16px',
        lineHeight: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px'
      }}>
        {agent.modelId && agent.modelName ? (
          <>
            <img
              src={`/connects/${agent.connectConfig?.mtype || 'llm'}/${agent.connectConfig?.ctype}/${agent.connectConfig?.ctype}.svg`}
              alt={agent.connectConfig?.ctype}
              style={{
                width: '16px',
                height: '16px',
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: theme.mode === 'dark' ? '#ffffff' : '#1f2937'
              }}
            />
            <span style={{ color: theme.page.colors.textTertiary }} title={agent.connectConfig?.name + ' : ' + agent.modelName}>{agent.connectConfig?.ctype}:</span>
            <span
              style={{
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              }}
              title={agent.modelId}
            >
              {agent.modelId}
            </span>
          </>
        ) : (
          <span>模型: 未配置</span>
        )}
      </div>

      {/* MCP工具信息 */}
      <div
        style={{
          fontSize: '11px',
          color: theme.page.colors.textTertiary,
          textAlign: 'center',
          marginBottom: '50px',
          width: '100%',
          position: 'relative',
          zIndex: 2,
          height: '16px',
          lineHeight: '16px'
        }}
        title={(() => {
          if (!agent.mcpTools || agent.mcpTools.length === 0) {
            return '';
          }
          return agent.mcpTools.map(mcp => `${mcp.name} (${mcp.type})`).join('\n');
        })()}
      >
        {(() => {
          if (!agent.mcpTools || agent.mcpTools.length === 0) {
            return 'MCP工具: 无';
          }

          const mcpNames = agent.mcpTools.map(mcp => mcp.name);
          const maxLength = 20; // 最大显示长度

          if (mcpNames.length === 1) {
            const name = mcpNames[0] || '';
            return `MCP: ${name.length > maxLength ? name.substring(0, maxLength) + '...' : name}`;
          } else if (mcpNames.length === 2) {
            const combined = mcpNames.join(', ');
            const firstName = mcpNames[0] || '';
            return `MCP: ${combined.length > maxLength ? firstName + ' +1' : combined}`;
          } else {
            const firstName = mcpNames[0] || '';
            return `MCP: ${firstName} +${mcpNames.length - 1}`;
          }
        })()}
      </div>

      {/* 按钮区域 */}
      <div style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: '12px',
        left: '0',
        right: '0',
        zIndex: 3,
        padding: '0px 16px',
        gap: '8px'
      }}>
        {/* 删除按钮 */}
        <Tooltip content="删除智能体" position="top" delay={100}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDeleteAgent?.(agent.id);
            }}
            style={{
              display: 'flex',
              width: '32px',
              height: '32px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: `1px solid ${theme.page.colors.borderSecondary}`,
              background: theme.page.colors.bgSecondary+ '80',
              color: theme.page.colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: `0 2px 8px ${theme.page.colors.shadowColor}`,
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.page.colors.bgSecondary+ '80';
              e.currentTarget.style.borderColor = theme.page.colors.borderSecondary;
              e.currentTarget.style.color = theme.page.colors.textSecondary;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <MdOutlineDeleteOutline size={16} />
          </div>
        </Tooltip>

        {/* 分享按钮 */}
        <Tooltip content="分享智能体" position="top" delay={100}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onShareAgent?.(agent.id);
            }}
            style={{
              display: 'flex',
              width: '32px',
              height: '32px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: `1px solid ${theme.page.colors.borderSecondary}`,
              background: theme.page.colors.bgSecondary+ '80',
              color: theme.page.colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: `0 2px 8px ${theme.page.colors.shadowColor}`,
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
              e.currentTarget.style.color = '#3b82f6';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.page.colors.bgSecondary+ '80';
              e.currentTarget.style.borderColor = theme.page.colors.borderSecondary;
              e.currentTarget.style.color = theme.page.colors.textSecondary;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FiShare2 size={14} />
          </div>
        </Tooltip>

        {/* 打开按钮 */}
        <Tooltip content="在新窗口打开智能体" position="top" delay={100}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpenAgent?.(agent.id);
            }}
            style={{
              display: 'flex',
              width: '32px',
              height: '32px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: `1px solid ${theme.page.colors.borderSecondary}`,
              background: theme.page.colors.bgSecondary + '80',
              color: theme.page.colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: `0 2px 8px ${theme.page.colors.shadowColor}`,
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.4)';
              e.currentTarget.style.color = '#22c55e';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.page.colors.bgSecondary+ '80';
              e.currentTarget.style.borderColor = theme.page.colors.borderSecondary;
              e.currentTarget.style.color = theme.page.colors.textSecondary;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FiExternalLink size={14} />
          </div>
        </Tooltip>

        {/* 编辑按钮 */}
        <Tooltip content="编辑智能体" position="top" delay={100}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onAgentClick?.(agent.id);
            }}
            style={{
              display: 'flex',
              width: '32px',
              height: '32px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: `1px solid ${theme.page.colors.borderSecondary}`,
              background: theme.page.colors.bgSecondary+ '80',
              color: theme.page.colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: `0 2px 8px ${theme.page.colors.shadowColor}`,
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(168, 85, 247, 0.2)`;
              e.currentTarget.style.borderColor = `rgba(168, 85, 247, 0.4)`;
              e.currentTarget.style.color = '#a855f7';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.page.colors.bgSecondary+ '80';
              e.currentTarget.style.borderColor = theme.page.colors.borderSecondary;
              e.currentTarget.style.color = theme.page.colors.textSecondary;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FaUserEdit size={14} />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};