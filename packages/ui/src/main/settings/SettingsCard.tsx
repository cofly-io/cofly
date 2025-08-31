"use client";

import React from 'react';
import styled from 'styled-components';
import { enhancedGlassBase } from '../../components/shared/ui-components';

const CardContainer = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.3)'
    : 'rgba(248, 250, 252, 0.5)'
  };
  ${enhancedGlassBase}
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
`;

const CardHeader = styled.div`
  margin-bottom: 20px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 8px 0;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    margin: 0;
    line-height: 1.5;
  }
`;

const CardContent = styled.div`
  /* 内容区域样式 */
`;

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <CardContainer className={className}>
      <CardHeader>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </CardContainer>
  );
};

export default SettingsCard;