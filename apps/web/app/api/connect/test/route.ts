import { NextRequest, NextResponse } from 'next/server';
import { getConnectRegistry } from '@/lib/connectRegistry';
import { initializeServer } from '@/lib/serverInit';

/**
 * POST /api/connect/test
 * 测试连接配置
 * 请求体:
 * - connectId: 连接ID
 * - config: 连接配置
 * - message?: 消息内容（用于LLM测试）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectId, config, message } = body;

    if (!connectId || !config) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数',
          message: 'connectId 和 config 是必填字段'
        },
        { status: 400 }
      );
    }

    // 确保服务器已初始化
    await initializeServer();
    
    const registry = await getConnectRegistry();
    const connect = registry.getConnectById(connectId);

    if (!connect) {
      return NextResponse.json(
        {
          success: false,
          error: '连接不存在',
          message: `找不到ID为 "${connectId}" 的连接`
        },
        { status: 404 }
      );
    }

    // 调用连接的测试方法
    let result;
    
    if (connect.test) {
      // 对于LLM连接，如果有message参数，传递给test方法
      if (connect.overview.type === 'llm' && message !== undefined) {
        // LLM连接的test方法可以接受两个参数
        const llmConnect = connect as any;
        result = await llmConnect.test(config, message);
      } else {
        // 对于其他类型的连接（如数据库），只传递config参数
        result = await connect.test(config);
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '连接不支持测试',
          message: `连接 "${connectId}" 不支持测试功能`
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: result.message || '测试完成'
    });

  } catch (error) {
    console.error('连接测试失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '连接测试失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 