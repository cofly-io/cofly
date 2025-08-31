import React, { useState, useCallback } from 'react';
import { avatarOptions, getAvatarIcon } from '../../utils/avatarUtils';
import {
  AvatarPanelContainer,
  PanelGridContainer,
  AvatarGridSection,
  PreviewSection,
  ColorPaletteSection,
  SectionTitle,
  AvatarGrid,
  AvatarItem,
  PreviewContainer,
  PreviewAvatar,
  PreviewInfo,
  PreviewName,
  PreviewColor,
  ColorPalette,
  ColorItem,
  CustomColor,
  CustomColorLabel,
  CustomColorInput
} from './AvatarPanelStyles';

export interface AvatarPanelProps {
  selectedAvatar?: string;
  selectedColor?: string;
  onAvatarSelect?: (avatarKey: string) => void;
  onColorSelect?: (color: string) => void;
  className?: string;
}

// 预设颜色调色板
const colorPalette = [
  '#FFFFFF', // 白色
  '#3B82F6', // 蓝色
  '#EF4444', // 红色
  '#10B981', // 绿色
  '#F59E0B', // 黄色
  '#8B5CF6', // 紫色
  '#EC4899', // 粉色
  '#06B6D4', // 青色
  '#84CC16', // 石灰色
  '#F97316', // 橙色
  '#6B7280', // 灰色
  '#1F2937', // 深灰色
  '#000000', // 黑色
  '#DC2626', // 深红色
  '#059669', // 深绿色
  '#7C3AED', // 深紫色
];

const AvatarPanel: React.FC<AvatarPanelProps> = ({
  selectedAvatar = 'user',
  selectedColor = '#3B82F6',
  onAvatarSelect,
  onColorSelect,
  className = ''
}) => {
  const [currentAvatar, setCurrentAvatar] = useState(selectedAvatar);
  const [currentColor, setCurrentColor] = useState(selectedColor);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  const handleAvatarClick = useCallback((avatarKey: string) => {
    setCurrentAvatar(avatarKey);
    onAvatarSelect?.(avatarKey);
  }, [onAvatarSelect]);

  const handleColorClick = useCallback((color: string) => {
    setCurrentColor(color);
    onColorSelect?.(color);
  }, [onColorSelect]);

  const previewAvatar = hoveredAvatar || currentAvatar;
  const previewIcon = React.cloneElement(
    getAvatarIcon(previewAvatar) as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      style: { color: currentColor, fontSize: '4rem' }
    }
  );

  return (
    <AvatarPanelContainer className={className}>
      <PanelGridContainer>
        {/* 头像选择区域 */}
        <AvatarGridSection>
          <SectionTitle>选择头像</SectionTitle>
          <AvatarGrid>
            {avatarOptions.map((option) => {
              const isSelected = option.key === currentAvatar;
              const isHovered = option.key === hoveredAvatar;
              
              return (
                <AvatarItem
                  key={option.key}
                  $selected={isSelected}
                  $hovered={isHovered}
                  onClick={() => handleAvatarClick(option.key)}
                  onMouseEnter={() => setHoveredAvatar(option.key)}
                  onMouseLeave={() => setHoveredAvatar(null)}
                  title={option.name}
                >
                  {React.cloneElement(option.icon, {
                    style: { 
                      color: isSelected ? currentColor : '#A8A0B7',
                      fontSize: '1.5rem'
                    }
                  })}
                </AvatarItem>
              );
            })}
          </AvatarGrid>
        </AvatarGridSection>

        {/* 预览区域 */}
        <PreviewSection>
          <SectionTitle>预览</SectionTitle>
          <PreviewContainer>
            <PreviewAvatar>
              {previewIcon}
            </PreviewAvatar>
            <PreviewInfo>
              <PreviewName>
                {avatarOptions.find(opt => opt.key === previewAvatar)?.name || '用户'}
              </PreviewName>
              <PreviewColor>颜色: {currentColor}</PreviewColor>
            </PreviewInfo>
          </PreviewContainer>
        </PreviewSection>

        {/* 调色板区域 */}
        <ColorPaletteSection>
          <SectionTitle>选择颜色</SectionTitle>
          <ColorPalette>
            {colorPalette.map((color) => {
              const isSelected = color === currentColor;
              
              return (
                <ColorItem
                  key={color}
                  $color={color}
                  $selected={isSelected}
                  onClick={() => handleColorClick(color)}
                  title={color}
                />
              );
            })}
          </ColorPalette>
          
          {/* 自定义颜色输入 */}
          <CustomColor>
            <CustomColorLabel htmlFor="custom-color-input">
              自定义颜色:
            </CustomColorLabel>
            <CustomColorInput
              id="custom-color-input"
              type="color"
              value={currentColor}
              onChange={(e) => handleColorClick(e.target.value)}
            />
          </CustomColor>
        </ColorPaletteSection>
      </PanelGridContainer>
    </AvatarPanelContainer>
  );
};

export default AvatarPanel;