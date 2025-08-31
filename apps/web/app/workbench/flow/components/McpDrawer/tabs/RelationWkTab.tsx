import React from 'react';
import styled from 'styled-components';
import { SlOrganization } from "react-icons/sl";
import { RiLoopLeftLine } from "react-icons/ri";

interface WorkflowConfig {
  id: string;
  name: string;
  version?: string;
  isActive?: boolean;
  createUser?: string;
  createdTime?: string;
  updatedTime?: string;
}

interface RelationWkTabProps {
  workflowConfigs: WorkflowConfig[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  selectedWorkflowIds: string[];
  onWorkflowSelect: (workflowId: string) => void;
}

const TabContainer = styled.div`
  padding: 10px 25px 20px 25px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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

export const RelationWkTab: React.FC<RelationWkTabProps> = ({ 
  workflowConfigs, 
  loading, 
  error, 
  onRefresh,
  selectedWorkflowIds,
  onWorkflowSelect
}) => {
  return (
    <TabContainer>
      <RefreshButton 
        onClick={onRefresh}
        disabled={loading}
      >
        刷新列表
      </RefreshButton>
      
      <McpCardsContainer>
        {loading ? (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              padding: '20px',
              fontSize: '14px'
            }}
          >
            <RiLoopLeftLine /> 正在加载工作流...
          </div>
        ) : workflowConfigs && workflowConfigs.length > 0 ? (
          workflowConfigs.map((workflow, index) => (
            <WorkflowCard
              key={`workflow-${workflow.id || index}`}
              selected={selectedWorkflowIds.includes(workflow.id)}
              onClick={() => onWorkflowSelect(workflow.id)}
            >
              <ToolIcon>
                <SlOrganization size={16} />
              </ToolIcon>
              <McpInfo>
                <McpName title={workflow.name || 'Unknown Workflow'}>{workflow.name || 'Unknown Workflow'}</McpName>
                {workflow.version && (
                  <McpType>v{workflow.version}</McpType>
                )}
              </McpInfo>
            </WorkflowCard>
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
            暂无可用的工作流
          </div>
        )}
      </McpCardsContainer>
    </TabContainer>
  );
};