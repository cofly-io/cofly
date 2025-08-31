"use client";

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  isSearch?: boolean; // 新增：是否显示搜索功能
  error?: string; // 新增：错误信息
}

const SelectContainer = styled.div`
  position: relative;
  width: 100%; // 修改：宽度改为 100%
`;

const SelectInput = styled.div<{ $hasError?: boolean }>`
  width: 100%;
  height: 32px; // 修改：高度改为 32px
  padding: 0 12px; // 修改：调整 padding 以适应新高度
  border: 1px solid ${({ theme, $hasError }) => 
    $hasError ? '#8B0000' : theme.panel.ctlBorder
  };
  border-radius: 4px;
  font-size: 12px; // 修改：字体改为 12px
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  background: ${({ theme }) => theme.panel.nodeBg};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  box-sizing: border-box; // 新增：确保 padding 不影响总高度
  
  &:hover {
    border-color: ${({ theme }) => theme.panel.ctlBorder};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.6)'
      : 'rgba(59, 130, 246, 0.5)'
    };
    box-shadow: ${({ theme }) => theme.mode === 'dark'
      ? '0 0 20px rgba(59, 130, 246, 0.3)'
      : '0 0 20px rgba(59, 130, 246, 0.2)'
    };
  }

  .placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
    font-size: 12px; // 修改：字体改为 12px
  }
`;

const DropdownContainer = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.panel.nodeBg};
  border: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  border-radius: 4px;
  margin-top: 2px;
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  width: 100%;
  height: 32px; // 修改：高度与主输入框一致
  padding: 0 8px; // 修改：调整 padding
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  outline: none;
  font-size: 12px; // 修改：字体改为 12px
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  background: transparent;
  box-sizing: border-box;

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
    font-size: 12px; // 修改：字体改为 12px
  }
`;

const Option = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px; // 修改：字体改为 12px
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  transition: all 0.1s ease;
  min-height: 32px; // 新增：选项最小高度
  display: flex;
  align-items: center;
  box-sizing: border-box;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#f1f5f9'};
  }
`;

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择',
  style,
  isSearch = false, // 新增：默认不显示搜索功能
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 当前选中的选项
  const selectedOption = options.find(opt => opt.value === value);

  // 过滤后的选项
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchText.toLowerCase())
  );

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SelectOption) => {
    onChange?.(option.value);
    setIsOpen(false);
    setSearchText('');
  };

  return (
    <SelectContainer ref={containerRef} style={style}>
      <SelectInput onClick={() => setIsOpen(!isOpen)} tabIndex={0} $hasError={!!error}>
        {selectedOption ? (
          <span>{selectedOption.label}</span>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <span style={{color:"#64748b"}}>{isOpen ? '▲' : '▼'}</span>
      </SelectInput>

      <DropdownContainer $isOpen={isOpen}>
        {/* 修改：只有当 isSearch 为 true 时才显示搜索框 */}
        {isSearch && (
          <SearchInput
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="搜索..."
            onClick={e => e.stopPropagation()}
          />
        )}
        {filteredOptions.map(option => (
          <Option
            key={option.value}
            onClick={() => handleSelect(option)}
          >
            {option.label}
          </Option>
        ))}
      </DropdownContainer>
    </SelectContainer>
  );
};
