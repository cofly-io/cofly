import React from 'react';
import styled, { css } from 'styled-components';

// Switch控件的Props接口
export interface SwitchProps {
  value?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: (e: React.MouseEvent) => void;
}

// 样式化的Switch组件
const StyledSwitch = styled.div<{ $active: boolean; $disabled?: boolean; $size?: string }>`
  position: relative;
  width: ${({ $size }) => {
    switch ($size) {
      case 'medium': return '48px';
      case 'large': return '56px';
      default: return '40px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'medium': return '24px';
      case 'large': return '30px';
      default: return '18px';
    }
  }};
  background: ${({ $active, theme, $disabled }) => {
    if ($disabled) {
      return theme.mode === 'dark' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.3)';
    }
    if (theme.mode === 'dark') {
      return $active
        ? 'rgba(59, 130, 246, 0.5)'
        : 'rgba(59, 130, 246, 0.2)';
    } else {
      return $active
        ? 'rgba(59, 130, 246, 0.5)'
        : 'white';
    }
  }};
  border-radius: ${({ $size }) => {
    switch ($size) {
      case 'medium': return '12px';
      case 'large': return '14px';
      default: return '10px';
    }
  }};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  border: 1px solid ${({ $active, theme, $disabled }) => {
    if ($disabled) {
      return theme.mode === 'dark' ? 'rgba(100, 116, 139, 0.4)' : 'rgba(148, 163, 184, 0.4)';
    }
    if (theme.mode === 'dark') {
      return $active
        ? 'rgba(59, 130, 246, 0.6)'
        : 'rgba(59, 130, 246, 0.3)';
    } else {
      return $active
        ? 'rgba(59, 130, 246, 0.6)'
        : 'rgba(200, 200, 202, 0.8)'; // 灰色边框
    }
  }};
  
  ${props => props.$active && !props.$disabled && css`
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
  `}
  
  &::before {
    content: "";
    position: absolute;
    top: ${({ $size }) => {
    switch ($size) {
      case 'medium': return '2px';
      case 'large': return '3px';
      default: return '1px';
    }
  }};
    left: ${props => {
    const { $active, $size } = props;
    if ($size === 'small') {
      return $active ? '23px' : '2px';
    } else if ($size === 'large') {
      return $active ? '29px' : '3px';
    } else {
      return $active ? '26px' : '2px';
    }
  }};
    width: ${({ $size }) => {
    switch ($size) {
      case 'medium': return '18px';
      case 'large': return '24px';
      default: return '14px';
    }
  }};
    height: ${({ $size }) => {
    switch ($size) {
      case 'medium': return '18px';
      case 'large': return '24px';
      default: return '14px';
    }
  }};
    background: ${({ $active, $disabled }) => {
    if ($disabled) {
      return '#94a3b8';
    }
    return $active ? '#3b82f6' : '#e2e8f0';
  }};
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: ${({ $active, $disabled }) => {
    if ($disabled) {
      return '0 2px 4px rgba(0, 0, 0, 0.1)';
    }
    return $active
      ? '0 2px 10px rgba(59, 130, 246, 0.5)'
      : '0 2px 6px rgba(0, 0, 0, 0.25)';
  }};
  }
`;

// Switch控件组件
export const Switch: React.FC<SwitchProps> = ({
  value = false,
  onChange,
  disabled = false,
  size = 'small',
  onClick
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
    if (!disabled && onChange) {
      onChange(!value);
    }
  };

  return (
    <StyledSwitch
      $active={value}
      $disabled={disabled}
      $size={size}
      onClick={handleClick}
      role="switch"
      aria-checked={value}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      <div />
    </StyledSwitch>
  );
};

export default Switch;