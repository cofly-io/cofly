import React from 'react';
import styled from 'styled-components';

// Tab 导航容器
// export const TabNav = styled.div`
//   display: flex;
//   gap: 2px;
//   background: ${({ theme }) => theme.mode === 'dark'
//     ? 'rgba(15, 23, 42, 0.2)'
//     : 'rgba(248, 250, 252, 0.3)'
//   };
//   padding: 4px;
//   border-radius: 12px;
//   backdrop-filter: blur(6px);
//   border: 1px solid ${({ theme }) => theme.mode === 'dark'
//     ? 'rgba(59, 130, 246, 0.1)'
//     : 'rgba(59, 130, 246, 0.08)'
//   };
//   width: fit-content;
//   margin-bottom: 24px;
// `;

// Tab 按钮
export const TabButton = styled.button<{ $active?: boolean }>`
  padding: 10px 20px;
  background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.25)'
      : 'rgba(59, 130, 246, 0.15)')
    : 'transparent'
  };
  color: ${({ $active, theme }) => $active
    ? '#DDDDDD'
    : (theme.mode === 'dark' ? '#969696' : '#d8d8d8')
  };
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  ${({ $active, theme }) => $active && `
    box-shadow: ${theme.mode === 'dark'
      ? '0 4px 12px rgba(59, 130, 246, 0.3)'
      : '0 4px 12px rgba(59, 130, 246, 0.2)'
    };
  `}
  
  &:hover:not([disabled]) {
    color: ${({ $active, theme }) => $active
      ? '#C2BFD0'
      : (theme.mode === 'dark' ? '#94a3b8' : '#64748b')
    };


    background: ${({ $active, theme }) => $active
      ? (theme.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.25)'
        : 'rgba(59, 130, 246, 0.15)')
      : (theme.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.1)'
        : 'rgba(59, 130, 246, 0.05)')
    };
  }
`;

// Tab 内容容器
export const TabContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`; 
