"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TeamMemberConfig } from '@repo/common';
import { getAvatarIcon } from '@repo/ui/utils/avatarUtils';

interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string | { name: string; color: string } | null;
  modelName?: string;
  createUser: string;
}

// Avatar组件，用于正确渲染智能体头像
const AgentAvatarIcon: React.FC<{ avatar?: string | { name: string; color: string } | null }> = ({ avatar }) => {
  // 如果avatar是字符串且看起来像JSON，尝试解析
  if (typeof avatar === 'string') {
    try {
      // 检查是否是JSON字符串
      if (avatar.startsWith('{') && avatar.endsWith('}')) {
        const parsed = JSON.parse(avatar);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          // 返回对应的图标，使用指定的颜色
          const iconElement = getAvatarIcon(parsed.name);
          return React.cloneElement(iconElement as React.ReactElement<any>, {
            style: {
              color: parsed.color || '#3B82F6',
              fontSize: '18px'
            }
          });
        }
      } else {
        // 普通字符串，直接作为图标名称
        return React.cloneElement(getAvatarIcon(avatar) as React.ReactElement<any>, {
          style: {
            color: '#3B82F6',
            fontSize: '18px'
          }
        });
      }
    } catch (error) {
      console.warn('解析avatar JSON失败:', error);
      // 解析失败，使用默认图标
      return React.cloneElement(getAvatarIcon('robot') as React.ReactElement<any>, {
        style: {
          color: '#3B82F6',
          fontSize: '18px'
        }
      });
    }
  } else if (avatar && typeof avatar === 'object' && avatar.name) {
    // 已经是对象格式
    return React.cloneElement(getAvatarIcon(avatar.name) as React.ReactElement<any>, {
      style: {
        color: avatar.color || '#3B82F6',
        fontSize: '18px'
      }
    });
  }

  // 默认情况，使用机器人图标
  return React.cloneElement(getAvatarIcon('robot') as React.ReactElement<any>, {
    style: {
      color: '#3B82F6',
      fontSize: '18px'
    }
  });
};

interface AddMemberDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  currentMembers: TeamMemberConfig[];
  onAddMember: (agentId: string) => Promise<void>;
}

const DrawerOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const DrawerContent = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  overflow: hidden;

  /* 重置所有文字样式 */
  * {
    color: inherit;
    text-decoration: none;
    list-style: none;
  }

  /* 确保没有意外的伪元素 */
  *::before,
  *::after {
    display: none !important;
  }
`;

const DrawerHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const DrawerTitle = styled.h2`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const SearchContainer = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    border-color: rgba(59, 130, 246, 0.5);
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const AgentList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
`;

const AgentCount = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 16px;
`;

const AgentCard = styled.div<{ $isAdding?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  opacity: ${props => props.$isAdding ? 0.6 : 1};
  pointer-events: ${props => props.$isAdding ? 'none' : 'auto'};
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  /* 确保没有伪元素干扰 */
  &::before,
  &::after {
    display: none;
  }
`;

const AgentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  width: 100%;
  position: relative;
`;

const AgentAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;

  /* 确保图标居中显示 */
  svg {
    width: 18px;
    height: 18px;
  }
`;

const AgentInfo = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const AgentName = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 2px;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const AgentModel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const AgentDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AddButton = styled.button<{ $isAdding?: boolean }>`
  width: 100%;
  padding: 8px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
`;

export const AddMemberDrawer: React.FC<AddMemberDrawerProps> = ({
  isOpen,
  onClose,
  teamId,
  currentMembers,
  onAddMember
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingAgentIds, setAddingAgentIds] = useState<Set<string>>(new Set());

  // 获取可用的智能体列表
  useEffect(() => {
    if (isOpen) {
      loadAvailableAgents();
    }
  }, [isOpen, currentMembers]);

  // 搜索过滤
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAgents(agents);
    } else {
      const filtered = agents.filter(agent => {
        const name = agent.name || '';
        const description = agent.description || '';
        const searchLower = searchTerm.toLowerCase();

        return name.toLowerCase().includes(searchLower) ||
               description.toLowerCase().includes(searchLower);
      });
      setFilteredAgents(filtered);
    }
  }, [agents, searchTerm]);

  const loadAvailableAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents?excludeFields=prompt');
      const result = await response.json();

      if (result.success && result.data) {
        // 过滤掉已经在团队中的智能体
        const currentMemberAgentIds = new Set(currentMembers.map(member => member.agentId));
        const availableAgents = result.data.filter((agent: Agent) =>
          !currentMemberAgentIds.has(agent.id)
        );

        // 清理智能体数据，确保所有字段都是字符串
        const cleanedAgents = availableAgents.map((agent: any, index: number) => {
          // 调试：打印原始数据
          console.log(`原始智能体数据 [${index}]:`, agent);

          // 确保所有属性都是正确类型，avatar保持原始格式
          const cleanedAgent = {
            id: String(agent.id || ''),
            name: String(agent.name || '未命名智能体').trim(),
            description: String(agent.description || '暂无描述').trim(),
            avatar: agent.avatar, // 保持原始格式，可能是字符串或对象
            modelName: String(agent.modelName || '未配置模型').trim(),
            createUser: String(agent.createUser || '')
          };

          console.log(`清理后智能体数据 [${index}]:`, cleanedAgent);
          return cleanedAgent;
        });

        console.log('清理后的智能体数据:', cleanedAgents);
        setAgents(cleanedAgents);
      }
    } catch (error) {
      console.error('获取智能体列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (agentId: string) => {
    try {
      setAddingAgentIds(prev => new Set(prev).add(agentId));
      await onAddMember(agentId);
      
      // 成功添加后，从列表中移除该智能体
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
    } catch (error) {
      console.error('添加成员失败:', error);
    } finally {
      setAddingAgentIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <DrawerOverlay $isOpen={isOpen} onClick={handleOverlayClick} />
      <DrawerContent $isOpen={isOpen}>
        <DrawerHeader>
          <DrawerTitle>添加团队成员</DrawerTitle>
          <CloseButton onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </CloseButton>
        </DrawerHeader>

        <SearchContainer>
          <SearchWrapper>
            <SearchIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="搜索智能体..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
        </SearchContainer>

        <AgentList>
          {loading ? (
            <LoadingState>加载中...</LoadingState>
          ) : filteredAgents.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <div>
                {searchTerm ? '没有找到匹配的智能体' : '暂无可添加的智能体'}
              </div>
            </EmptyState>
          ) : (
            <>
              <AgentCount>可添加的智能体 ({filteredAgents.length}个)</AgentCount>
              {filteredAgents.map((agent) => {
                const isAdding = addingAgentIds.has(agent.id);

                // 调试：检查agent对象
                console.log('渲染智能体:', {
                  id: agent.id,
                  name: agent.name,
                  description: agent.description,
                  avatar: agent.avatar,
                  modelName: agent.modelName
                });

                // 提取所有需要的值，避免直接使用agent对象
                const agentId = String(agent.id);
                const agentName = String(agent.name || '未命名智能体');
                const agentDescription = String(agent.description || '暂无描述');
                const agentModelName = String(agent.modelName || '未配置模型');

                return (
                  <AgentCard key={`agent-${agentId}`} $isAdding={isAdding}>
                    <AgentHeader>
                      <AgentAvatar>
                        <AgentAvatarIcon avatar={agent.avatar} />
                      </AgentAvatar>
                      <AgentInfo>
                        <AgentName title={agentName}>{agentName}</AgentName>
                        <AgentModel title={agentModelName}>{agentModelName}</AgentModel>
                      </AgentInfo>
                    </AgentHeader>
                    <AgentDescription title={agentDescription}>
                      {agentDescription}
                    </AgentDescription>
                    <AddButton
                      onClick={() => handleAddMember(agentId)}
                      disabled={isAdding}
                      $isAdding={isAdding}
                    >
                      {isAdding ? '添加中...' : '+ 添加'}
                    </AddButton>
                  </AgentCard>
                );
              })}
            </>
          )}
        </AgentList>
      </DrawerContent>
    </>
  );
};
