"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 清空localStorage并强制重新登录
  const clearSessionAndRedirect = async () => {
    console.log('🧹 [useAuth] Clearing localStorage and forcing re-login');
    
    // 清空所有相关的localStorage数据
    if (typeof window !== 'undefined') {
      // 清空用户设置相关的localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('user_settings_') || key.startsWith('nextauth.')) {
          localStorage.removeItem(key);
          console.log('🗑️ [useAuth] Removed localStorage key:', key);
        }
      });
    }
    
    // 强制登出并跳转到登录页
    await signOut({ redirect: false });
    window.location.href = '/login';
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
        throw new Error(result.error);
      }

      router.push("/workbench/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (err) {
      console.error("退出登录失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);

    try {
      // 注册新用户
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "注册失败");
      }

      // 注册成功后自动登录
      await login(data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    loading: status === "loading" || loading,
    error,
    login,
    logout,
    register,
    clearSessionAndRedirect,
  };
}
