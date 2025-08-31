import React from 'react';
import { CiSearch } from "react-icons/ci";
import { RiRefreshLine } from "react-icons/ri";
import { FaTrash } from "react-icons/fa6"; 
import { IoChevronDown } from "react-icons/io5";

import {
  GlassSearchContainer,
  GlassSearchInput,
  GlassSearchIcon,
  GlassControlButton
} from '../../components/shared/ui-components';

export interface ToolbarControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sortBy: string;
  onSortChange?: () => void;
  onRefresh?: () => void;
  onDelete?: () => void;
  showRefresh?: boolean;
  showDelete?: boolean;
}

export const ToolbarControls: React.FC<ToolbarControlsProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search",
  sortBy,
  onSortChange,
  onRefresh,
  onDelete,
  showRefresh = true,
  showDelete = true,
}) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 30px 8px',//移动工具栏位置
      gap: '20px'
    }}>
      <GlassSearchContainer>
        <GlassSearchIcon>
          <CiSearch size={14} />
        </GlassSearchIcon>
        <GlassSearchInput
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </GlassSearchContainer>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <GlassControlButton onClick={onSortChange}>
          <span>{sortBy === 'last-updated' ? '时间' : '名称'}排序</span>
          <IoChevronDown size={12} />
        </GlassControlButton>
        {showRefresh && (
          <GlassControlButton onClick={onRefresh}>
            <RiRefreshLine size={16} />
          </GlassControlButton>
        )}
        {showDelete && (
          <GlassControlButton onClick={onDelete}>
            <FaTrash size={16} />
          </GlassControlButton>
        )}
      </div>
    </div>
  );
}; 