"use client";

import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';

// 滑动条容器
const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
`;

// 滑动条轨道
const SliderTrack = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#bfbfbf'};
  border-radius: 2px;
  cursor: pointer;
`;

// 滑动条填充部分
const SliderFill = styled.div<{ $percentage: number }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 2px;
  transition: width 0.1s ease;
`;

// 滑动条手柄
const SliderThumb = styled.div<{ $percentage: number; $isDragging: boolean }>`
  position: absolute;
  left: calc(${props => props.$percentage}% - 8px);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  transition: ${props => props.$isDragging ? 'none' : 'left 0.1s ease, box-shadow 0.2s ease'};
  box-shadow: ${props => props.$isDragging ? '0 4px 12px rgba(59, 130, 246, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.2)'};
  
  &:hover {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

// 数值显示
const ValueDisplay = styled.div`
  margin-left: 12px;
  min-width: 40px;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : '#374151'};
  font-size: 12px;
  font-weight: 500;
`;

export interface SliderProps {
  /** 当前值 */
  value: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 值变化回调 */
  onChange: (value: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否显示数值 */
  showValue?: boolean;
  /** 数值格式化函数 */
  formatValue?: (value: number) => string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 滑动输入条组件
 * 用于数值范围选择
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  disabled = false,
  className,
  showValue = true,
  formatValue = (val) => val.toFixed(2),
  style
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // 计算百分比
  const percentage = ((value - min) / (max - min)) * 100;

  // 根据鼠标位置计算值
  const calculateValue = useCallback((clientX: number) => {
    if (!trackRef.current) return value;

    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percentage * (max - min);

    // 应用步长
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step, value]);

  // 鼠标按下事件
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    e.preventDefault();
    setIsDragging(true);

    const newValue = calculateValue(e.clientX);
    onChange(newValue);
  }, [disabled, calculateValue, onChange]);

  // 鼠标移动事件
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || disabled) return;

    const newValue = calculateValue(e.clientX);
    onChange(newValue);
  }, [isDragging, disabled, calculateValue, onChange]);

  // 鼠标释放事件
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 绑定全局鼠标事件
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <SliderContainer className={className} style={style}>
      <SliderTrack
        ref={trackRef}
        onMouseDown={handleMouseDown}
      >
        <SliderFill $percentage={percentage} />
        <SliderThumb
          $percentage={percentage}
          $isDragging={isDragging}
          onMouseDown={handleMouseDown}
        />
      </SliderTrack>
      {showValue && (
        <ValueDisplay>
          {formatValue(value)}
        </ValueDisplay>
      )}
    </SliderContainer>
  );
};

export default Slider;