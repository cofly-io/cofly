"use client";

import React from 'react';
import { ThemeProvider, GlobalThemeProvider } from '@repo/ui/main';
import { GlobalConfirmProvider } from '@repo/ui';
import { settingsApi } from '../services/systemSettingService';
import { useSession } from 'next-auth/react';

interface AppThemeProviderProps {
    children: React.ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
    const { data: session, status } = useSession();

    // 从session中获取用户ID，只有在已认证且有有效session时才传递
    const userId = status === 'authenticated' && session?.user?.id ? session.user.id : undefined;

    return (
        <GlobalThemeProvider>
            <ThemeProvider
                userId={userId}
                settingsService={settingsApi}
            >
                <GlobalConfirmProvider>
                    {children}
                </GlobalConfirmProvider>
            </ThemeProvider>
        </GlobalThemeProvider>
    );
};

