"use client";

import { useRouter } from 'next/navigation';
import { LoginPageComponent } from '@repo/ui';
import { useAuth } from '../../src/hooks/useAuth';

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleRegisterClick = () => {
    router.push('/register');
  };

  return (
    <LoginPageComponent
      logoSrc="/logo.png"
      onLogin={handleLogin}
      loading={loading}
      error={error || ""}
      registerUrl="/register"
      onRegisterClick={handleRegisterClick}
    />
  );
}
