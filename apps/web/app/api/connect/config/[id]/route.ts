import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

interface SaveConnectConfigRequest {
  connectId: string;
  name: string;
  mtype?: string;
  config: Record<string, any>;
  creator?: string;
}

/**
 * GET /api/connect/config/[id]
 * 获取单个连接配置
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔧 GET /api/connect/config/[id] 开始, ID:', id);
    
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
        config: configData,
        creator: config.creator || undefined
      }
    });

  } catch (error) {
    console.error('🔧 GET /api/connect/config/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取配置失败'
    }, { status: 500 });
  }
}

/**
 * PUT /api/connect/config/[id]
 * 更新连接配置
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔧 PUT /api/connect/config/[id] 开始, ID:', id);
    
    const body: Partial<SaveConnectConfigRequest> = await request.json();
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
        config: configData,
        creator: updatedConfig.creator || undefined
      },
      message: '连接配置更新成功'
    });

  } catch (error) {
    console.error('🔧 PUT /api/connect/config/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: '更新连接配置失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/connect/config/[id]
 * 删除连接配置
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔧 DELETE /api/connect/config/[id] 开始, ID:', id);
    
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

    // 删除配置
    await prisma.connectConfig.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '连接配置删除成功'
    });

  } catch (error) {
    console.error('🔧 DELETE /api/connect/config/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: '删除连接配置失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 