"use client";

import React from 'react';
import { ThemeProvider } from '@repo/ui/main';
import { settingsApi } from '../services/systemSettingService';

interface AppSettingsProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const AppSettingsProvider: React.FC<AppSettingsProviderProps> = ({
  children,
  userId
}) => {
  return (
    <ThemeProvider userId={userId} settingsService={settingsApi}>
      {children}
    </ThemeProvider>
  );
};

export default AppSettingsProvider;