import React, { useCallback } from 'react';
import { FilesPaginationInfo } from './types';
import {
  PaginationWrapper,
  PaginationInfo,
  PaginationControls,
  PaginationButton,
  PageNumberButton,
  PageSizeSelect,
  DisplayPerPage
} from './styles';

interface FilesPaginationProps {
  pagination: FilesPaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
}

export const FilesPagination: React.FC<FilesPaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  className = ''
}) => {
  const { page, limit, total, totalPages, hasNextPage, hasPrevPage } = pagination;

  const handlePrevPage = useCallback(() => {
    if (hasPrevPage) {
      onPageChange(page - 1);
    }
  }, [hasPrevPage, page, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      onPageChange(page + 1);
    }
  }, [hasNextPage, page, onPageChange]);

  const handlePageClick = useCallback((targetPage: number) => {
    if (targetPage !== page && targetPage >= 1 && targetPage <= totalPages) {
      onPageChange(targetPage);
    }
  }, [page, totalPages, onPageChange]);

  const handleLimitChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onLimitChange(parseInt(e.target.value));
  }, [onLimitChange]);

  // 生成页码数组
  const getPageNumbers = useCallback(() => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数不超过最大显示页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 复杂的分页逻辑
      if (page <= 4) {
        // 当前页在前面
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        // 当前页在后面
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [page, totalPages]);

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  if (total === 0) {
    return null;
  }

  return (
    <PaginationWrapper>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* 显示信息 */}
        <PaginationInfo>
          显示第 <strong>{startItem}</strong> 到 <strong>{endItem}</strong> 项，共 <strong>{total}</strong> 项
        </PaginationInfo>

        {/* 每页显示数量选择 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DisplayPerPage>
            每页显示:
          </DisplayPerPage>
          <PageSizeSelect
            value={limit}
            onChange={handleLimitChange}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </PageSizeSelect>
        </div>
      </div>

      {/* 页码导航 */}
      <PaginationControls>
        {/* 上一页按钮 */}
        <PaginationButton
          onClick={handlePrevPage}
          $disabled={!hasPrevPage}
          disabled={!hasPrevPage}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </PaginationButton>

        {/* 页码按钮 */}
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 8px',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                ...
              </span>
            );
          }

          const isCurrentPage = pageNum === page;
          return (
            <PageNumberButton
              key={pageNum}
              $active={isCurrentPage}
              onClick={() => handlePageClick(pageNum as number)}
            >
              {pageNum}
            </PageNumberButton>
          );
        })}

        {/* 下一页按钮 */}
        <PaginationButton
          onClick={handleNextPage}
          $disabled={!hasNextPage}
          disabled={!hasNextPage}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </PaginationButton>
      </PaginationControls>
    </PaginationWrapper>
  );
};