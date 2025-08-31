"use client";

import React, { useEffect, useState } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import Link from 'next/link';
import {
  PageContainer,
  MainContent,
  SidebarToggle,
  ToggleDots,
  GlassSidebar,
  GlassSidebarItem,
  GlassSidebarIconContainer,
  GlassSidebarLabel
} from '@repo/ui/main';
import { UnifiedThemeProvider } from '@repo/ui';
import { IoMdHome } from "react-icons/io";
import { GrConnectivity } from "react-icons/gr";
import { SiAkasaair } from "react-icons/si";
import { TbHelpHexagonFilled } from "react-icons/tb";
import { IoMdSettings } from "react-icons/io";
import { BsPersonFillGear } from "react-icons/bs";
import { MdDonutSmall ,MdGroups } from "react-icons/md";


import { useAuth } from '../../src/hooks/useAuth';
import { WorkflowProvider } from '@/contexts/WorkflowContext';
import { useSession } from 'next-auth/react';
import { settingsApi } from '../../src/services/systemSettingService';
import { GlobalConfirmProvider } from '@repo/ui/components';
import { useSettings, SettingsProvider } from '@repo/ui';


// 内部组件，用于在SettingsProvider内部使用useSettings和处理会话错误
function WorkbenchInner({ children, clearSessionAndRedirect }: { children: React.ReactNode; clearSessionAndRedirect: () => void }) {
  const { syncError } = useSettings();
  const segment = useSelectedLayoutSegment();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 监听syncError状态，处理用户会话无效的情况
  useEffect(() => {
    if (syncError === 'USER_SESSION_INVALID') {
      clearSessionAndRedirect();
      return;
    }
  }, [syncError, clearSessionAndRedirect]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  }

  return (
    <UnifiedThemeProvider>
      <GlobalConfirmProvider>
        <PageContainer>
          <GlassSidebar $collapsed={sidebarCollapsed}>
            <Link href="/workbench/home" style={{ textDecoration: 'none' }}>
              <GlassSidebarItem $active={segment === 'home' || segment === null} $collapsed={sidebarCollapsed}>
                <GlassSidebarIconContainer $active={segment === 'home' || segment === null} $collapsed={sidebarCollapsed}>
                  <IoMdHome />
                </GlassSidebarIconContainer>
                <GlassSidebarLabel $active={segment === 'home' || segment === null} $collapsed={sidebarCollapsed}>
                  主页
                </GlassSidebarLabel>
              </GlassSidebarItem>
            </Link>
            <Link href="/workbench/connections" style={{ textDecoration: 'none' }}>
              <GlassSidebarItem $active={segment === 'connections'} $collapsed={sidebarCollapsed}>
                <GlassSidebarIconContainer $active={segment === 'connections'} $collapsed={sidebarCollapsed}>
                  <GrConnectivity />
                </GlassSidebarIconContainer>
                <GlassSidebarLabel $active={segment === 'connections'} $collapsed={sidebarCollapsed}>
                  连接
                </GlassSidebarLabel>
              </GlassSidebarItem>
            </Link>
            <Link href="/workbench/agent" style={{ textDecoration: 'none' }}>
              <GlassSidebarItem $active={segment === 'agent'} $collapsed={sidebarCollapsed}>
                <GlassSidebarIconContainer $active={segment === 'agent'} $collapsed={sidebarCollapsed}>
                  <SiAkasaair />
                </GlassSidebarIconContainer>
                <GlassSidebarLabel $active={segment === 'agent'} $collapsed={sidebarCollapsed}>
                  AI
                </GlassSidebarLabel>
              </GlassSidebarItem>
            </Link>
            <div style={{ marginTop: 'auto' }}>
              <Link href="https://www.cofly-ai.com/" target="_blank" style={{ textDecoration: 'none' }}>
                <GlassSidebarItem $active={segment === 'market'} $collapsed={sidebarCollapsed}>
                  <GlassSidebarIconContainer $active={segment === 'market'} $collapsed={sidebarCollapsed}>
                    <MdDonutSmall />
                  </GlassSidebarIconContainer>
                  <GlassSidebarLabel $active={segment === 'market'} $collapsed={sidebarCollapsed}>
                    市场
                  </GlassSidebarLabel>
                </GlassSidebarItem>
              </Link>
              <Link href="/workbench/help" style={{ textDecoration: 'none' }}>
                <GlassSidebarItem $active={segment === 'help'} $collapsed={sidebarCollapsed}>
                  <GlassSidebarIconContainer $active={segment === 'help'} $collapsed={sidebarCollapsed}>
                    <TbHelpHexagonFilled />
                  </GlassSidebarIconContainer>
                  <GlassSidebarLabel $active={segment === 'help'} $collapsed={sidebarCollapsed}>
                    帮助
                  </GlassSidebarLabel>
                </GlassSidebarItem>
              </Link>
              <Link href="../workbench/setting" style={{ textDecoration: 'none' }}>
                <GlassSidebarItem $active={segment === 'setting'} $collapsed={sidebarCollapsed}>
                  <GlassSidebarIconContainer $active={segment === 'setting'} $collapsed={sidebarCollapsed}>
                    <IoMdSettings />
                  </GlassSidebarIconContainer>
                  <GlassSidebarLabel $active={segment === 'setting'} $collapsed={sidebarCollapsed}>
                    系统
                  </GlassSidebarLabel>
                </GlassSidebarItem>
              </Link>
              <Link href="/workbench/profile" style={{ textDecoration: 'none' }}>
                <GlassSidebarItem $active={segment === 'profile'} $collapsed={sidebarCollapsed}>
                  <GlassSidebarIconContainer $active={segment === 'profile'} $collapsed={sidebarCollapsed}>
                    <BsPersonFillGear />
                  </GlassSidebarIconContainer>
                  <GlassSidebarLabel $active={segment === 'profile'} $collapsed={sidebarCollapsed}>
                    个人
                  </GlassSidebarLabel>
                </GlassSidebarItem>
              </Link>
            </div>
            <SidebarToggle onClick={toggleSidebar}>
              <ToggleDots>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
              </ToggleDots>
            </SidebarToggle>
          </GlassSidebar>
          <MainContent>
            {children}
          </MainContent>
        </PageContainer>
      </GlobalConfirmProvider>
    </UnifiedThemeProvider>
  );
}

// Layout.tsx的Provider结构为：SettingsProvider → WorkbenchInner → UnifiedThemeProvider → GlobalConfirmProvider → PageContainer
export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { isAuthenticated, loading, clearSessionAndRedirect } = useAuth();
  const userId = session?.user?.id;

  // 如果没有 userId，显示加载状态
  if (!userId) {
    return <div>正在加载用户信息...</div>;
  }

  // 检查用户是否已登录
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      clearSessionAndRedirect();
    }
  }, [isAuthenticated, loading, clearSessionAndRedirect]);

  // 如果正在加载或未认证，显示加载状态
  if (loading || !isAuthenticated) {
    return <div>请耐心等待,页面加载中...</div>;
  }

  return (
    <SettingsProvider userId={userId} settingsService={settingsApi}>
      <WorkflowProvider>
        <WorkbenchInner clearSessionAndRedirect={clearSessionAndRedirect}>
          {children}
        </WorkbenchInner>
      </WorkflowProvider>
    </SettingsProvider>
  );
}
