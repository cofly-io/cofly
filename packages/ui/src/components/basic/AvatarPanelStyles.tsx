import styled from 'styled-components';

// 主容器 - 优化为现代化的玻璃态设计
export const AvatarPanelContainer = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  }
`;

// 网格布局容器 - 优化布局
export const PanelGridContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
  grid-template-areas:
    "avatars preview"
    "colors colors";

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "preview"
      "avatars"
      "colors";
    gap: 20px;
  }
`;

// 头像网格区域
export const AvatarGridSection = styled.div`
  grid-area: avatars;
`;

// 预览区域
export const PreviewSection = styled.div`
  grid-area: preview;
`;

// 调色板区域
export const ColorPaletteSection = styled.div`
  grid-area: colors;
`;

// 区域标题 - 现代化设计
export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #60a5fa, #3b82f6);
    border-radius: 1px;
  }
`;

// 头像网格 - 优化滚动和视觉效果
export const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    max-height: 280px;
    padding: 12px;
  }
`;

// 头像项目 - 现代化交互效果
export const AvatarItem = styled.div<{ $selected: boolean; $hovered: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border: 2px solid ${props => 
    props.$selected 
      ? '#60a5fa' 
      : props.$hovered 
        ? 'rgba(255, 255, 255, 0.4)'
        : 'rgba(255, 255, 255, 0.15)'
  };
  border-radius: 12px;
  background: ${props => 
    props.$selected 
      ? 'rgba(96, 165, 250, 0.2)' 
      : props.$hovered 
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(255, 255, 255, 0.08)'
  };
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  ${props => props.$selected && `
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.3), 
                0 8px 16px rgba(0, 0, 0, 0.2);
    
    &::after {
      content: '✓';
      position: absolute;
      top: -6px;
      right: -6px;
      background: #22c55e;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
    }
  `}

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
  }
`;

// 预览容器 - 优雅的预览区域
export const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.2);
  min-height: 200px;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    pointer-events: none;
  }
`;

// 预览头像 - 优化显示效果
export const PreviewAvatar = styled.div`
  margin-bottom: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  }
`;

// 预览信息
export const PreviewInfo = styled.div`
  text-align: center;
`;

// 预览名称 - 优化字体
export const PreviewName = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

// 预览颜色 - 优化显示
export const PreviewColor = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
`;

// 调色板 - 优化布局
export const ColorPalette = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 10px;
    padding: 12px;
  }
`;

// 颜色项目 - 现代化设计
export const ColorItem = styled.div<{ $color: string; $selected: boolean }>`
  width: 44px;
  height: 44px;
  background-color: ${props => props.$color};
  border: 3px solid ${props => props.$selected ? 'white' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  ${props => props.$selected && `
    transform: scale(1.15);
    box-shadow: 0 0 20px ${props.$color}60, 
                0 8px 16px rgba(0, 0, 0, 0.3);
                
    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: ${props.$color === '#FFFFFF' || props.$color === '#F59E0B' ? '#000' : '#fff'};
      font-size: 16px;
      font-weight: bold;
      text-shadow: ${props.$color === '#FFFFFF' || props.$color === '#F59E0B' 
        ? '0 1px 2px rgba(0, 0, 0, 0.5)' 
        : '0 1px 2px rgba(255, 255, 255, 0.5)'};
    }
  `}

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    border-color: white;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

// 自定义颜色 - 优化设计
export const CustomColor = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

// 自定义颜色标签 - 优化字体
export const CustomColorLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  flex: 1;
`;

// 自定义颜色输入 - 现代化设计
export const CustomColorInput = styled.input`
  width: 60px;
  height: 44px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  //backdrop-filter: blur(4px);

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
    transform: scale(1.05);
  }
`; 