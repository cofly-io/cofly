import React from 'react';
import styled from 'styled-components';
import { TbDatabaseCog } from "react-icons/tb";
import { HiOutlineLink } from "react-icons/hi2";

interface ConnectConfig {
  id: string;
  name: string;
  ctype: string;
  mtype?: string;
  config?: Record<string, any>;
  creator?: string;
  description?: string;
}

interface ConnetCreDentialTabProps {
  connectConfigs: ConnectConfig[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  selectedConnectIds: string[];
  onConnectSelect: (connectId: string) => void;
}

const TabContainer = styled.div`
  padding: 10px 25px 20px 25px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

// 单列布局样式
const ConnectCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 343px;
  overflow-y: auto;
  padding: 2px;

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

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 0px 14px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  cursor: pointer;
  height: 28px;
  backdrop-filter: blur(4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 16px;
  align-self: flex-start;
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: none;
    }
  }
`;

export const ConnetCreDentialTab: React.FC<ConnetCreDentialTabProps> = ({ 
  connectConfigs, 
  loading, 
  error, 
  onRefresh,
  selectedConnectIds,
  onConnectSelect
}) => {
  return (
    <TabContainer>
      <RefreshButton 
        onClick={onRefresh}
        disabled={loading}
      >
        刷新列表
      </RefreshButton>
      
      <ConnectCardsContainer>
        {connectConfigs && connectConfigs.length > 0 ? (
          connectConfigs.map((connect, index) => (
            <ConnectCard
              key={`connect-config-${connect.id || index}`}
              selected={selectedConnectIds.includes(connect.id)}
              onClick={() => onConnectSelect(connect.id)}
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
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              padding: '20px',
              fontSize: '14px'
            }}
          >
            <HiOutlineLink /> 暂无可用的数据库连接
          </div>
        )}
      </ConnectCardsContainer>
    </TabContainer>
  );
};