"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';

interface SelectFilterOption {
  value: string | number;
  label: string;
}

interface SelectFilterProps {
  staticOptions?: SelectFilterOption[]; // 静态选项，可选
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  filterPlaceholder?: string;
  style?: React.CSSProperties;
  // 动态加载相关props
  datasourceId?: string; // 数据源ID，用于触发数据加载
  onLoadOptions?: (datasourceId: string, search?: string) => Promise<SelectFilterOption[]>; // 动态加载回调
  enableDynamicLoad?: boolean; // 是否启用动态加载
  // 新增：直接传递表名数据
  options?: SelectFilterOption[]; // 表名选项，由上层传递
  onFetchConnectDetail?: (datasourceId: string) => Promise<{
    loading: boolean;
    error: string | null;
    tableOptions: Array<{ label: string; value: string; }>;
  }>; // 动态获取表名的回调
  // 新增：联动状态支持
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  // 新增：验证错误支持
  hasError?: boolean;
}

const SelectFilterContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectFilterInput = styled.div<{ $disabled?: boolean; $hasError?: boolean }>`
  width: 100%;
  padding: 4px;
  border: 1px solid ${props =>
    props.$hasError ? '#8B0000' : (props.theme?.panel?.ctlBorder || '#e5e7eb')
  };
  border-radius: 3px;
  font-size: 12px;
  color: ${props => props.$disabled ? (props.theme?.colors?.textTertiary || '#9ca3af') : (props.theme?.colors?.textPrimary || '#374151')};
  background: ${props => props.$disabled ? '#f9fafb' : (props.theme?.colors?.inputBg || '#ffffff')};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  outline: none;
  box-sizing: border-box;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  
  &:hover {
    border-color: ${props => props.$disabled ? (props.theme?.colors?.border || '#e5e7eb') : (props.theme.panel.ctlBorder || '#d1d5db')};
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
    color: ${props => props.theme?.colors?.textTertiary || '#9ca3af'};
    font-size: 12px;
  }
`;

const DropdownIcon = styled.span`
  margin-right: 8px;
  transition: transform 0.2s ease;
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  font-size: 12px;
  
  &.open {
    transform: rotate(180deg);
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
`;

const SelectedText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  padding: 2px 4px;
  margin-left: 8px;
  cursor: pointer;
  color: ${props => props.theme?.colors?.textSecondary || '#6b7280'};
  font-size: 12px;
  border-radius: 2px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;

  &:hover {
    background: #f3f4f6;
    color: ${props => props.theme?.colors?.textPrimary || '#374151'};
  }

  &:active {
    background: #e5e7eb;
  }

  &:focus {
    outline: 1px solid ${props => props.theme?.colors?.accent || '#3b82f6'};
    outline-offset: 1px;
  }
`;

const ControlsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DropdownContainer = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: ${props => props.theme?.colors?.inputBg || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: 4px;
  margin-top: 2px;
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 6px;
  border: none;
  border-bottom: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  outline: none;
  font-size: 12px;
  color: ${props => props.theme?.colors?.textPrimary || '#374151'};
  background: ${props => props.theme?.colors?.inputBg || '#ffffff'};
  box-sizing: border-box;

  &:focus {
    border-bottom: 1px solid ${props => props.theme?.colors?.accent || '#3b82f6'};
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme?.colors?.textTertiary || '#9ca3af'};
    font-size: 12px;
  }
`;

const Option = styled.div<{ $isSelected?: boolean }>`
  padding: 8px;
  cursor: pointer;
  font-size: 12px;
  color: ${props => props.$isSelected ? '#ffffff' : (props.theme?.colors?.textPrimary || '#374151')};
  background: ${props => props.$isSelected ? (props.theme?.colors?.accent || '#3b82f6') : 'transparent'};
  transition: all 0.15s ease;
  box-sizing: border-box;

  &:hover {
    background: ${props => props.$isSelected ? (props.theme?.colors?.accent || '#3b82f6') : '#f9fafb'};
  }
`;

const NoResults = styled.div`
  padding: 8px;
  color: ${props => props.theme?.colors?.textSecondary || '#6b7280'};
  font-size: 12px;
  text-align: center;
  box-sizing: border-box;
`;

const LoadingMessage = styled.div`
  padding: 8px;
  color: ${props => props.theme?.colors?.textSecondary || '#6b7280'};
  font-size: 12px;
  text-align: center;
  box-sizing: border-box;
`;

const ErrorMessage = styled.div`
  padding: 8px;
  color: ${props => props.theme?.colors?.error || '#ef4444'};
  font-size: 12px;
  text-align: center;
  box-sizing: border-box;
`;

// 默认的动态加载函数（保留向后兼容性）
const defaultLoadOptions = async (datasourceId: string, search?: string): Promise<SelectFilterOption[]> => {
  console.warn('SelectFilter: 直接API调用已废弃，请通过props传递数据');
  return [];
};

export const SelectFilter: React.FC<SelectFilterProps> = ({
  staticOptions = [],
  value,
  onChange,
  placeholder = '请选择',
  filterPlaceholder = '输入过滤条件...',
  style,
  datasourceId,
  onLoadOptions = defaultLoadOptions,
  enableDynamicLoad = false,
  options = [],
  loading = false,
  error = null,
  onFetchConnectDetail,
  disabled = false,
  hasError = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [dynamicOptions, setDynamicOptions] = useState<SelectFilterOption[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);

  // 确定当前使用的选项列表
  // 优先级 ptions > dynamicOptions > staticOption
  const currentOptions = options.length > 0 ? options :
    (enableDynamicLoad ? dynamicOptions : staticOptions);

  // 确定当前的加载和错误状态
  // 合并内部和外部的loading/error状态
  const currentLoading = loading || (options.length > 0 ? false : internalLoading);
  const currentError = error || (options.length > 0 ? null : internalError);

  // 当前选中的选项
  // 如果在当前选项中找不到，但有值，则创建一个临时选项用于显示
  const selectedOption = currentOptions.find(opt => opt.value === value) ||
    (value ? { value, label: value } : undefined);

  // 过滤后的选项
  const filteredOptions = currentOptions.filter(opt =>
    opt.label.toLowerCase().includes(filterText.toLowerCase())
  );

  // 动态加载数据的函数（仅在没有外部tableOptions时使用）
  const loadOptions = useCallback(async (search?: string) => {
    // 如果有外部传递的tableOptions，则不执行内部加载
    if (options.length > 0) {
      return;
    }

    if (!enableDynamicLoad || !datasourceId) {
      if (enableDynamicLoad && !datasourceId) {
        setInternalError('未指定数据源');
      }
      return;
    }

    // 如果已经在加载中或已有数据，避免重复请求
    if (internalLoading || (dynamicOptions.length > 0 && !search)) {
      return;
    }

    setInternalLoading(true);
    setInternalError(null);

    try {
      // 优先使用新的onFetchConnectDetail回调
      if (onFetchConnectDetail) {
        const result = await onFetchConnectDetail(datasourceId);
        setDynamicOptions(result.tableOptions);
        if (result.error) {
          setInternalError(result.error);
        }
      } else {
        // 回退到原有的onLoadOptions
        const loadedOptions = await onLoadOptions(datasourceId, search);
        setDynamicOptions(loadedOptions);
      }
    } catch (err) {
      setInternalError(err instanceof Error ? err.message : '加载数据失败');
      setDynamicOptions([]);
    } finally {
      setInternalLoading(false);
    }
  }, [enableDynamicLoad, datasourceId, onLoadOptions, onFetchConnectDetail, options.length, internalLoading, dynamicOptions.length]);

  // 当数据源ID变化时，清空之前的数据（仅在没有外部tableOptions时）
  useEffect(() => {
    if (options.length > 0) {
      return; // 有外部数据时，不处理内部状态
    }

    if (enableDynamicLoad) {
      if (datasourceId) {
        // 有数据源时，清空之前的数据和错误状态
        setDynamicOptions([]);
        setInternalError(null);
      } else {
        // 没有数据源时，清空数据并设置错误
        setDynamicOptions([]);
        setInternalError('请先选择数据源');
      }
    }
  }, [enableDynamicLoad, datasourceId, options.length]);

  // 当下拉框打开且启用动态加载时，加载数据（仅在没有外部tableOptions时）
  useEffect(() => {
    if (options.length > 0) {
      return; // 有外部数据时，不执行内部加载
    }

    // 只在下拉框打开时加载一次数据，避免重复请求
    if (enableDynamicLoad && datasourceId && isOpen && dynamicOptions.length === 0 && !internalLoading && !internalError) {
      // 直接调用加载逻辑，避免依赖loadOptions函数
      const loadData = async () => {
        if (!enableDynamicLoad || !datasourceId || internalLoading || (dynamicOptions.length > 0)) {
          return;
        }

        setInternalLoading(true);
        setInternalError(null);

        try {
          if (onFetchConnectDetail) {
            const result = await onFetchConnectDetail(datasourceId);
            setDynamicOptions(result.tableOptions);
            if (result.error) {
              setInternalError(result.error);
            }
          } else {
            const loadedOptions = await onLoadOptions(datasourceId);
            setDynamicOptions(loadedOptions);
          }
        } catch (err) {
          setInternalError(err instanceof Error ? err.message : '加载数据失败');
          setDynamicOptions([]);
        } finally {
          setInternalLoading(false);
        }
      };

      loadData();
    }
  }, [isOpen, enableDynamicLoad, datasourceId, options.length, dynamicOptions.length, internalLoading, internalError, onFetchConnectDetail, onLoadOptions]); // 包含必要的依赖

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFilterText(''); // 关闭时清空过滤文本
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 当下拉框打开时，自动聚焦到过滤输入框
  // useEffect(() => {
  //   if (isOpen && filterInputRef.current) {
  //     setTimeout(() => {
  //       filterInputRef.current?.focus();
  //     }, 100);
  //   }
  // }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFilterText(''); // 打开时清空过滤文本
    }
  };

  const handleSelect = (option: SelectFilterOption) => {
    onChange?.(option.value);
    setIsOpen(false);
    setFilterText('');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilterText = e.target.value;
    setFilterText(newFilterText);

    // 动态加载模式下，只在前端进行过滤，不再请求接口
    // 数据已经在下拉框打开时一次性加载完成
  };

  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      // 回车选择第一个匹配项
      handleSelect(filteredOptions?.[0]!);
    } else if (e.key === 'Escape') {
      // ESC 关闭下拉框
      setIsOpen(false);
      setFilterText('');
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发下拉框

    if (!selectedOption) return;

    try {
      await navigator.clipboard.writeText(String(selectedOption.label));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500); // 1.5秒后隐藏成功提示
    } catch (err) {
      console.error('复制失败:', err);
      // 降级方案：使用传统的复制方法
      try {
        const textArea = document.createElement('textarea');
        textArea.value = String(selectedOption.label);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 1500);
      } catch (fallbackErr) {
        console.error('降级复制也失败:', fallbackErr);
      }
    }
  };

  return (
    <SelectFilterContainer ref={containerRef} style={style}>
      <SelectFilterInput onClick={handleToggle} tabIndex={disabled ? -1 : 0} $disabled={disabled} $hasError={hasError}>
        <ContentWrapper>
          {selectedOption ? (
            <SelectedText>{selectedOption.label}</SelectedText>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </ContentWrapper>
        <ControlsWrapper>
          {selectedOption && !disabled && (
            <CopyButton
              onClick={handleCopy}
              title={copySuccess ? '已复制!' : '复制内容'}
              type="button"
            >
              {copySuccess ? '✓' : '📋'}
            </CopyButton>
          )}
          <DropdownIcon>{isOpen ? '▲' : '▼'}</DropdownIcon>
        </ControlsWrapper>
      </SelectFilterInput>

      <DropdownContainer $isOpen={isOpen}>
        <FilterInput
          ref={filterInputRef}
          value={filterText}
          onChange={handleFilterChange}
          onKeyDown={handleFilterKeyDown}
          placeholder={filterPlaceholder}
          onClick={e => e.stopPropagation()}
        />
        {currentLoading ? (
          <LoadingMessage>正在加载数据...</LoadingMessage>
        ) : currentError ? (
          <ErrorMessage>{currentError}</ErrorMessage>
        ) : filteredOptions.length > 0 ? (
          filteredOptions.map(staticOptions => (
            <Option
              key={staticOptions.value}
              $isSelected={staticOptions.value === value}
              onClick={() => handleSelect(staticOptions)}
            >
              {staticOptions.label}
            </Option>
          ))
        ) : (
          <NoResults>{enableDynamicLoad ? '没有找到匹配的数据' : '没有匹配的选项'}</NoResults>
        )}
      </DropdownContainer>
    </SelectFilterContainer>
  );
};