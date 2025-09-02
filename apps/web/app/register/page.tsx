"use client";

import { useRouter } from 'next/navigation';
import { GlobalThemeProvider } from '@repo/ui/main';
import { RegisterPageComponent } from '@repo/ui';
import { useAuth } from '../../src/hooks/useAuth';

export default function RegisterPage() {
  const { register, error, loading } = useAuth();
  const router = useRouter();

  const handleRegister = async (data: {
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      await register(data);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <GlobalThemeProvider defaultTheme="dark">
      <RegisterPageComponent
        onRegister={handleRegister}
        loading={loading}
        error={error || undefined}
        loginUrl="/login"
        onLanguageChange={() => console.log('Language change clicked')}
      />
    </GlobalThemeProvider>
  );
}
