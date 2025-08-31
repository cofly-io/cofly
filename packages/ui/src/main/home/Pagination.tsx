import React from 'react';
import { PaginationProps } from './types';
import { useTheme } from '../../context/ThemeProvider';

// 导入UI组件样式
import {
  GlassPagination,
  GlassPageButton
} from '../../components/shared/ui-components';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const { theme } = useTheme();
  
  return (
    <GlassPagination>
      <div style={{ 
        color: theme.mode === 'dark' ? '#969696' : '#94a3b8', 
        fontSize: '14px' 
      }}>
        总数 {totalItems}
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px' 
      }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <GlassPageButton
            key={page}
            $active={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
          </GlassPageButton>
        ))}
        <select 
          value={pageSize} 
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1); // Reset to first page when page size changes
          }}
          style={{
            padding: '0px 12px',
            border: theme.mode === 'dark' 
              ? '1px solid rgba(59, 130, 246, 0.2)' 
              : '1px solid rgba(59, 130, 246, 0.15)',
            borderRadius: '2px',
            fontSize: '12px',
            height:'32px',
            background: theme.mode === 'dark' 
              ? 'rgba(74, 103, 150, 0.8)' 
              : 'rgba(248, 250, 252, 0.6)',
            color: theme.mode === 'dark' ? '#fff' : '#64748b',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          <option value={10}>10/页</option>
          <option value={25}>25/页</option>
          <option value={50}>50/页</option>
          <option value={100}>100/页</option>
        </select>
      </div>
    </GlassPagination>
  );
};