//创建一个客户端组件，用于在整个应用中提供 NextAuth 会话
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * 扩展默认的会话类型
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
    };
  }

  /**
   * 扩展默认的用户类型
   */
  interface User {
    id: string;
    email: string;
    name?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * 扩展默认的JWT类型
   */
  interface JWT {
    id: string;
    email: string;
    name?: string;
  }
}
