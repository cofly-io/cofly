import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@repo/database";

// NextAuth 配置选项
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请提供邮箱和密码");
        }

        try {
          // 使用 packages/db 中的 loginUser 函数
          const user = await prisma.user.loginUser({
            email: credentials.email,
            password: credentials.password,
          });

          if (!user) {
            throw new Error("邮箱或密码不正确");
          }

          // 返回将被编码到 JWT 中的用户数据
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("认证错误:", error);
          // 返回具体的错误消息
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("登录失败，请检查邮箱和密码");
        }
      },
    }),
  ],
  callbacks: {
    // JWT 回调 - 每当创建或更新 JWT 时调用
    async jwt({ token, user }) {
      // 初始登录
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    // 会话回调 - 每当检查会话时调用
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // 错误代码作为查询字符串传递，如 ?error=
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  // secret: process.env.NEXTAUTH_SECRET,
  secret: process.env.NEXT_PUBLIC_APP_URL
};

// 导出 Next.js API 路由的处理函数
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
