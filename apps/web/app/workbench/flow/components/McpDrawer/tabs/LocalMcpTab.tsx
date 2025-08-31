import React, { useEffect } from 'react';
import styled from 'styled-components';
import { VscTools } from "react-icons/vsc";
import { McpConfigState } from '../McpDrawerContent';

interface LocalMcpTabProps {
  mcpConfigState: McpConfigState;
  selectedMcpIds: string[];
  onMcpSelect: (mcpId: string) => void;
}

const TabContainer = styled.div`
  padding: 10px 25px 20px 25px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.inputBg};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
`;

// 单列布局样式
const McpCardsContainer = styled.div`
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

const McpType = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
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

export const LocalMcpTab: React.FC<LocalMcpTabProps> = ({ 
  mcpConfigState, 
  selectedMcpIds, 
  onMcpSelect 
}) => {
  const { configs, loading, error, fetchConfigs } = mcpConfigState;

  // 只在组件首次挂载时获取数据，实现数据懒加载
  useEffect(() => {
    if (configs.length === 0 && !loading && !error) {
      fetchConfigs();
    }
  }, [configs.length, loading, error, fetchConfigs]);

  return (
    <TabContainer>
      <RefreshButton 
        onClick={fetchConfigs}
        disabled={loading}
      >
        刷新列表
      </RefreshButton>
      
      {error && (
        <ErrorContainer>
          {error}
        </ErrorContainer>
      )}
      
      <McpCardsContainer>
        {configs && configs.length > 0 ? (
          configs.map((mcp, index) => (
            <McpCard
              key={`mcp-${mcp.id || index}`}
              selected={selectedMcpIds.includes(mcp.id)}
              onClick={() => onMcpSelect(mcp.id)}
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
        ) : loading ? (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              padding: '20px',
              fontSize: '14px'
            }}
          >
            加载MCP配置中...
          </div>
        ) : (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              padding: '20px',
              fontSize: '14px'
            }}
          >
            暂无可用的MCP工具
          </div>
        )}
      </McpCardsContainer>
    </TabContainer>
  );
};