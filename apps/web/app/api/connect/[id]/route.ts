import { NextRequest, NextResponse } from 'next/server';
import { getConnectRegistry } from '@/lib/connectRegistry';
import { initializeServer } from '@/lib/serverInit';

/**
 * GET /api/connect/[id]
 * 获取连接详细信息
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    // 确保服务器已初始化
    await initializeServer();
    
    const { id } = await params;
    const registry = await getConnectRegistry();
    const connect = registry.getConnectById(id);

    if (!connect) {
      return NextResponse.json(
        {
          success: false,
          error: '连接不存在'
        },
        { status: 404 }
      );
    }

    // 返回完整的连接信息，包括字段定义
    const connectDetail = {
      // 展开所有 overview 字段
      ...connect.overview,
      // 添加 detail 中的字段
      fields: connect.detail.fields || [],
      supportedModels: (connect.detail as any).supportedModels || [],
      validateConnection: connect.detail.validateConnection || false,
      connectionTimeout: connect.detail.connectionTimeout,
    };

    return NextResponse.json({
      success: true,
      data: connectDetail
    });
  } catch (error) {
    console.error('获取连接详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取连接详情失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 