import React, { useState } from 'react';
import styled from 'styled-components';
import { LocalMcpTab } from './LocalMcpTab';
import { MarketMcpTab } from './MarketMcpTab';
import { McpConfigState } from '../McpDrawerContent';

interface McpToolsTabProps {
  mcpConfigState: McpConfigState;
  selectedMcpIds: string[];
  onMcpSelect: (mcpId: string) => void;
}

const McpTabContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SubTabHeader = styled.div`
  display: flex;
  padding: 0 25px;
  border-bottom: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  background: ${({ theme }) => theme.panel.nodeBg};
  flex-shrink: 0;
`;

const SubTabButton = styled.button<{ $active: boolean }>`
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: ${props => props.$active ? props.theme.colors.accent : props.theme.colors.textSecondary};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.accent : 'transparent'};
  margin-right: 8px;
  font-size: 14px;
  transition: color 0.2s ease;
  font-weight: ${props => props.$active ? '400' : '200'};
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const SubTabContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

type McpSubTabType = 'local' | 'market';

export const McpToolsTab: React.FC<McpToolsTabProps> = ({ 
  mcpConfigState, 
  selectedMcpIds, 
  onMcpSelect 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<McpSubTabType>('local');

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'local':
        return (
          <LocalMcpTab 
            mcpConfigState={mcpConfigState}
            selectedMcpIds={selectedMcpIds}
            onMcpSelect={onMcpSelect}
          />
        );
      case 'market':
        return <MarketMcpTab />;
      default:
        return (
          <LocalMcpTab 
            mcpConfigState={mcpConfigState}
            selectedMcpIds={selectedMcpIds}
            onMcpSelect={onMcpSelect}
          />
        );
    }
  };

  return (
    <McpTabContainer>
      <SubTabHeader>
        <SubTabButton 
          $active={activeSubTab === 'local'}
          onClick={() => setActiveSubTab('local')}
        >
          本地
        </SubTabButton>
        <SubTabButton 
          $active={activeSubTab === 'market'}
          onClick={() => setActiveSubTab('market')}
        >
          市场
        </SubTabButton>
      </SubTabHeader>
      <SubTabContent>
        {renderSubTabContent()}
      </SubTabContent>
    </McpTabContainer>
  );
};