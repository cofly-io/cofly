import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

export interface AnimatedLogoProps {
  fontSize?: string;
  className?: string;
}

const dropAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  30% {
    transform: translateY(20px);
  }
  60% {
    transform: translateY(20px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const LogoContainer = styled.div`
  display: inline-flex;
  align-items: center;
  font-weight: 900;
  gap:1px;
  letter-spacing: 1px;
`;

const Letter = styled.span.attrs<{ 
  $gradient: string; 
  $isAnimating: boolean;
  $delay: number;
}>(props => ({
  style: {
    background: props.$gradient,
    animationDelay: `${props.$delay}s`
  }
}))`
  font-size: 23px;
  padding:0px 2px;
  border-radius: 2px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-clip: text;
  display: inline-block;
  color:white;
  
  /* 为不支持background-clip的浏览器提供备用方案 */
  @supports not (-webkit-background-clip: text) {
    background: none;
    color: #3b82f6;
  }
  
  ${props => props.$isAnimating && css`
    animation: ${dropAnimation} 2s ease-in-out;
  `}
`;

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ 
  className 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDelays, setAnimationDelays] = useState<number[]>([]);

  const letters = [
    { char: 'C', gradient: 'linear-gradient(45deg, #3b82f6, #6366f1)' }, // 蓝色
    { char: 'o', gradient: 'linear-gradient(45deg, #6366f1, #8b5cf6)' }, // 蓝紫色
    { char: 'f', gradient: 'linear-gradient(45deg, #8b5cf6, #a855f7)' }, // 紫色
    { char: 'l', gradient: 'linear-gradient(45deg, #a855f7, #d946ef)' }, // 紫红色
    { char: 'y', gradient: 'linear-gradient(45deg, #d946ef, #ec4899)' }, // 红色
  ];

  useEffect(() => {
    const startAnimation = () => {
      // 生成依次落下的延迟时间，每个字母间隔0.2秒
      const delays = letters.map((_, index) => index * 0.2);
      setAnimationDelays(delays);
      setIsAnimating(true);
      
      // 动画持续2秒 + 最后一个字母延迟0.8秒后重置
      setTimeout(() => {
        setIsAnimating(false);
      }, 2800);
    };

    // 立即开始第一次动画
    startAnimation();
    
    // 每8秒重复动画
    const interval = setInterval(startAnimation, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <LogoContainer className={className}>
      {letters.map((letter, index) => (
        <Letter
          key={index}
          $gradient={letter.gradient}
          $isAnimating={isAnimating}
          $delay={animationDelays[index] || 0}
        >
          {letter.char}
        </Letter>
      ))}
    </LogoContainer>
  );
};

export default AnimatedLogo;