import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// 重新组装安全的配置对象
const createSafeConfig = (configData: any) => {
  if (!configData || typeof configData !== 'object') {
    return {};
  }
  
  // 只返回非敏感的配置字段
  const safeConfig: any = {};
  
  // 允许返回的安全字段
  const safeFields = ['baseUrl', 'driver', 'model', 'endpoint', 'region', 'version', 'timeout', 'maxTokens'];
  
  safeFields.forEach(field => {
    if (configData[field] !== undefined) {
      safeConfig[field] = configData[field];
    }
  });
  
  return safeConfig;
};

/**
 * 获取单个连接配置
 * GET /api/connect-configs/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const config = await prisma.connectConfig.findUnique({
      where: { id }
    });

    if (!config) {
      return NextResponse.json({
        success: false,
        error: '配置不存在'
      }, { status: 404 });
    }

    // 开发阶段：直接解析未加密的JSON字符串
    const configData = JSON.parse(config.configinfo);

    return NextResponse.json({
      success: true,
      data: {
        id: config.id,
        name: config.name,
        ctype: config.ctype,
        mtype: config.mtype || undefined,
        config: configData, // 在编辑模式下返回完整配置以便表单回显
        creator: config.creator || undefined
      }
    });

  } catch (error) {
    console.error('🔧 GET /api/connect-configs/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取配置失败'
    }, { status: 500 });
  }
}

/**
 * 更新连接配置
 * PUT /api/connect-configs/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔧 PUT /api/connect-configs/[id] 开始, ID:', id);
    
    const body = await request.json();
    console.log('📥 接收到的更新数据:', body);

    // 检查配置是否存在
    const existingConfig = await prisma.connectConfig.findUnique({
      where: { id }
    });

    if (!existingConfig) {
      return NextResponse.json({
        success: false,
        error: '配置不存在'
      }, { status: 404 });
    }

    // 准备更新数据
    const updateData: any = {};
    
    if (body.name) {
      updateData.name = body.name;
    }
    
    if (body.connectId) {
      updateData.ctype = body.connectId;
    }
    
    if (body.mtype !== undefined) {
      updateData.mtype = body.mtype;
    }
    
    if (body.config) {
      // 开发阶段：直接存储未加密的JSON字符串
      const configJson = JSON.stringify(body.config);
      updateData.configinfo = configJson;
      console.log('⚠️ 开发模式：配置未加密，直接存储JSON字符串');
    }
    
    if (body.creator) {
      updateData.creator = body.creator;
    }

    // 更新数据库
    const updatedConfig = await prisma.connectConfig.update({
      where: { id },
      data: updateData
    });

    // 开发阶段：直接解析未加密的JSON字符串
    const configData = JSON.parse(updatedConfig.configinfo);
    return NextResponse.json({
      success: true,
      data: {
        id: updatedConfig.id,
        name: updatedConfig.name,
        ctype: updatedConfig.ctype,
        mtype: updatedConfig.mtype || undefined,
        config: configData, // 返回更新后的配置数据
        creator: updatedConfig.creator || undefined
      },
      message: '连接配置更新成功'
    });

  } catch (error) {
    console.error('🔧 PUT /api/connect-configs/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: '更新连接配置失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * 删除连接配置
 * DELETE /api/connect-configs/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔧 DELETE /api/connect-configs/[id] 开始, ID:', id);
    
    // 检查配置是否存在
    const existingConfig = await prisma.connectConfig.findUnique({
      where: { id }
    });

    if (!existingConfig) {
      return NextResponse.json({
        success: false,
        error: '配置不存在'
      }, { status: 404 });
    }

    // 检查是否有智能体引用此连接配置
    const referencingAgents = await prisma.aiAgent.findMany({
      where: { connectid: id },
      select: { id: true, name: true }
    });

    if (referencingAgents.length > 0) {
      const agentNames = referencingAgents.map(agent => agent.name).join('、');
      return NextResponse.json({
        success: false,
        error: 'REFERENCED_BY_AGENTS',
        message: `${agentNames}智能体引用这个连接，不能删除，请解开引用`,
        referencingAgents: referencingAgents
      }, { status: 400 });
    }

    // 删除配置
    await prisma.connectConfig.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '连接配置删除成功'
    });

  } catch (error) {
    console.error('🔧 DELETE /api/connect-configs/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: '删除连接配置失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}