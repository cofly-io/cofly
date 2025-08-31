"use client";

import React from 'react';
import styled from 'styled-components';

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #33C2EE;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  cursor: pointer;
  user-select: none;
  
  &:has(input:disabled) {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

interface CheckBoxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export const CheckBox: React.FC<CheckBoxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <CheckboxContainer>
      <CheckboxInput
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      {label && (
        <CheckboxLabel htmlFor={id}>
          {label}
        </CheckboxLabel>
      )}
    </CheckboxContainer>
  );
};

// 默认导出
export default CheckBox;
