"use client";

import React, { useState, useEffect, useRef, KeyboardEvent, FocusEvent } from 'react';
import styled from 'styled-components';

// 样式组件定义
const Container = styled.div`
  position: relative;
  width: 100%;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputField = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  height: 32px;
  border: 1px solid ${({ theme, $hasError }) => 
    $hasError ? '#8B0000' : theme.panel.ctlBorder
  };
  border-radius: 3px;
  padding: 0 32px 0 12px; /* 为下拉图标留出空间 */
  font-size: 12px;
  background: ${({ theme }) => theme.panel.nodeBg};
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  cursor: text;
  transition: all 0.2s ease;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
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

  &:disabled {
    background: ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#f1f5f9'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#6b7280' : '#9ca3af'};
    cursor: not-allowed;
    
    &::placeholder {
      color: ${({ theme }) => theme.mode === 'dark' ? '#6b7280' : '#9ca3af'};
    }
  }
`;

const DropdownIcon = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%) ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  cursor: pointer;
  font-size: 10px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  transition: transform 0.2s ease;
  user-select: none;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.6)'
      : 'rgba(59, 130, 246, 0.5)'
    };
  }
`;

const DropdownContainer = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${({ theme }) => theme.panel.nodeBg};
  border: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  border-radius: 3px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  margin-top: 2px;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#f1f5f9'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.panel.ctlBorder};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark' ? '#6b7280' : '#cbd5e1'};
    }
  }
`;

const OptionItem = styled.div<{ $isHighlighted: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  background: ${props => props.$isHighlighted 
    ? (props.theme.mode === 'dark' ? '#374151' : '#f1f5f9')
    : 'transparent'
  };
  transition: all 0.1s ease;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#f1f5f9'};

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#f1f5f9'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NoOptionsMessage = styled.div`
  padding: 8px 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  font-size: 12px;
  text-align: center;
  font-style: italic;
`;

// 组件 Props 接口
interface InputSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// 主组件
export const InputSelect: React.FC<InputSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "请选择或输入...",
  disabled = false,
  hasError = false,
  style,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当外部value变化时更新内部状态
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 过滤选项（不区分大小写）并去重
  const filteredOptions = Array.from(new Set(
    options.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    )
  ));

  // 监控关键状态变化
  useEffect(() => {
  }, [isOpen, highlightedIndex, inputValue, filteredOptions.length, disabled, value]);

  // 输入框获得焦点时的处理 - 简化，不自动打开下拉框
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    if (!disabled) {
      // 只选中文本，不自动打开下拉框
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select();
        }
      }, 0);
    }
  };

  // 输入框失去焦点时的处理
  const handleBlur = () => {
    if (!disabled) {
      // 提交当前值
      onChange(inputValue);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // 下拉图标点击处理 - 只有这里控制下拉框开关
  const handleDropdownIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
      setHighlightedIndex(-1);
      // 如果打开下拉框，聚焦到输入框
      if (!isOpen) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    }
  };

  // 处理外部点击关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) {
          // 直接关闭下拉框，不调用 handleBlur，避免提交空值
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      }
    };

    // 使用 mousedown 而不是 click，但延迟执行以避免与选项点击冲突
    const handleMouseDown = (e: MouseEvent) => {
      setTimeout(() => handleClickOutside(e), 0);
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // 键盘导航处理
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          const newIndex = Math.min(highlightedIndex + 1, filteredOptions.length - 1);
          setHighlightedIndex(newIndex);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          const newIndex = Math.max(highlightedIndex - 1, -1);
          setHighlightedIndex(newIndex);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else {
          // 提交当前输入值
          onChange(inputValue);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        // Tab键时提交当前值并关闭下拉框
        onChange(inputValue);
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // 选择选项
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setInputValue(selectedValue);
    setIsOpen(false);
    setHighlightedIndex(-1);

    // 移除选择后聚焦输入框的逻辑，避免不必要的事件触发
    // setTimeout(() => {
    //   if (inputRef.current) {
    //     inputRef.current.focus();
    //   }
    // }, 0);
  };

  return (
    <Container ref={containerRef} className={className}>
      <InputWrapper>
        <InputField
          ref={inputRef}
          type="text"
          value={inputValue}
          autoCapitalize="off"
          $hasError={hasError}
          style={style}
          onChange={(e) => {
            // 纯文本输入，不自动打开下拉框
            const newValue = e.target.value;
            const nativeEvent = e.nativeEvent as InputEvent;

            setInputValue(newValue);
            setHighlightedIndex(-1);

          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
              setIsOpen(!isOpen);
              setHighlightedIndex(-1);
              // 如果打开下拉框，聚焦到输入框
              if (!isOpen) {
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 0);
              }
            }
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />
        <DropdownIcon
          $isOpen={isOpen}
          onClick={handleDropdownIconClick}
        >
          ▼
        </DropdownIcon>
      </InputWrapper>

      <DropdownContainer $isOpen={isOpen}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
            return (
              <OptionItem
                key={option}
                $isHighlighted={index === highlightedIndex}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // 立即调用 handleSelect，不延迟
                  handleSelect(option);
                }}
                onMouseDown={(e) => {
                  // 阻止 mousedown 事件冒泡，防止触发外部点击处理
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseEnter={() => {
                  setHighlightedIndex(index);
                }}
              >
                {option}
              </OptionItem>
            );
          })
        ) : (
          <NoOptionsMessage>无选项</NoOptionsMessage>
        )}
      </DropdownContainer>
    </Container>
  );
};
