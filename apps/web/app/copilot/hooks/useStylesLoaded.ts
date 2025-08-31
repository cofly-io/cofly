"use client";

import { useState, useEffect } from 'react';

export function useStylesLoaded() {
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    let progressTimer: NodeJS.Timeout;
    let checkTimer: NodeJS.Timeout;

    // 模拟进度条
    const updateProgress = () => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    };

    // 检查样式是否加载完成
    const checkStylesLoaded = () => {
      try {
        // 检查关键CSS变量是否可用
        const testElement = document.createElement('div');
        testElement.style.cssText = 'position: absolute; visibility: hidden; background: var(--background, #000);';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        const backgroundColor = computedStyle.backgroundColor;
        
        document.body.removeChild(testElement);
        
        // 检查Styled Components是否已注入样式
        const hasStyledComponents = document.head.querySelector('style[data-styled]') !== null;
        
        // 检查关键样式是否已加载（检查背景色是否为深色主题色）
        const isDarkTheme = backgroundColor === 'rgb(26, 26, 26)' || backgroundColor === '#1a1a1a';
        
        if (mounted && (isDarkTheme || hasStyledComponents)) {
          setProgress(100);
          setTimeout(() => {
            if (mounted) {
              setStylesLoaded(true);
            }
          }, 300); // 给一点时间让进度条完成
          return true;
        }
      } catch (error) {
        console.warn('Error checking styles:', error);
      }
      return false;
    };

    // 立即检查一次
    if (!checkStylesLoaded()) {
      // 开始进度更新
      progressTimer = setInterval(updateProgress, 100);
      
      // 定期检查样式加载状态
      checkTimer = setInterval(() => {
        if (checkStylesLoaded()) {
          clearInterval(progressTimer);
          clearInterval(checkTimer);
        }
      }, 50);

      // 最大等待时间 3 秒
      setTimeout(() => {
        if (mounted && !stylesLoaded) {
          clearInterval(progressTimer);
          clearInterval(checkTimer);
          setProgress(100);
          setTimeout(() => {
            if (mounted) {
              setStylesLoaded(true);
            }
          }, 200);
        }
      }, 3000);
    } else {
      // 样式已经加载，直接设置为完成
      setProgress(100);
      setStylesLoaded(true);
    }

    return () => {
      mounted = false;
      if (progressTimer) clearInterval(progressTimer);
      if (checkTimer) clearInterval(checkTimer);
    };
  }, [stylesLoaded]);

  return { stylesLoaded, progress };
}