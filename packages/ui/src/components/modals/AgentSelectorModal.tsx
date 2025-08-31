//用画布引用智能体
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    ModalBackdrop,
    PremiumModalContainer,
    PremiumTitleDesc,
    ModalHeader,
    ModalContent,
    CloseButton,
    PremiumFormButton,
    FormButtonGroup
} from '../basic';
import { getAvatarIcon } from '../../utils/avatarUtils';
import { AgentData } from '@repo/common';

const AgentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 2px 0;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

const AgentCard = styled.div<{ $selected?: boolean }>`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid ${props => props.$selected ? '#3B82F6' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: ${props => props.$selected ? '#3B82F6' : 'rgba(255, 255, 255, 0.4)'};
    transform: translateY(-1px);
  }
`;

const AgentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AgentAvatar = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  /*background: ${props => props.$color || '#3B82F6'};*/
  //border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: ${props => props.$color || '#3B82F6'};
  flex-shrink: 0;
`;

const AgentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AgentName = styled.h4`
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AgentDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size:12px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #ef4444;
`;

interface AgentSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (agent: AgentData) => void;
    onFetchAgents?: () => Promise<AgentData[]>;
}

export const AgentSelectorModal: React.FC<AgentSelectorModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    onFetchAgents
}) => {
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 获取智能体列表
    const fetchAgents = async () => {
        if (!onFetchAgents) {
            setError('未提供获取智能体的方法');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const agentList = await onFetchAgents();
            setAgents(agentList || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : '获取智能体列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 当模态窗打开时获取数据
    useEffect(() => {
        if (isOpen) {
            fetchAgents();
            setSelectedAgent(null);
        }
    }, [isOpen]);

    // 解析头像信息 - 与 AgentList.tsx 保持一致
    const parseAvatar = (avatar?: string | { name: string; color: string } | null) => {
        try {
            if (!avatar) {
                return { name: 'user', color: '#3B82F6' };
            }

            // 如果是字符串，尝试解析为JSON
            if (typeof avatar === 'string') {
                const parsed = JSON.parse(avatar);
                return {
                    name: parsed.name || 'user',
                    color: parsed.color || '#3B82F6'
                };
            }

            // 如果已经是对象
            if (typeof avatar === 'object' && avatar !== null) {
                return {
                    name: (avatar as any).name || 'user',
                    color: (avatar as any).color || '#3B82F6'
                };
            }

            return { name: 'user', color: '#3B82F6' };
        } catch (error) {
            console.error('解析avatar字段失败:', error);
            return { name: 'user', color: '#3B82F6' };
        }
    };

    const handleSelect = () => {
        if (selectedAgent) {
            onSelect(selectedAgent);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <ModalBackdrop>
            <PremiumModalContainer style={{ width: '300px', height: '60vh', maxWidth: 'none' }}>
                <ModalHeader>
                    <PremiumTitleDesc>
                        <h5>选择智能体</h5>
                        <p style={{ fontSize: "12px", fontWeight: 200 }}>选择一个智能体来创建智能体引用节点</p>
                    </PremiumTitleDesc>
                    <CloseButton onClick={onClose} style={{ color: 'white' }}>×</CloseButton>
                </ModalHeader>

                <ModalContent style={{ padding: "2px 8px", display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    {loading && (
                        <LoadingState>
                            正在加载智能体列表...
                        </LoadingState>
                    )}

                    {error && (
                        <ErrorState>
                            {error}
                        </ErrorState>
                    )}

                    {!loading && !error && agents.length === 0 && (
                        <EmptyState>
                            暂无可用的智能体，请先创建智能体
                        </EmptyState>
                    )}

                    {!loading && !error && agents.length > 0 && (
                        <AgentGrid>
                            {agents.map((agent) => {
                                const avatarInfo = parseAvatar(agent.avatar);
                                return (
                                    <AgentCard
                                        key={agent.id}
                                        $selected={selectedAgent?.id === agent.id}
                                        onClick={() => setSelectedAgent(agent)}
                                    >
                                        <AgentHeader>
                                            <AgentAvatar $color={avatarInfo.color}>
                                                {getAvatarIcon(avatarInfo.name)}
                                            </AgentAvatar>
                                            <AgentInfo>
                                                <AgentName>{agent.name}</AgentName>
                                                <AgentDescription>{agent.description}</AgentDescription>
                                            </AgentInfo>
                                        </AgentHeader>
                                    </AgentCard>
                                );
                            })}
                        </AgentGrid>
                    )}

                    <FormButtonGroup style={{ marginTop: 'auto', padding: '8px', flexShrink: 0 }}>
                        <PremiumFormButton
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                height: '32px',
                                width:'45%',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 16px'
                            }}
                        >
                            取消
                        </PremiumFormButton>
                        <PremiumFormButton
                            type="button"
                            onClick={handleSelect}
                            disabled={!selectedAgent}
                            style={{
                                background: selectedAgent ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                opacity: selectedAgent ? 1 : 0.5,
                                height: '32px',
                                width:'45%',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 16px'
                            }}
                        >
                            确认
                        </PremiumFormButton>
                    </FormButtonGroup>
                </ModalContent>
            </PremiumModalContainer>
        </ModalBackdrop>
    );
};