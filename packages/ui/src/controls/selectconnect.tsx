"use client";

import React, { useState } from 'react';
import styled from 'styled-components';

interface DataSourceItem {
  value: string | number;
  text: string;
  description?: string;
}

interface SelecConnectProps {
  datasource: DataSourceItem[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
  height: 32px;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  border-radius: 3px;
  padding: 0 12px;
  background: ${({ theme }) => theme.panel.nodeBg};
  box-sizing: border-box;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;

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
`;

const SelectedValue = styled.div`
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  font-size: 12px;
  line-height: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const DropdownIcon = styled.span`
  margin-left: 8px;
  transition: transform 0.2s ease;
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  font-size: 12px;
  
  &.open {
    transform: rotate(180deg);
  }
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.panel.nodeBg};
  border: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  border-radius: 3px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
  margin: 2px 0 0 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  
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

const DropdownItem = styled.li<{ $isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.1s ease;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#f1f5f9'};

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#f1f5f9'};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.$isSelected && `
    background: ${props.theme.mode === 'dark' ? '#374151' : '#f1f5f9'};
  `}
`;

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OptionText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  font-weight: 500;
`;

const OptionDescription = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  line-height: 1.4;
  margin-top: 2px;
`;

const PlaceholderText = styled.span`
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  font-size: 12px;
`;

export const SelecConnect: React.FC<SelecConnectProps> = ({
  datasource,
  value,
  onChange,
  placeholder = '请选择',
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = datasource.find(item => item.value === value);

  const handleSelect = (item: DataSourceItem) => {
    onChange?.(item.value);
    setIsOpen(false);
  };

  return (
    <SelectContainer 
      style={style} 
      onClick={() => setIsOpen(!isOpen)}
      tabIndex={0}
    >
      <SelectedValue>
        {selectedItem ? (
          <OptionText>{selectedItem.text}</OptionText>
        ) : (
          <PlaceholderText>{placeholder}</PlaceholderText>
        )}
        <DropdownIcon className={isOpen ? 'open' : ''}>▼</DropdownIcon>
      </SelectedValue>

      {isOpen && (
        <DropdownList>
          {datasource.map((item) => (
            <DropdownItem
              key={item.value}
              $isSelected={item.value === value}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(item);
              }}
            >
              <OptionContainer>
                <OptionText>{item.text}</OptionText>
                {item.description && (
                  <OptionDescription>{item.description}</OptionDescription>
                )}
              </OptionContainer>
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </SelectContainer>
  );
};