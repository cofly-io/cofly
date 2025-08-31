"use client";

import React from 'react';
import styled from 'styled-components';

// 按钮组容器
const ButtonContainer = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
`;

// 数据视图按钮样式
const DataViewButton = styled.button<{ $active?: boolean; $activeBackground?: string; $inactiveBackground?: string }>`
    background: ${({ $active, $activeBackground, $inactiveBackground }) => {
        if ($active && $activeBackground) {
            return $activeBackground;
        }
        if (!$active && $inactiveBackground) {
            return $inactiveBackground;
        }
        return $active ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.08)';
    }};
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0px;
    height: 28px;
    padding: 0px 14px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    &:hover {
      opacity: 0.8;
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    // &:after {
    //   background: rgba(255, 255, 255, 0.08);
    //   border-color: rgba(255, 255, 255, 0.15);
    //   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    // }
          
    /*background: ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.panel.nodeBg
    };
    color: ${({ theme, $active }) =>
      $active ? 'white' : theme.colors.textPrimary
    };
    border: 1px solid ${({ theme, $active }) =>
      $active ? theme.panel.ctlBorder : theme.panel.ctlBorder
    };
    border-radius: 0px;
    padding: 3px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 50px;
    height: 24px;

    &:hover {
      background: ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.buttonHover
    };
      border-color: ${({ theme }) => theme.colors.accent};
    }

    &:disabled {
      background: ${({ theme }) => theme.colors.inputBg}80;
      color: ${({ theme }) => theme.colors.textSecondary};
      border-color: ${({ theme }) => theme.colors.border};
      cursor: not-allowed;
      opacity: 0.6;
    }*/ 
`;

// 按钮选项接口
export interface ButtonOption {
  key: string;
  label: string;
}

// 组件属性接口
export interface DataViewButtonGroupProps {
  /** 按钮选项数组 */
  options: ButtonOption[];
  /** 当前激活的按钮key */
  activeKey: string;
  /** 按钮点击回调 */
  onChange: (key: string) => void;
  /** 自定义类名 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 激活状态背景色 */
  activeBackground?: string;
  /** 非激活状态背景色 */
  inactiveBackground?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 数据视图按钮组组件
 * 用于在不同数据视图模式之间切换
 */
export const ButtonGroup: React.FC<DataViewButtonGroupProps> = ({
  options,
  activeKey,
  onChange,
  className,
  disabled = false,
  activeBackground,
  inactiveBackground,
  style
}) => {
  return (
    <ButtonContainer className={className} style={style}>
      {options.map((option) => (
        <DataViewButton
          key={option.key}
          $active={activeKey === option.key}
          $activeBackground={activeBackground}
          $inactiveBackground={inactiveBackground}
          onClick={() => onChange(option.key)}
          disabled={disabled}
        >
          {option.label}
        </DataViewButton>
      ))}
    </ButtonContainer>
  );
};

export default ButtonGroup;