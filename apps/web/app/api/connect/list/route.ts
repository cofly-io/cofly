import { NextRequest, NextResponse } from 'next/server';
import { ConnectType } from '@repo/common';
import { getConnectRegistry } from '@/lib/connectRegistry';
import { initializeServer } from '@/lib/serverInit';
import { ConnectCategory } from '@repo/common';

/**
 * GET /api/connect/list
 * 获取所有连接定义
 * 查询参数:
 * - type: 连接类型 (database|http|llm)
 * - provider: 提供商名称
 */
export async function GET(request: NextRequest) {
  try {
    // 确保服务器已初始化
    await initializeServer();
    
    const registry = await getConnectRegistry();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ConnectType | null;
    const provider = searchParams.get('provider');

    let connects;
    let total;

    if (type) {
      connects = registry.getConnectsByType(type);
    } else if (provider) {
      connects = registry.getConnectsByProvider(provider);
    } else {
      connects = registry.getAllConnects();
    }

    total = connects.length;

    // 格式化连接数据，移除敏感信息和详细字段配置
    const formattedConnects = connects.map((connect: any) => ({
      id: connect.overview.id,
      name: connect.overview.name,
      type: connect.overview.type,
      typeName: ConnectCategory[connect.overview.type as keyof typeof ConnectCategory]?.name || connect.overview.type,
      provider: connect.overview.provider,
      icon: connect.overview.icon,
      description: connect.overview.description,
      version: connect.overview.version,
      ...(connect.overview.type === 'llm' && { tags: connect.overview.tags || [] }),
      // 移除 fields 字段以减少数据传输量
      validateConnection: connect.detail.validateConnection || false,
      connectionTimeout: connect.detail.connectionTimeout
    }));

    return NextResponse.json({
      success: true,
      data: formattedConnects,
      total,
      filters: {
        type: type || null,
        provider: provider || null
      },
      statistics: registry.getStatistics?.()
    });
  } catch (error) {
    console.error('获取连接列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取连接列表失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}