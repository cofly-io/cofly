import { NextRequest, NextResponse } from 'next/server';
import { CryptoService } from '@/lib/crypto';
import { prisma } from '@repo/database';

interface SaveConnectConfigRequest {
  connectId: string;
  name: string;
  mtype?: string; // 连接模型类型
  config: Record<string, any>;
  creator?: string;
}

/**
 * POST /api/connect/config
 * 保存连接配置
 */
export async function POST(request: NextRequest) {
  console.log('🚀 API /connect/config POST 请求开始');
  
  try {
    console.log('📥 开始解析请求体...');
    const body: SaveConnectConfigRequest = await request.json();
    console.log('✅ 请求体解析成功:', body);

    const { connectId, name, mtype, config, creator } = body;

    // 验证必填字段
    if (!connectId || !name || !config) {
      const error = '缺少必填字段：connectId、name 或 config';
      console.error('❌ 验证失败:', error);
      return NextResponse.json({
        success: false,
        error
      }, { status: 400 });
    }

    console.log('✅ 字段验证通过');

    // 将配置信息转换为 JSON 字符串
    const configJson = JSON.stringify(config);
    console.log('📝 配置 JSON 长度:', configJson.length);
    
    // 开发阶段：直接使用未加密的JSON字符串
    const encryptedConfig = configJson;
    console.log('⚠️ 开发模式：配置未加密，直接存储JSON字符串');

    // 生成配置 ID
    const configId = CryptoService.generateConfigId();
    console.log('🆔 生成的配置 ID:', configId);

    console.log('💾 准备插入数据库...');

    // 保存到数据库
    const savedConfig = await prisma.connectConfig.create({
      data: {
        id: configId,
        name: name,
        ctype: connectId,
        mtype: mtype || null,
        configinfo: encryptedConfig,
        creator: creator || 'system'
      }
    });

    const result = {
      success: true,
      data: {
        id: savedConfig.id,
        name: savedConfig.name,
        ctype: savedConfig.ctype,
        mtype: savedConfig.mtype || undefined,
        config: config, // 返回未加密的配置
        creator: savedConfig.creator || undefined
      },
      message: '连接配置保存成功'
    };

    console.log('✅ 配置保存成功，返回 201');
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('❌ API 错误:', error);
    console.error('🔍 错误详情:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: '保存连接配置失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * GET /api/connect/config
 * 获取连接配置列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ctype = searchParams.get('ctype');
    const mtype = searchParams.get('mtype');
    const creator = searchParams.get('creator');

    const where: any = {};
    
    if (ctype) {
      where.ctype = ctype;
    }

    if (mtype) {
      where.mtype = mtype;
    }
    
    if (creator) {
      where.creator = creator;
    }

    const configs = await prisma.connectConfig.findMany({
      where,
      orderBy: {
        createdtime: 'desc'
      }
    });

    const configsWithDecryptedData = await Promise.all(configs.map(async (config) => {
      try {
        // 开发阶段：直接解析未加密的JSON字符串
        const configData = JSON.parse(config.configinfo);
       
        return {
          id: config.id,
          name: config.name,
          ctype: config.ctype,
          mtype: config.mtype || undefined,
          config: configData,
          creator: config.creator || undefined
        };
      } catch (error) {
        console.error(`解析配置失败 (ID: ${config.id}):`, error);
        return {
          id: config.id,
          name: config.name,
          ctype: config.ctype,
          mtype: config.mtype || undefined,
          config: {},
          creator: config.creator || undefined
        };
      }
    }));

    const result = {
      success: true,
      data: configsWithDecryptedData,
      total: configsWithDecryptedData.length
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('获取连接配置列表 API 错误:', error);
    return NextResponse.json({
      success: false,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : '获取配置列表失败'
    }, { status: 500 });
  }
} 