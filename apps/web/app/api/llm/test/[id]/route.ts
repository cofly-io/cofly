import { NextRequest, NextResponse } from 'next/server';
import { LLMTester } from '@repo/node-set/';

/**
 * POST /api/llm/test/[id]
 * 测试单个LLM连接
 * 路径参数:
 * - id: 提供商名称或连接ID
 * 请求体:
 * - provider?: 提供商名称（如果id不是提供商名称）
 * - config: 连接配置
 * - message?: 测试消息
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { provider, config, message } = body;

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: '参数错误',
          message: 'config 是必填字段'
        },
        { status: 400 }
      );
    }

    // 确定提供商名称：优先使用provider参数，否则使用id
    const providerName = provider || id;

    // 验证提供商是否支持
    if (!LLMTester.isProviderSupported(providerName)) {
      return NextResponse.json(
        {
          success: false,
          error: '不支持的提供商',
          message: `提供商 "${providerName}" 不受支持`,
          supportedProviders: LLMTester.getSupportedProviders()
        },
        { status: 400 }
      );
    }

    // 构建测试配置
    const testConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      timeout: config.timeout ? config.timeout * 1000 : undefined,
      headers: config.headers,
      // 特殊认证字段
      secretKey: config.secretKey,
      secretId: config.secretId,
      region: config.region,
      appId: config.appId,
      apiSecret: config.apiSecret,
      groupId: config.groupId
    };

    // 执行测试
    const result = await LLMTester.testConnection(
      providerName,
      testConfig,
      message
    );

    return NextResponse.json({
      success: true,
      data: {
        id,
        provider: providerName,
        ...result
      },
      message: result.message || '测试完成'
    });

  } catch (error) {
    console.error(`LLM测试失败 [${params.id}]:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'LLM测试失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/llm/test/[id]
 * 获取特定提供商的信息
 * 路径参数:
 * - id: 提供商名称
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 检查提供商是否支持
    const isSupported = LLMTester.isProviderSupported(id);
    
    if (!isSupported) {
      return NextResponse.json(
        {
          success: false,
          error: '提供商不存在',
          message: `提供商 "${id}" 不受支持`,
          supportedProviders: LLMTester.getSupportedProviders()
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        provider: id,
        supported: true,
        allProviders: LLMTester.getSupportedProviders()
      },
      message: `提供商 "${id}" 受支持`
    });

  } catch (error) {
    console.error(`获取提供商信息失败 [${params.id}]:`, error);
    return NextResponse.json(
      {
        success: false,
        error: '获取提供商信息失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 