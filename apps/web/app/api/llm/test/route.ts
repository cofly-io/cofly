import { NextRequest, NextResponse } from 'next/server';
import { LLMTester } from '@repo/node-set/';

/**
 * POST /api/llm/test
 * 批量测试LLM连接
 * 请求体:
 * - tests: 测试配置数组
 *   - provider: 提供商名称
 *   - config: 连接配置
 *   - message?: 测试消息
 *   - id?: 可选的标识符
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tests, message: globalMessage } = body;

    if (!tests || !Array.isArray(tests)) {
      return NextResponse.json(
        {
          success: false,
          error: '参数错误',
          message: 'tests 必须是数组'
        },
        { status: 400 }
      );
    }

    const results = [];

    // 并行执行所有测试
    const testPromises = tests.map(async (test: any) => {
      const { provider, config, message, id } = test;
      
      if (!provider || !config) {
        return {
          id: id || `${provider}-${Date.now()}`,
          provider,
          success: false,
          error: '缺少必要参数',
          message: 'provider 和 config 是必填字段'
        };
      }

      try {
        // 验证提供商是否支持
        if (!LLMTester.isProviderSupported(provider)) {
          return {
            id: id || `${provider}-${Date.now()}`,
            provider,
            success: false,
            error: '不支持的提供商',
            message: `提供商 "${provider}" 不受支持`
          };
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
          provider,
          testConfig,
          message || globalMessage
        );

        return {
          id: id || `${provider}-${Date.now()}`,
          provider,
          ...result
        };

      } catch (error) {
        return {
          id: id || `${provider}-${Date.now()}`,
          provider,
          success: false,
          error: '测试执行失败',
          message: error instanceof Error ? error.message : '未知错误'
        };
      }
    });

    // 等待所有测试完成
    const testResults = await Promise.all(testPromises);
    
    // 统计结果
    const successCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;

    return NextResponse.json({
      success: true,
      data: {
        results: testResults,
        summary: {
          total: totalCount,
          success: successCount,
          failed: totalCount - successCount,
          successRate: totalCount > 0 ? (successCount / totalCount * 100).toFixed(2) + '%' : '0%'
        }
      },
      message: `批量测试完成: ${successCount}/${totalCount} 成功`
    });

  } catch (error) {
    console.error('LLM批量测试失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'LLM批量测试失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/llm/test
 * 获取支持的LLM提供商列表
 */
export async function GET() {
  try {
    const providers = LLMTester.getSupportedProviders();
    
    return NextResponse.json({
      success: true,
      data: {
        providers,
        count: providers.length
      },
      message: '获取支持的提供商列表成功'
    });

  } catch (error) {
    console.error('获取提供商列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取提供商列表失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 