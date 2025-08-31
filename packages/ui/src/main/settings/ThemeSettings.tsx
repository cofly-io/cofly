"use client";

import React from 'react';
import styled from 'styled-components';
import { SettingsCard } from './SettingsCard';
import { ThemeSwitch } from '../../components/basic/theme-switch';
import { useTheme } from '../../context/ThemeProvider';
import { THEME_MODES } from '../../themes';
import { Button } from './SharedStyles';

const ThemePreview = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const PreviewCard = styled.div<{ $active?: boolean }>`
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid ${({ $active, theme }) => $active
    ? theme.colors.accent
    : 'transparent'
  };
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-2px);
  }
`;

const LightPreview = styled(PreviewCard)`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%);
  color: #1e293b;
`;

const DarkPreview = styled(PreviewCard)`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%);
  color: #e2e8f0;
`;

const PreviewHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PreviewContent = styled.div`
  font-size: 12px;
  opacity: 0.8;
  line-height: 1.4;
`;

const ThemeOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

const OptionInfo = styled.div`
  h4 {
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 4px 0;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    margin: 0;
  }
`;


const RefreshButton = styled(Button)`
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;



export const ThemeSettings: React.FC = () => {
  const { themeMode, setTheme } = useTheme();

  const handleThemeSelect = (mode: 'light' | 'dark') => {
    setTheme(mode === 'light' ? THEME_MODES.LIGHT : THEME_MODES.DARK);
  };

  const handleRefresh = () => {
    // 刷新整个页面
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <>
      <SettingsCard
        title="主题模式"
        description="选择你喜欢的界面主题"
      >
        <ThemePreview>
          <LightPreview
            $active={themeMode === THEME_MODES.LIGHT}
            onClick={() => handleThemeSelect('light')}
          >
            <PreviewHeader>
              ☀️ 浅色主题
            </PreviewHeader>
            <PreviewContent>
              清新明亮的界面设计，适合白天使用
            </PreviewContent>
          </LightPreview>

          <DarkPreview
            $active={themeMode === THEME_MODES.DARK}
            onClick={() => handleThemeSelect('dark')}
          >
            <PreviewHeader>
              🌙 深色主题
            </PreviewHeader>
            <PreviewContent>
              护眼的深色界面，适合夜间使用
            </PreviewContent>
          </DarkPreview>
        </ThemePreview>

        <ThemeOption>
          <OptionInfo>
            <h4>主题切换</h4>
            <p>快速切换浅色和深色主题</p>
          </OptionInfo>
          <ThemeSwitch compact />
        </ThemeOption>
        {/* <ThemeOption>
          <OptionInfo>
            <h4>应用主题</h4>
            <p>如果主题切换后没有立即生效，点击刷新页面</p>
          </OptionInfo>
          <RefreshButton onClick={handleRefresh}>
            🔄 刷新页面
          </RefreshButton>
        </ThemeOption> */}
      </SettingsCard>
    </>
  );
};

export default ThemeSettings;