import styled from 'styled-components';

// 文件管理主容器
export const FilesManagementContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000000;
`;

export const FilesManagementModal = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? `linear-gradient(135deg,
       rgb(43 45 109 / 95%) 0%, 
       rgb(69 35 105 / 95%) 50%, 
       rgb(32 62 113 / 95%) 100%)`
    : `linear-gradient(135deg,
        rgba(99, 102, 241, 0.95) 0%, 
        rgba(139, 92, 246, 0.95) 50%, 
        rgba(59, 130, 246, 0.95) 100%)`
  };
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: white;
`;

// 头部样式
export const FilesManagementHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
`;

export const FilesManagementTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

// 标签页导航
export const TabNavigation = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  background: none;
  border: none;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? 'white' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }
`;

// 内容区域
export const FilesManagementContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// 文件上传区域样式
export const UploadArea = styled.div<{ $isDragOver: boolean }>`
  border: 2px dashed ${props => props.$isDragOver
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(255, 255, 255, 0.3)'
  };
  border-radius: 8px;
  padding: 48px 32px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  background: ${props => props.$isDragOver
    ? 'rgba(255, 255, 255, 0.1)'
    : 'transparent'
  };

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
  }
`;

export const UploadIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: rgba(255, 255, 255, 0.6);
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

export const UploadText = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: white;
  margin: 0 0 8px 0;
`;

export const UploadButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 16px 0;
`;

export const UploadButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

export const UploadHint = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

// 隐藏的文件输入框
export const HiddenFileInput = styled.input`
  display: none;
`;

// 错误信息样式
export const ErrorContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
`;

export const ErrorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const ErrorTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #ef4444;
  margin: 0 0 8px 0;
`;

export const ErrorList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const ErrorItem = styled.li`
  font-size: 14px;
  color: #ef4444;
  margin-bottom: 4px;

  &:before {
    content: '• ';
    margin-right: 4px;
  }
`;

export const ErrorCloseButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0;
  font-size: 20px;

  &:hover {
    opacity: 0.7;
  }
`;

// 上传进度样式
export const ProgressContainer = styled.div`
  margin-top: 24px;
`;

export const ProgressTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: white;
  margin: 0 0 16px 0;
`;

export const ProgressItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ProgressIcon = styled.div`
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

export const ProgressDetails = styled.div`
  flex: 1;
`;

export const ProgressFileName = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin: 0 0 4px 0;
`;

export const ProgressStatus = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

export const ProgressCancelButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $progress: number; $status: string }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: ${props => {
    switch (props.$status) {
      case 'failed': return '#ef4444';
      case 'completed': return '#22c55e';
      default: return '#3b82f6';
    }
  }};
  transition: width 0.3s ease;
`;

export const ProgressFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

export const ProgressPercent = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

export const ProgressError = styled.span`
  font-size: 12px;
  color: #ef4444;
`;

// 文档管理区域样式
export const DocumentManagementArea = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const FiltersContainer = styled.div`
  padding: 16px 24px 0;
`;

export const BatchOperationsContainer = styled.div`
  padding: 16px 24px 0;
`;

export const DocumentListContainer = styled.div`
  flex: 1;
  padding: 16px 24px 0;
  overflow: hidden;
`;

export const PaginationContainer = styled.div`
  padding: 0 24px 24px;
`;

// 过滤器样式
export const FiltersCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
`;

export const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
`;

export const SearchInputContainer = styled.div`
  flex: 1;
  min-width: 256px;
  position: relative;
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
`;

export const FilterSelect = styled.select`
  min-width: 128px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;

  option {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : '#fff'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#000'};
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
`;

export const SortButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ClearFiltersButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }

  svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
`;

// 活动过滤器标签
export const ActiveFiltersContainer = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const FilterTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  font-size: 12px;
  color: #60a5fa;
`;

export const FilterTagRemove = styled.button`
  background: none;
  border: none;
  color: #60a5fa;
  cursor: pointer;
  margin-left: 4px;
  padding: 0;
  font-size: 14px;

  &:hover {
    color: #3b82f6;
  }
`;

// 空状态样式
export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
`;

export const EmptyStateContent = styled.div`
  max-width: 400px;
`;

export const EmptyStateIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: rgba(255, 255, 255, 0.3);
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

export const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: white;
  margin: 0 0 8px 0;
`;

export const EmptyStateDescription = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

export const EmptyStateButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.6);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(59, 130, 246, 1);
    border-color: rgba(59, 130, 246, 0.8);
  }
`;

// 文档列表样式
export const DocumentListCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const DocumentListHeader = styled.div`
  padding: 8px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
`;

export const DocumentListHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const DocumentListControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const DocumentListStats = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.7)' : '#6b7280'};  
`;

export const ViewModeButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ViewModeButton = styled.button<{ $active: boolean }>`
  padding: 4px 4px 0px 4px;
  background: ${props => props.$active
    ? (props.theme.mode === 'dark' ? '#1e293b' : '#f5f5f5')
    : (props.theme.mode === 'dark' ? '#273444' : '#f5f5f5')};
  border: 1px solid ${props => props.$active
    ? (props.theme.mode === 'dark' ? '#60a5fa' : '#24c5bf')
    : (props.theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.6)' : '#c5c5c5')};
  border-radius: 4px;
  color: ${props => props.$active
    ? (props.theme.mode === 'dark' ? '#60a5fa' : '#24c5bf')
    : (props.theme.mode === 'dark' ? '#939393' : '#bfbfbf')};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: #bfbfbf;
    color: white;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const SelectText = styled.label`
  margin-left: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.8)' : '#6b7280'};  
  span {
    color: ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : '#3b82f6'};
  }
`;

export const TipText = styled.div`
  padding: 8px;
  font-size:12px; 
  text-align: center;
  color: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.8)' : '#6b7280'};
`;

export const LoadingContainer = styled.div`
  padding: 48px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 14px;
`;

// 批量操作样式
export const BatchOperationsCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(18, 244, 252, 0.1)'};  
  border:1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(9, 236, 77, 0.3)'};  
  border-radius: 8px;
  padding: 8px 12px 4px 12px;
`;

export const BatchOperationsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const BatchOperationsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.9)' : '#6b7280'};  
  font-size: 14px;
  font-weight: 500;
`;

export const BatchOperationsActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BatchActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: ${({ theme }) => theme.mode === 'dark' ? 'white' : '#6b7280'};  
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

// 分页样式
export const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.5)' : '#989c9b30'};  
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
`;

export const PaginationInfo = styled.div`
  color: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.7)' : '#6b7280'};  
  font-size: 14px;
`;

export const DisplayPerPage = styled.div`
  fontSize: '14px', 
  color:${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.7)' : '#6b7280'}; 
`;
export const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PaginationButton = styled.button<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${props => props.$disabled
    ? (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#5dcfa980')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#5dcfa9')};
  border: 1px solid ${props => props.$disabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 6px;
  color:${props => props.$disabled
    ? (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9c9c9cff')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#2a472aff')}; 
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const PageNumberButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background: ${props => props.$active
    ? (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(14, 231, 123, 0.5)')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(14, 231, 123, 0.1)')}; 
  border: 1px solid ${props => props.$active
    ? (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(14, 231, 123, 0.5)')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)')}; 
  border-radius: 6px;
  color:  ${props => props.$active
    ? (props.theme.mode === 'dark' ? '60a5fa' : '#2a2a2a90')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.8)')};     
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: : ${props => props.$active
    ? (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(14, 231, 123, 0.4)')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)')};     
    color: white;
  }
`;

export const PageSizeSelect = styled.select`
  background: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.1)' : '#bfbfbf90'};  
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color:${({ theme }) => theme.mode === 'dark' ? 'white' : '#2a2a2a'};
  padding: 6px 8px;
  font-size: 14px;
  cursor: pointer;

  option {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : '#fff'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#000'};
  }
`;

// 文档项样式
export const DocumentItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: ${props => props.$selected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(24, 250, 239, 0.1)'};  
  }

  &:last-child {
    border-bottom: none;
  }

  /* Ensure checkbox aligns with header */
  > input[type="checkbox"] {
    flex: 0 0 auto;
    margin-right: 12px;
  }
`;

export const DocumentCheckbox = styled.input`
  cursor: pointer;
`;

export const DocumentIcon = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const DocumentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const DocumentName = styled.div`
  color: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.8)' : '#6b7280'};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DocumentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.8)' : '#6b7280'};
`;

export const DocumentStatus = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  
  ${props => {
    switch (props.$status) {
      case 'COMPLETED':
        return `
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
        `;
      case 'PROCESSING':
        return `
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        `;
      case 'UPLOADING':
        return `
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        `;
      case 'FAILED':
        return `
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        `;
      default:
        return `
          background: rgba(156, 163, 175, 0.2);
          color: #9ca3af;
          border: 1px solid rgba(156, 163, 175, 0.3);
        `;
    }
  }}
`;

export const DocumentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
`;

export const DocumentActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#1cc5c590'}; 
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#1cc5c550'}; 
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// 表格头部样式
export const DocumentTableHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.8)' : '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const HeaderCheckbox = styled.input`
  cursor: pointer;
  flex: 0 0 auto;
  margin-right: 12px;
`;

export const HeaderCell = styled.div<{ $width?: string }>`
  ${props => props.$width ? `
    flex: 0 0 ${props.$width};
    width: ${props.$width};
  ` : `
    flex: 1;
  `}
  padding-right: 12px;
  display: flex;
  align-items: center;
  font-size: 14px; 
  color: ${({ theme }) => theme.mode === 'dark' ? '#rgba(255, 255, 255, 0.7)' : '#6b7280'};  
`;

// 表格容器
export const DocumentTable = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const DocumentTableBody = styled.div`
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// 网格视图样式
export const GridDocumentCard = styled.div<{ $selected?: boolean }>`
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid ${props => props.$selected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  ${props => props.$selected && `
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  `}
`;

export const GridDocumentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const GridDocumentCheckbox = styled.input`
  cursor: pointer;
`;

export const GridDocumentContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

export const GridDocumentIcon = styled.div`
  font-size: 32px;
  flex-shrink: 0;
`;

export const GridDocumentDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

export const GridDocumentTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GridDocumentMeta = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
`;

export const GridDocumentPreview = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 8px;
`;

export const GridDocumentActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
`;

export const GridActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const GridActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.4);
          color: #60a5fa;
          
          &:hover {
            background: rgba(59, 130, 246, 0.3);
          }
        `;
      case 'danger':
        return `
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
          
          &:hover {
            background: rgba(239, 68, 68, 0.3);
          }
        `;
      default:
        return `
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fbbf24;
          
          &:hover {
            background: rgba(245, 158, 11, 0.3);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;