import styled from 'styled-components';

export const WelcomeContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.3)'
    : 'rgba(248, 250, 252, 0.5)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.15)'
    : 'rgba(59, 130, 246, 0.1)'
  };
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 20px 40px rgba(0, 0, 0, 0.2), inset 0 0 30px rgba(59, 130, 246, 0.05)'
    : '0 20px 40px rgba(0, 0, 0, 0.1), inset 0 0 30px rgba(59, 130, 246, 0.03)'
  };
`;

export const WelcomeContent = styled.div`
  text-align: center;
  max-width: 480px;
`;

export const WelcomeTitle = styled.div`
  font-size: 13px;
  font-weight: 400;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
  // p {
  //   padding-top: 12px;
  //   font-weight: 400;
  //   font-size: 13px;
  //   color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  //   line-height: 1.6;
  // }
`;

export const IconContainer = styled.div`
  margin-bottom: 30px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};  
  svg {
    font-size: 4rem;
    opacity: 0.7;
    transition: all 0.3s ease;
    color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#374151'};
  }
  /*
  &:hover svg {
    opacity: 1;
    transform: scale(1.1);
    color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#374151'};
  }*/
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
  display: flex;
  flex-direction: row;
  align-self: center;
  height: 36px;
`;


export const PlaceholderContainer = styled.div`
  margin-top: 40px;
`;

export const LogoutContainer = styled.div`
  margin-top: 40px;
`;

export const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
  
  &:hover {
    color: #333;
  }
`;
