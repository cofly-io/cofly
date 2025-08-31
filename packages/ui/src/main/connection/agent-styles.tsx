import styled from 'styled-components';

// 主题适配的容器组件
export const WelcomeContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

export const WelcomeContent = styled.div`
  text-align: center;
  max-width: 400px;
`;

export const WelcomeTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const IconContainer = styled.div`
  margin-bottom: 30px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  
  svg {
    font-size: 3rem;
    opacity: 0.7;
    transition: all 0.3s ease;
  }
  
  &:hover svg {
    opacity: 1;
    transform: scale(1.1);
    color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#374151'};
  }
`;

export const EmptyContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-top: 4px;
`;

export const HeaderContainer = styled.div`
  display: flex;
  align-items: flex-start;
`;

export const TitleContainer = styled.div`
  flex: 1;
  
  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 28px;
    font-weight: 600;
  }
`;

export const ButtonGroup = styled.div`
  align-self: center;
`;

export const PlaceholderContainer = styled.div`
  margin-top: 40px;
`; 