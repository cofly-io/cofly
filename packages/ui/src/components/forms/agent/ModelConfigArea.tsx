"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { ButtonGroup } from '../../basic/ButtonGroup';
import { SliderControl } from '../../../controls/slider';
import type { ButtonOption } from '../../basic/ButtonGroup';
import {
  GlassListCards
} from '../../shared/ui-components';
import {
  FaSearch,
  FaLink,
  FaBrain,
  FaRuler,
  FaSlidersH,
  FaThermometerHalf,
  FaRedoAlt,
  FaLayerGroup
} from 'react-icons/fa';
import { PiToolboxFill } from "react-icons/pi";


// 主配置面板
const ConfigPanel = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);  
  padding: 18px;
  border-radius:0px 0px 8px 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  width: 100%;
  gap:0px 12px;
  max-height: 65vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    transition: background 0.3s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  /* Firefox滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-height: 70vh;
  }
`;

// 卡片头部
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

// 卡片图标
const CardIcon = styled.div`
  width: 31px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 1.6rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
`;

// 卡片标题
const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
`;

// 卡片描述
const CardDescription = styled.div`
  color: rgba(255, 255, 255, 0.85);
  opacity: 0.8;
  // line-height: 1.2;
  font-size: 12px;
`;

// 开关容器
const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 15px;
`;

// 开关标签
const ToggleLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

// 数值容器
const ValueContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

// 数值标签
const ValueLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

// 数值显示
const ValueDisplay = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: #4CAF50;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
  padding: 8px 16px;
  border-radius: 10px;
  min-width: 100px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

// 参数网格
const ParamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

// 参数项
const ParamItem = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
`;

// 参数标签
const ParamLabel = styled.div`
  font-size: 0.95rem;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
`;

// 参数值
const ParamValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #FF9800;
`;

// 数字输入框
const NumberInput = styled.input`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 4px 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  width: 120px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(74, 144, 226, 0.6);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

// 温度控制
const TemperatureControl = styled.div`
  margin-top: 10px;
  padding-top: 20px;
 // border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

// 温度头部
const TempHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

// 温度值
const TempValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #FF5722;
`;

// 自定义滑块容器
const CustomSliderContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  margin: 10px 0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

// 滑块填充
const SliderFill = styled.div<{ percentage: number }>`
  position: absolute;
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, #2196F3, #FF5722);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

// 滑块手柄
const SliderHandle = styled.div<{ percentage: number }>`
  position: absolute;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  left: ${props => props.percentage}%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: grab;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    cursor: grabbing;
    transform: translate(-50%, -50%) scale(1.2);
  }
`;

// 温度标记
const TempMarkers = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
`;

export interface ModelConfigAreaProps {
  // 联网搜索
  webSearch?: boolean;
  onWebSearchChange?: (value: boolean) => void;

  // MCP模式
  mcpMode?: 'prompt' | 'function';
  onMcpModeChange?: (value: 'prompt' | 'function') => void;

  // 工作流
  workflow?: boolean;
  onWorkflowChange?: (value: boolean) => void;

  // 链接
  link?: boolean;
  onLinkChange?: (value: boolean) => void;

  // 深度思考
  deepThinking?: boolean;
  onDeepThinkingChange?: (value: boolean) => void;

  // 最大token
  maxTokens?: number;
  onMaxTokensChange?: (value: number) => void;

  // 思想链输出的最大标记数
  maxChainTokens?: number;
  onMaxChainTokensChange?: (value: number) => void;

  // minP
  minP?: number;
  onMinPChange?: (value: number) => void;

  // topP
  topP?: number;
  onTopPChange?: (value: number) => void;

  // topK
  topK?: number;
  onTopKChange?: (value: number) => void;

  // 温度
  temperature?: number;
  onTemperatureChange?: (value: number) => void;

  // 返回的代数
  generations?: number;
  onGenerationsChange?: (value: number) => void;

  // 最大迭代
  maxIterations?: number;
  onMaxIterationsChange?: (value: number) => void;

  // 样式
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 模型配置区域组件
 * 用于配置模型的各种参数
 */
const ModelConfigAreaComponent: React.FC<ModelConfigAreaProps> = ({
  webSearch = false,
  onWebSearchChange,
  mcpMode = 'prompt',
  onMcpModeChange,
  workflow = false,
  onWorkflowChange,
  link = false,
  onLinkChange,
  deepThinking = true,
  onDeepThinkingChange,
  maxTokens = 512,
  onMaxTokensChange,
  maxChainTokens = 4096,
  onMaxChainTokensChange,
  minP = 0.05,
  onMinPChange,
  topP = 0.7,
  onTopPChange,
  topK = 50,
  onTopKChange,
  temperature = 0.7,
  onTemperatureChange,
  generations = 1,
  onGenerationsChange,
  maxIterations = 5,
  onMaxIterationsChange,
  className,
  style
}) => {
  // 按钮组选项
  const booleanOptions: ButtonOption[] = [
    { key: 'true', label: '是' },
    { key: 'false', label: '否' }
  ];

  const booleanOptionsReverse: ButtonOption[] = [
    { key: 'true', label: '是' },
    { key: 'false', label: '否' }
  ];

  const mcpModeOptions: ButtonOption[] = [    
    { key: 'function', label: '函数' },
    { key: 'prompt', label: '提示词' }
  ];

  return (
    <ConfigPanel className={className} style={style}>
      {/* 联网搜索 */}
      <GlassListCards>
        <CardHeader>
          <CardIcon>
            <FaSearch size={16} />
          </CardIcon>
          <CardTitle>联网搜索</CardTitle>
        </CardHeader>
        <CardDescription>
          启用后可以搜索最新的网络信息，提供更准确的答案。
        </CardDescription>
        <ToggleContainer>
          <ToggleLabel>启用联网搜索</ToggleLabel>
          <ButtonGroup
            activeBackground='#00B05080'
            options={booleanOptions}
            activeKey={webSearch ? 'true' : 'false'}
            onChange={(key) => onWebSearchChange?.(key === 'true')}
          />
        </ToggleContainer>
      </GlassListCards>

      {/* MCP模式 */}
      <GlassListCards>
        <CardHeader>
          <CardIcon>
            <PiToolboxFill size={16} />
          </CardIcon>
          <CardTitle>工具调用模式</CardTitle>
        </CardHeader>
        <CardDescription>
          提示词模式通过文本交互，函数模式可直接调用工具功能。
        </CardDescription>
        <ToggleContainer>
          <ToggleLabel>当前模式</ToggleLabel>
          <ButtonGroup
            options={mcpModeOptions}
            activeKey={mcpMode}
            activeBackground='#00B05080'
            onChange={(key) => onMcpModeChange?.(key as 'prompt' | 'function')}
          />
        </ToggleContainer>
      </GlassListCards>

      {/* 深度思考 */}
      <GlassListCards>
        <CardHeader>
          <CardIcon>
            <FaBrain size={16} />
          </CardIcon>
          <CardTitle>深度思考</CardTitle>
        </CardHeader>
        <CardDescription>
          启用后AI会进行更深入的分析和推理，提供更全面的答案。
        </CardDescription>
        <ToggleContainer>
          <ToggleLabel>启用深度思考</ToggleLabel>
          <ButtonGroup
            activeBackground='#00B05080'
            options={booleanOptionsReverse}
            activeKey={deepThinking ? 'true' : 'false'}
            onChange={(key) => onDeepThinkingChange?.(key === 'true')}
          />
        </ToggleContainer>
      </GlassListCards>

      {/* Token控制 */}
      <GlassListCards>
        <CardHeader>
          <CardIcon>
            <FaRuler size={16} />
          </CardIcon>
          <CardTitle>Token控制</CardTitle>
        </CardHeader>
        <CardDescription>
          控制单次响应的最大长度，数值越大可生成更长的内容。
        </CardDescription>
        <ToggleContainer>
          <ToggleLabel>最大Token数</ToggleLabel>
          <NumberInput
            type="number"
            value={maxTokens}
            onChange={(e) => onMaxTokensChange?.(parseInt(e.target.value) || 512)}
            min={1}
            max={onMaxTokensChange ? 100000 : 512}
            placeholder="最大token"
            style={{ width: '48%' }}
          />
        </ToggleContainer>
      </GlassListCards>
      {/* 思维链标记数 */}
      <GlassListCards>
        <CardHeader>
          <CardIcon>
            <FaLayerGroup size={16} />
          </CardIcon>
          <CardTitle>思想链标记数</CardTitle>
        </CardHeader>
        <CardDescription>
          控制思维链推理过程的最大输出长度。
        </CardDescription>
        <ToggleContainer>
          <ToggleLabel>最大标记数</ToggleLabel>
          <NumberInput
            type="number"
            value={maxChainTokens}
            onChange={(e) => onMaxChainTokensChange?.(parseInt(e.target.value) || 4096)}
            min={1}
            max={onMaxChainTokensChange ? 100000 : 4096}
            placeholder="最大标记数"
            style={{ width: '48%' }}
          />
        </ToggleContainer>
      </GlassListCards>

      {/* 高级参数 */}
      <GlassListCards>
        <CardHeader>
          <CardIcon>
            <FaSlidersH size={16} />
          </CardIcon>
          <CardTitle>高级参数</CardTitle>
        </CardHeader>
        <ToggleContainer>
          <ToggleLabel>minP</ToggleLabel>
          <SliderControl
            value={minP}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => onMinPChange?.(value)}
            formatValue={(val) => val.toFixed(2)}
            style={{ width: '60%' }}
          />
        </ToggleContainer>
        <ToggleContainer>
          <ToggleLabel>topP</ToggleLabel>
          <SliderControl
            value={topP}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => onTopPChange?.(value)}
            formatValue={(val) => val.toFixed(2)}
            style={{ width: '60%' }}
          />
        </ToggleContainer>
        <ToggleContainer>
          <ToggleLabel>topK</ToggleLabel>
         <SliderControl
            value={topK}
            min={0}
            max={120}
            step={1}
            onChange={(value) => onTopKChange?.(value)}
            formatValue={(val) => val.toFixed(2)}
            style={{ width: '60%' }}
          />

        </ToggleContainer>
        <CardDescription style={{ marginTop: '20px' }}>
          <p><strong>minP</strong>: 最小概率阈值，过滤掉概率过低的词汇选择。</p>
          <p><strong>topP</strong>: 核心采样参数，控制词汇选择的多样性。</p>
          <p><strong>topK</strong>: 限制每步选择的候选词汇数量。</p>
        </CardDescription>
      </GlassListCards>
      {/* 温度控制 */}
      <GlassListCards>
        <CardHeader>
          <CardIcon>
            <FaThermometerHalf size={16}/>
          </CardIcon>
          <CardTitle>温度控制</CardTitle>
        </CardHeader>
        <TemperatureControl>
          <TempHeader>
            <ValueLabel>温度参数</ValueLabel>
            <TempValue>{temperature.toFixed(2)}</TempValue>
          </TempHeader>

          <CustomSliderContainer
            onMouseDown={(e) => {
              const container = e.currentTarget;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const rect = container.getBoundingClientRect();
                const x = moveEvent.clientX - rect.left;
                const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                const newValue = (percentage / 100) * 2; // 0-2 range
                onTemperatureChange?.(newValue);
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
              
              // 立即处理初始点击
              handleMouseMove(e.nativeEvent);
            }}
            onClick={(e) => {
              // 保留点击功能作为备用
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
              const newValue = (percentage / 100) * 2; // 0-2 range
              onTemperatureChange?.(newValue);
            }}
          >
            <SliderFill percentage={(temperature / 2) * 100} />
            <SliderHandle percentage={(temperature / 2) * 100} />
          </CustomSliderContainer>

          <TempMarkers>
            <span>保守</span>
            <span>平衡</span>
            <span>创意</span>
          </TempMarkers>
        </TemperatureControl>

        <CardDescription style={{ marginTop: '20px' }}>
          温度参数控制AI生成内容的随机性和创造性。较低的值产生更可预测的输出，较高的值产生更多样化的结果。
        </CardDescription>
      </GlassListCards>

      {/* 迭代控制 */}
      <GlassListCards>
        <CardHeader>
          <CardIcon>
            <FaRedoAlt size={16}/>
          </CardIcon>
          <CardTitle>迭代控制</CardTitle>
        </CardHeader>

        <ToggleContainer>
            <ToggleLabel>返回的代数</ToggleLabel>
            <NumberInput
              type="number"
              value={generations}
              onChange={(e) => onGenerationsChange?.(parseInt(e.target.value) || 1)}
              min={1}
              max={10}
              style={{ width: '80px' }}
            />
            </ToggleContainer>
             <ToggleContainer>
            <ToggleLabel>最大迭代</ToggleLabel>
            <NumberInput
              type="number"
              value={maxIterations}
              onChange={(e) => onMaxIterationsChange?.(parseInt(e.target.value) || 5)}
              min={1}
              max={100}
              style={{ width: '80px' }}
            />
              </ToggleContainer>
        <CardDescription>
          <p><strong>返回代数</strong>: 控制同时生成多少个不同的回答选项。</p>
          <p><strong>最大迭代</strong>: 智能体思考的最大次数。</p>
        </CardDescription>
      </GlassListCards>
    </ConfigPanel>
  );
};

export const ModelConfigArea = React.memo(ModelConfigAreaComponent);
export default ModelConfigArea;