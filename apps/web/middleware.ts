import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    //secret: process.env.NEXTAUTH_SECRET,
    secret: process.env.NEXT_PUBLIC_APP_URL,
  });

  // 获取当前路径
  const { pathname } = request.nextUrl;

  // 检查是否是受保护的路由
  const isWorkbenchRoute = pathname.startsWith("/workbench");
  const isAuthRoute = pathname === "/login" || pathname === "/workflowRegister";

  // 如果用户已登录且尝试访问登录/注册页面，重定向到工作台
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/workbench/home", request.url));
  }

  // 如果用户未登录且尝试访问受保护的路由，重定向到登录页面
  if (!token && isWorkbenchRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 配置匹配的路由
export const config = {
  matcher: ["/workbench/:path*", "/login", "/workflowRegister"],
};
