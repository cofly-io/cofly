"use client";

import React from "react";
import { useStylesLoaded } from "../hooks/useStylesLoaded";
import { LoadingScreen } from "./LoadingScreen";

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { stylesLoaded, progress } = useStylesLoaded();

  if (!stylesLoaded) {
    return (
      <LoadingScreen 
        message="正在加载AI助手"
        subtext="请稍候，我们正在为您准备最佳体验..."
        progress={progress}
      />
    );
  }

  return <>{children}</>;
}