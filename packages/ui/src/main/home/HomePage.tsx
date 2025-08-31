import React, { useState, useRef, useEffect } from 'react';
import { WorkflowConfig } from './types';
import { WorkflowList } from './WorkflowList';

// 导入UI组件样式
import {
  GlassContainer,
  GlassMain,
  GlassHeader,
  GlassDescription,
  GlassTabNav,
  GlassTab,
  GlassDescInfo
} from '../../components/shared/ui-components';

import { CoButton } from '../../components/basic/Buttons';

import {
  HeaderContainer,
  TitleContainer,
  WelcomeContainer,
  WelcomeContent,
  IconContainer,
  WelcomeTitle,
  PlaceholderContainer,
  LogoutContainer,
  LogoutButton
}
  from '../shared/styles/welcome';

import { FaGithub } from "react-icons/fa6";
import { FaPlusCircle } from "react-icons/fa";



interface HomePageProps {
  user?: { name?: string };
  title: string;
  slogan: string;
  workflows: WorkflowConfig[];
  loading: boolean;
  onWorkflowClick: (workflowId: string) => void;
  onToggleWorkflow: (workflowId: string, currentStatus: boolean) => void;
  onDeleteWorkflow?: (workflowId: string) => Promise<boolean>;
  onCreateWorkflow: () => void;
  onLogout: () => void;
  DocumentIcon: React.ComponentType;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  workflows,
  loading,
  title,
  slogan,
  onWorkflowClick,
  onToggleWorkflow,
  onDeleteWorkflow,
  onCreateWorkflow,
  onLogout,
  DocumentIcon
}) => {
  const [activeTab, setActiveTab] = useState('bizflows');

  // 如果没有工作流，显示欢迎界面

  return (
    <GlassContainer>
      <GlassMain>
        <GlassHeader>
          <GlassDescription>
            <HeaderContainer>
              <TitleContainer>
                <h3>{title}</h3>
              </TitleContainer>
              <CoButton variant='liquid' onClick={onCreateWorkflow}>
                <FaPlusCircle />
                <span>  创建业务流程</span>
              </CoButton>
            </HeaderContainer>
            <GlassDescInfo>
              {slogan}
              <a href="https://github.com/cofly-io/cofly" target="_blank"> <FaGithub /></a>
            </GlassDescInfo>
          </GlassDescription>

          <GlassTabNav>
            <GlassTab $active={activeTab === 'bizflows'} onClick={() => setActiveTab('bizflows')}>
              业务流程
            </GlassTab>
            <GlassTab $active={activeTab === 'runtime'} onClick={() => setActiveTab('runtime')}>
              运行状况
            </GlassTab>
            <GlassTab $active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>
              日志
            </GlassTab>
          </GlassTabNav>
        </GlassHeader>
        {(() => {
          if (workflows.length === 0) return <WelcomeContainer>
            <WelcomeContent>
              <IconContainer>
                <DocumentIcon />
              </IconContainer>
              <WelcomeTitle>
                亲爱的{user?.name || ''}， 欢迎来Cofly空间
              </WelcomeTitle>
              <CoButton>
                让我们开始吧
              </CoButton>
              <PlaceholderContainer />
              <LogoutContainer>
                <LogoutButton onClick={onLogout}>
                  注销
                </LogoutButton>
              </LogoutContainer>
            </WelcomeContent>
          </WelcomeContainer>
          else return <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginTop: '4px' }}>
            <WorkflowList
              workflows={workflows}
              onWorkflowClick={onWorkflowClick}
              onToggleWorkflow={onToggleWorkflow}
              onDeleteWorkflow={onDeleteWorkflow}
              onCreateWorkflow={onCreateWorkflow}
            />
          </div>;
        })()}
      </GlassMain>
    </GlassContainer>
  )
}; 