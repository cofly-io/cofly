"use client";

import React, { createContext, useContext, useState } from 'react';

interface ScrollContextType {
  autoScroll: boolean;
  setAutoScroll: (enabled: boolean) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [autoScroll, setAutoScroll] = useState(false); // 默认关闭自动滚动

  return (
    <ScrollContext.Provider value={{ autoScroll, setAutoScroll }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
}