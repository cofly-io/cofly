"use client";

import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeProvider';
import { THEME_MODES } from '../../themes';

const ThemeSwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ThemeSwitchLabel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const LabelTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const LabelDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 26px;
  cursor: pointer;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${({ theme }) => theme.colors.accent};
  }

  &:checked + span:before {
    transform: translateX(26px);
  }

  &:focus + span {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent}33;
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.border};
  transition: 0.3s;
  border-radius: 26px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: ${({ theme }) => theme.colors.secondary};
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)'};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

const ThemeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ModeIcon = styled.span`
  font-size: 16px;
`;

interface ThemeSwitchProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  className,
  showLabel = true,
  compact = false
}) => {
  const { themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === THEME_MODES.DARK;

  if (compact) {
    return (
      <SwitchContainer className={className}>
        <SwitchInput
          type="checkbox"
          checked={isDark}
          onChange={toggleTheme}
          aria-label="切换主题"
        />
        <SwitchSlider />
      </SwitchContainer>
    );
  }

  return (
    <ThemeSwitchContainer className={className}>
      {showLabel && (
        <ThemeSwitchLabel>
          <LabelTitle>主题模式</LabelTitle>
          <LabelDescription>
            切换浅色和深色主题
          </LabelDescription>
        </ThemeSwitchLabel>
      )}
      
      <ThemeIndicator>
        <ModeIcon>{isDark ? '🌙' : '☀️'}</ModeIcon>
        {isDark ? '深色' : '浅色'}
      </ThemeIndicator>
      
      <SwitchContainer>
        <SwitchInput
          type="checkbox"
          checked={isDark}
          onChange={toggleTheme}
          aria-label="切换主题"
        />
        <SwitchSlider />
      </SwitchContainer>
    </ThemeSwitchContainer>
  );
};

export default ThemeSwitch;