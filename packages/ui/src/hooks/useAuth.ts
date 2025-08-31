"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";

export type User = Session["user"];

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut({
        redirect: false,
      });
      router.push('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
      throw error;
    }
  };

  const authState: AuthState = {
    user: session?.user || null,
    isLoading: status === "loading",
    isAuthenticated: !!session?.user,
  };

  return {
    ...authState,
    logout,
  };
};