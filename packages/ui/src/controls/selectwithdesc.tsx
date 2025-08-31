"use client";

import React, { useState } from 'react';
import styled from 'styled-components';

interface DataSourceItem {
  value: string | number;
  text: string;
  description?: string;
}

interface SelectWithDescProps {
  datasource: DataSourceItem[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
  min-width: 120px;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.inputBg};
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent}20;
    outline: none;
  }
`;

const SelectedValue = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.5;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DropdownIcon = styled.span`
  margin-left: 8px;
  transition: transform 0.2s ease;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  &.open {
    transform: rotate(180deg);
  }
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  list-style: none;
  padding: 4px 0;
  margin: 4px 0 0 0;
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
`;

const DropdownItem = styled.li<{ $isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.buttonHover};
  }
  
  ${props => props.$isSelected && `
    background-color: ${props.theme.colors.accent}20;
    color: ${props.theme.colors.accent};
  `}
`;

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OptionText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const OptionDescription = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
`;

const PlaceholderText = styled.span`
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: 14px;
`;

export const SelectWithDesc: React.FC<SelectWithDescProps> = ({
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
          <OptionContainer>
            <OptionText>{selectedItem.text}</OptionText>
            {selectedItem.description && (
              <OptionDescription>{selectedItem.description}</OptionDescription>
            )}
          </OptionContainer>
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