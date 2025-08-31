import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@repo/database';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: '请提供邮箱和密码' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: '邮箱或密码不正确' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: '邮箱或密码不正确' },
        { status: 401 }
      );
    }

    // 创建会话
    const session = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    return NextResponse.json(session);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: '登录失败，请稍后再试' },
      { status: 500 }
    );
  }
}
