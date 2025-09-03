import React, { useCallback } from 'react';
import styled from 'styled-components';
import { SupportedFileType, DocumentStatus } from './types';

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const FiltersCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#ffffff'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'};
  border-radius: 0.5rem;
  padding: 1rem;
`;

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  flex: 1;
  min-width: 16rem;
`;

const SearchInputContainer = styled.div`
  position: relative;
`;

const SearchIcon = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  padding-left: 0.75rem;
  display: flex;
  align-items: center;
  pointer-events: none;

  svg {
    height: 1.25rem;
    width: 1.25rem;
    color: #9ca3af;
  }
`;

const SearchInput = styled.input`
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'};
  border-radius: 0.375rem;
  line-height: 1.25;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#ffffff'};
  color: ${({ theme }) => theme.mode === 'dark' ? 'white' : '#1f2937'};

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#6b7280'};
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  &:focus::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9ca3af'};
  }
`;

const FilterContainer = styled.div`
  min-width: 8rem;
`;

const FilterSelect = styled.select`
  display: block;
  width: 100%;
  padding:5px;
  //padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'};
  border-radius: 4px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#ffffff'};
  color: ${({ theme }) => theme.mode === 'dark' ? 'white' : '#1f2937'};
  cursor: pointer;

  option {
    background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#ffffff'};
    color: ${({ theme }) => theme.mode === 'dark' ? 'white' : '#1f2937'};
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const SortButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'};
  border-radius: 0.375rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#ffffff'};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.mode === 'dark' ? 'white' : '#1f2937'};
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#f9fafb'};
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const ClearFiltersButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'};
  border-radius: 0.375rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#ffffff'};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.mode === 'dark' ? 'white' : '#1f2937'};
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#f9fafb'};
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  svg {
    width: 1rem;
    height: 1rem;
    margin-right: 0.25rem;
  }
`;

const ActiveFiltersContainer = styled.div`
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterTag = styled.span<{ $variant: 'search' | 'status' | 'fileType' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.$variant) {
      case 'search': return '#dbeafe';
      case 'status': return '#dcfce7';
      case 'fileType': return '#f3e8ff';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$variant) {
      case 'search': return '#1e40af';
      case 'status': return '#166534';
      case 'fileType': return '#7c3aed';
      default: return '#374151';
    }
  }};
`;

const FilterTagRemove = styled.button<{ $variant: 'search' | 'status' | 'fileType' }>`
  margin-left: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => {
    switch (props.$variant) {
      case 'search': return '#2563eb';
      case 'status': return '#16a34a';
      case 'fileType': return '#9333ea';
      default: return '#6b7280';
    }
  }};
  transition: color 0.15s ease-in-out;

  &:hover {
    color: ${props => {
      switch (props.$variant) {
        case 'search': return '#1d4ed8';
        case 'status': return '#15803d';
        case 'fileType': return '#7c2d12';
        default: return '#374151';
      }
    }};
  }

  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

interface DocumentFiltersProps {
  filters: {
    status: string;
    fileType: string;
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  onFiltersChange: (filters: Partial<DocumentFiltersProps['filters']>) => void;
  className?: string;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value });
  }, [onFiltersChange]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ status: e.target.value });
  }, [onFiltersChange]);

  const handleFileTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ fileType: e.target.value });
  }, [onFiltersChange]);

  const handleSortByChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ sortBy: e.target.value });
  }, [onFiltersChange]);

  const handleSortOrderToggle = useCallback(() => {
    onFiltersChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
  }, [filters.sortOrder, onFiltersChange]);

  const clearFilters = useCallback(() => {
    onFiltersChange({
      status: '',
      fileType: '',
      search: '',
      sortBy: 'uploadTime',
      sortOrder: 'desc'
    });
  }, [onFiltersChange]);

  const hasActiveFilters = filters.status || filters.fileType || filters.search;

  return (
    <Container className={`document-filters ${className}`}>
      <FiltersCard>
        <FiltersRow>
          {/* 搜索框 */}
          <SearchContainer>
            <SearchInputContainer>
              <SearchIcon>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="搜索文档名称或内容..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </SearchInputContainer>
          </SearchContainer>

          {/* 状态过滤 */}
          <FilterContainer>
            <FilterSelect
              value={filters.status}
              onChange={handleStatusChange}
            >
              <option value="">所有状态</option>
              <option value={DocumentStatus.UPLOADING}>上传中</option>
              <option value={DocumentStatus.PROCESSING}>处理中</option>
              <option value={DocumentStatus.COMPLETED}>已完成</option>
              <option value={DocumentStatus.FAILED}>失败</option>
            </FilterSelect>
          </FilterContainer>

          {/* 文件类型过滤 */}
          <FilterContainer>
            <FilterSelect
              value={filters.fileType}
              onChange={handleFileTypeChange}
            >
              <option value="">所有类型</option>
              <option value={SupportedFileType.PDF}>PDF</option>
              <option value={SupportedFileType.DOC}>DOC</option>
              <option value={SupportedFileType.DOCX}>DOCX</option>
              <option value={SupportedFileType.TXT}>TXT</option>
              <option value={SupportedFileType.MD}>Markdown</option>
              <option value={SupportedFileType.XLS}>XLS</option>
              <option value={SupportedFileType.XLSX}>XLSX</option>
              <option value={SupportedFileType.PPT}>PPT</option>
              <option value={SupportedFileType.PPTX}>PPTX</option>
              <option value={SupportedFileType.JSON}>JSON</option>
              <option value={SupportedFileType.CSV}>CSV</option>
            </FilterSelect>
          </FilterContainer>

          {/* 排序方式 */}
          <FilterContainer>
            <FilterSelect
              value={filters.sortBy}
              onChange={handleSortByChange}
            >
              <option value="uploadTime">上传时间</option>
              <option value="fileName">文件名</option>
              <option value="fileSize">文件大小</option>
              <option value="status">状态</option>
            </FilterSelect>
          </FilterContainer>

          {/* 排序顺序 */}
          <SortButton
            onClick={handleSortOrderToggle}
            title={filters.sortOrder === 'asc' ? '升序' : '降序'}
          >
            {filters.sortOrder === 'asc' ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </SortButton>

          {/* 清除过滤器 */}
          {hasActiveFilters && (
            <ClearFiltersButton onClick={clearFilters}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              清除
            </ClearFiltersButton>
          )}
        </FiltersRow>

        {/* 活动过滤器显示 */}
        {hasActiveFilters && (
          <ActiveFiltersContainer>
            {filters.search && (
              <FilterTag $variant="search">
                搜索: {filters.search}
                <FilterTagRemove
                  $variant="search"
                  onClick={() => onFiltersChange({ search: '' })}
                >
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </FilterTagRemove>
              </FilterTag>
            )}
            {filters.status && (
              <FilterTag $variant="status">
                状态: {filters.status === DocumentStatus.UPLOADING ? '上传中' :
                      filters.status === DocumentStatus.PROCESSING ? '处理中' :
                      filters.status === DocumentStatus.COMPLETED ? '已完成' : '失败'}
                <FilterTagRemove
                  $variant="status"
                  onClick={() => onFiltersChange({ status: '' })}
                >
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </FilterTagRemove>
              </FilterTag>
            )}
            {filters.fileType && (
              <FilterTag $variant="fileType">
                类型: {filters.fileType.toUpperCase()}
                <FilterTagRemove
                  $variant="fileType"
                  onClick={() => onFiltersChange({ fileType: '' })}
                >
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </FilterTagRemove>
              </FilterTag>
            )}
          </ActiveFiltersContainer>
        )}
      </FiltersCard>
    </Container>
  );
};