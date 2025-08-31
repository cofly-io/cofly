import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "请提供所有必填字段" },
        { status: 400 }
      );
    }

    // 使用 packages/db 中的 createUser 函数创建用户
    const user = await prisma.user.createUser({
      email,
      password,
      name,
    });

    // 返回用户数据（不包含密码）
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("注册错误:", error);
    
    // 处理特定错误类型
    if (error.name === "UserExistsError") {
      return NextResponse.json(
        { message: error.message || "这个邮箱已被注册" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "注册失败，请稍后再试" },
      { status: 500 }
    );
  }
}
