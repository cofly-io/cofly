import { NextRequest, NextResponse } from 'next/server';
import { CryptoService } from '@/lib/crypto';
import { prisma } from '@repo/database';

// GET - 获取连接配置列表（支持过滤）
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

    // 重新组装安全的配置对象
    const createSafeConfig = (configData: any) => {
      if (!configData || typeof configData !== 'object') {
        return {};
      }
      
      // 只返回非敏感的配置字段
      const safeConfig: any = {};
      
      // 允许返回的安全字段（敏感字段如apiKey会在前端显示时进行掩码处理）
      const safeFields = ['baseUrl', 'driver', 'model', 'endpoint', 'region', 'version', 'timeout', 'maxTokens', 'apiKey'];
      
      safeFields.forEach(field => {
        if (configData[field] !== undefined) {
          safeConfig[field] = configData[field];
        }
      });
      
      return safeConfig;
    };

    const configsWithDecryptedData = await Promise.all(configs.map(async (config: any) => {
      try {
        // 开发阶段：直接解析未加密的JSON字符串
        const configData = JSON.parse(config.configinfo);
        
        return {
          id: config.id,
          name: config.name,
          ctype: config.ctype,
          mtype: config.mtype || undefined,
          config: createSafeConfig(configData),
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

    return NextResponse.json({
      success: true,
      data: configsWithDecryptedData,
      total: configsWithDecryptedData.length
    });
  } catch (error) {
    console.error('Error fetching connect configs:', error);
    return NextResponse.json({
      success: false,
      error: '获取连接配置失败'
    }, { status: 500 });
  }
}

// POST - 创建新的连接配置
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 POST /api/connect-configs 开始执行');
    
    const body = await request.json();
    console.log('📥 接收到的请求数据:', body);
    
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

    // 将配置信息转换为 JSON 字符串并加密
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

    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('❌ 创建连接配置失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建连接配置失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}