"use client";

import React from "react";
import styled, { keyframes } from "styled-components";

// 动画定义
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

// 加载屏幕容器
const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

// Gemini风格的钻石加载器
const DiamondLoader = styled.div`
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  animation: ${spin} 2s linear infinite;
  margin-bottom: 2rem;
`;

const DiamondInner = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border-radius: 0.375rem;
  transform: rotate(-45deg);
`;

// 加载文本
const LoadingText = styled.div`
  color: #e5e5e5;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingSubtext = styled.div`
  color: #9ca3af;
  font-size: 0.875rem;
  text-align: center;
  max-width: 20rem;
  line-height: 1.5;
`;

// 进度条
const ProgressContainer = styled.div`
  width: 16rem;
  height: 0.25rem;
  background: #2a2a2a;
  border-radius: 0.125rem;
  overflow: hidden;
  margin-top: 1.5rem;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #4285f4 0%, #1a73e8 100%);
  border-radius: 0.125rem;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

interface LoadingScreenProps {
  message?: string;
  subtext?: string;
  progress?: number;
}

export function LoadingScreen({ 
  message = "正在加载AI助手", 
  subtext = "请稍候，我们正在为您准备最佳体验...",
  progress = 0
}: LoadingScreenProps) {
  return (
    <LoadingContainer>
      <DiamondLoader>
        <DiamondInner />
      </DiamondLoader>
      
      <LoadingText>{message}</LoadingText>
      <LoadingSubtext>{subtext}</LoadingSubtext>
      
      {progress > 0 && (
        <ProgressContainer>
          <ProgressBar $progress={progress} />
        </ProgressContainer>
      )}
    </LoadingContainer>
  );
}