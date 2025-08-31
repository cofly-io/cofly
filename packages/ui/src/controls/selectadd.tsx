"use client";

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface SelectAddOption {
    value: string | number;
    label: string;
    description?: string;
}

interface SelectAddProps {
    options: SelectAddOption[];
    value?: string | number;
    onChange?: (value: string | number) => void;
    placeholder?: string;
    label?: string;
    style?: React.CSSProperties;
    default?: string;
}

const SelectAddContainer = styled.div`
  position: relative;
  width: 100%;
`;

const LabelDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  border-radius: 3px;
  padding: 0 12px;
  font-size: 12px;
  background:${({ theme }) => theme.mode === 'dark' ? '#133251' : '#bfbfbf'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  cursor: pointer;
  
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
`;

const LabelText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#94a3b8'};
  font-weight: normal;
`;

const DropdownArrow = styled.span<{ $isOpen: boolean }>`
  position: absolute;
  right: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  user-select: none;
`;

const DropdownContainer = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.panel.nodeBg};

  border: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  border-radius: 3px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
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

const Option = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.1s ease;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#f1f5f9'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#f1f5f9'};
  }
  
  &:active {
    background: ${({ theme }) => theme.mode === 'dark' ? '#4b5563' : '#e2e8f0'};
  }
`;

const OptionLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
//   font-weight: 500;
`;

const OptionDescription = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  margin-top: 2px;
`;

export const SelectAdd: React.FC<SelectAddProps> = ({
    options,
    value,
    onChange,
    placeholder = "选择选项",
    label,
    style,
    default: defaultText
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 始终显示 default 值或 placeholder，不显示选中的值
    const displayText = defaultText || label || placeholder;

    // 处理选项选择
    const handleSelect = (option: SelectAddOption) => {
        onChange?.(option.value);
        setIsOpen(false);
    };

    // 处理点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // 处理键盘事件
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <SelectAddContainer ref={containerRef} style={style} onKeyDown={handleKeyDown}>
            <LabelDisplay onClick={() => setIsOpen(!isOpen)}>
                <LabelText>
                    {displayText}
                </LabelText>
                <DropdownArrow $isOpen={isOpen}>▼</DropdownArrow>
            </LabelDisplay>

            <DropdownContainer $isOpen={isOpen}>
                {options.map(option => (
                    <Option
                        key={option.value}
                        onClick={() => handleSelect(option)}
                    >
                        <OptionLabel>{option.label}</OptionLabel>
                        {option.description && (
                            <OptionDescription>{option.description}</OptionDescription>
                        )}
                    </Option>
                ))}
                {options.length === 0 && (
                    <Option style={{ cursor: 'default', opacity: 0.6,fontSize:'12px' }}>
                        没有可选项
                    </Option>
                )}
            </DropdownContainer>
        </SelectAddContainer>
    );
};

export default SelectAdd;