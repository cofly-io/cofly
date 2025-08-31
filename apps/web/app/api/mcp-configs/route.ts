import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// GET - 获取所有 MCP 配置
export async function GET() {
  try {
    const mcpConfigs = await prisma.aiMcp.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: mcpConfigs
    });
  } catch (error) {
    console.error('Error fetching MCP configs:', error);
    return NextResponse.json({
      success: false,
      error: '获取 MCP 配置失败'
    }, { status: 500 });
  }
}

// POST - 创建新的 MCP 配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, mcpinfo } = body;

    // 验证必需的字段
    if (!name || !type || !mcpinfo) {
      return NextResponse.json({
        success: false,
        error: '缺少必需的字段：name、type、mcpinfo'
      }, { status: 400 });
    }

    // 确保 mcpinfo 是字符串格式
    let mcpinfoString = typeof mcpinfo === 'string' ? mcpinfo : JSON.stringify(mcpinfo);
    
    // 创建 MCP 配置记录
    const mcpConfig = await prisma.aiMcp.create({
      data: {
        name: name.trim(),           // 名称字段
        type: type,                  // 类型字段（stdio/sse/ws）
        mcpinfo: mcpinfoString       // 完整的JSON配置信息
      }
    });

    return NextResponse.json({
      success: true,
      data: mcpConfig,
      message: 'MCP配置创建成功'
    });
  } catch (error) {
    console.error('Error creating MCP config:', error);
    return NextResponse.json({
      success: false,
      error: '创建 MCP 配置失败'
    }, { status: 500 });
  }
}
