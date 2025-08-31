"use client";

import styled from 'styled-components';
import { glassBase } from '../../components/shared/ui-components';

// 优化的样式组件 - 减少不必要的计算
export const MenuContainer = styled.div<{ $collapsed?: boolean }>`
    width: ${props => props.$collapsed ? '0' : '315px'};
    height: 98%;
    background: ${({ theme }) => theme.mode === 'dark'
    ? '#2a2e3b'
    : 'rgba(255, 255, 255, 0.95)'
  };
    
    border-right: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'
  };
    
    transition: width 0.3s ease;
    position: relative;
    user-select: none;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

export const MenuHeader = styled.div<{ $collapsed?: boolean }>`
  position: relative;
  padding-left: ${props => props.$collapsed ? "0px" : "10px"};
  height: 12px;
  vertical-align: middle;
  display: flex;
  width: 100%;
  padding:10px;
  align-items: center;
  justify-content: center;
 // background: ${props => props.$collapsed ? (props.theme?.colors?.sidebarBg || '#ffffff') : 'none'};
  border: none;
  cursor: pointer;
  user-select: none;
  z-index: 10;
`;

export const SubMenuHeader = styled.div`
  padding: 0px;
  //border-bottom: 1px solid rgba(255,255,255,0.1);
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(0,0,0,0.2)'
    : '#000000'};
  position: relative;
  overflow: hidden;
`;

export const CollapseFlag = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 1px;
  font-size: 11px;
  user-select: none;
  color: ${({ theme }) => theme.mode === 'dark' ? '#95A3C6' : '#64748b'};
  
  &:hover {
    color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#3b82f6'};
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
  } 
`;


//目录的总体样式
export const MenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
    
  background: ${({ theme }) => theme.mode === 'dark' ? '#2a2e3b' : '#ffffff'};
  
  //滚轴样式
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'
  };
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.2)'
  };
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(0, 0, 0, 0.3)'
  };
    }
  }
`;

// N8N风格的分类头部
export const CatalogHeader = styled.div<{ $expanded?: boolean }>`
  margin: 0px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(179, 179, 179, 0.2)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(0, 0, 0, 0.06)'
  };
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.04)'
  };
    border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.15)'
  };
  }
`;


export const CatalogContent = styled.div<{ $expanded: boolean }>`
  max-height: ${props => props.$expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: ${({ theme }) => theme?.colors?.sidebarBg || '#ffffff'};
  margin-bottom: 0;
`;

export const CatalogHeaderContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

export const CatalogIcon = styled.div`
  margin-right: 12px;
  width: 28x;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
  }
`;

export const CatalogTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
  font-size: 14px;
  margin-bottom: 4px;
`;


export const CatalogText = styled.div`
    flex: 1;
`;

export const CatalogDescription = styled.div`
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  font-size: 12px;
  line-height: 1.4;
`;

export const ExpandIcon = styled.div<{ $expanded: boolean }>`
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b880' : '#64748b'};
  font-size: 12px;
  font-weight: 600;
  transition: transform 0.2s ease;
`;

// N8N风格的节点项
export const NodeItem = styled.div`
  padding: 12px 16px;
  cursor: grab;
  border-radius: 6px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.8)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'
  };
  transition: all 0.2s ease;
  margin-bottom: 8px;
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.95)'
  };
    border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.15)'
  };
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
    : '0 4px 12px rgba(0, 0, 0, 0.1)'
  };
  }

  &:active {
    cursor: grabbing;
  }
`;

export const NodeContent = styled.div`
  display: flex;
  align-items: center;
`;

export const NodeIconContainer = styled.div`
  margin-right: 12px;
`;

export const NodeIcon = styled.img`
  width: 20px;
  height: 20px;
`;

export const NodeTextContent = styled.div`
  flex: 1;
`;

export const NodeTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
  font-size: 13px;
  margin-bottom: 2px;
`;

export const NodeDescription = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  line-height: 1.4;
  width: 100%;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const EmptyState = styled.div`
  padding: 20px;
  color: ${({ theme }) => theme?.colors?.textTertiary || '#999'};
  text-align: center;
  font-size: 13px;
`;

export const SearchContainer = styled.div`
  padding: 8px 12px;
  margin-bottom:8px;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'
  };
`;


// N8N风格的搜索输入框
export const NodeMenuSearch = styled.input`
  width: 100%;
  height:32px;  
  padding: 10px 12px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.8)'
  };
  border:0px;
  border-radius: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(0, 0, 0, 0.3)'
  };
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.95)'
  };
  }
  
  &:hover {
    border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.2)'
  };
  }
`;