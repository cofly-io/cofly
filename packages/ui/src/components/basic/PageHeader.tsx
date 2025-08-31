"use client";

import React from 'react';
import styled from 'styled-components';
import { enhancedGlassBase } from '../shared/ui-components';

const PageHeaderContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  padding: 10px 20px 0px;
  height: auto;
  
  /* 应用渐变背景效果 */
  background: linear-gradient(201deg, #333f99, #0f1b3a);
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  
  ${enhancedGlassBase}
  border-radius: 0;
  margin-bottom: 0;
`;

const PageTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-self: start;
  padding-bottom: 10px;
`;

const PageTitle = styled.h1`
  font-size: 18px;
  font-weight: 500;
  color: white;
  margin: 0;
  margin-right: 10px;
`;

const PageSubtitle = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  margin-left: 16px;
`;

const CenterContainer = styled.div`
  display: flex;
  align-items: end;
  justify-content: center;
  justify-self: center;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: end;
  padding-bottom: 10px;
`;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  centerContent?: React.ReactNode; // 中间内容（如 Tab）
  actions?: React.ReactNode; // 右侧操作按钮
  children?: React.ReactNode; // 兼容旧版本，如果没有指定 centerContent 和 actions，会放在右侧
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  centerContent,
  actions,
  children
}) => {
  return (
    <PageHeaderContainer>
      <PageTitleContainer>
        <PageTitle>{title}</PageTitle>
        {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
      </PageTitleContainer>
      <CenterContainer>
        {centerContent}
      </CenterContainer>
      <ActionsContainer>
        {actions || children}
      </ActionsContainer>
    </PageHeaderContainer>
  );
}; 