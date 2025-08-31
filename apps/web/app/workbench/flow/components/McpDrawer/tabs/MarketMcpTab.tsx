import React from 'react';
import styled from 'styled-components';

const TabContainer = styled.div`
  padding: 10px 25px 20px 25px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlaceholderText = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-size: 14px;
  line-height: 1.5;
`;

export const MarketMcpTab: React.FC = () => {
  return (
    <TabContainer>
      <PlaceholderText>
        市场功能开发中...
      </PlaceholderText>
    </TabContainer>
  );
};