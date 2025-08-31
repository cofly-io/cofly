"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ChatSidebar } from "./ChatSidebar";

// 样式组件
const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #1a1a1a;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const MainContent = styled.div<{ $sidebarCollapsed: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left 0.3s ease;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const MobileOverlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  width: 2.5rem;
  height: 2.5rem;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 0.5rem;
  color: #e5e5e5;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #404040;
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;
`;

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端默认收起侧边栏
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleCloseMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B 切换侧边栏
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
      
      // ESC 关闭移动端侧边栏
      if (e.key === 'Escape' && isMobile && mobileSidebarOpen) {
        handleCloseMobileSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, mobileSidebarOpen]);

  return (
    <LayoutContainer>
      {/* 移动端菜单按钮 */}
      <MobileMenuButton onClick={handleToggleSidebar}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </MobileMenuButton>

      {/* 移动端遮罩层 */}
      <MobileOverlay $visible={isMobile && mobileSidebarOpen} onClick={handleCloseMobileSidebar} />

      {/* 侧边栏 */}
      <ChatSidebar 
        collapsed={isMobile ? !mobileSidebarOpen : sidebarCollapsed}
        onToggleCollapse={!isMobile ? handleToggleSidebar : undefined}
      />

      {/* 主内容区域 */}
      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
}