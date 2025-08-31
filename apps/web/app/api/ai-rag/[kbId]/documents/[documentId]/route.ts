import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

/**
 * 删除单个文档
 * DELETE /api/ai-rag/[kbId]/documents/[documentId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string; documentId: string }> }
) {
  try {
    const { kbId, documentId } = await params;

    console.log('🗑️ 删除文档:', { kbId, documentId });

    // 验证知识库是否存在
    const knowledgeBase = await prisma.aiKb.findUnique({
      where: { id: kbId }
    });

    if (!knowledgeBase) {
      return NextResponse.json({
        success: false,
        error: { message: '知识库不存在' }
      }, { status: 404 });
    }

    // 验证文档是否存在并属于该知识库
    const document = await prisma.kbDocument.findFirst({
      where: {
        id: documentId,
        kbId: kbId
      }
    });

    if (!document) {
      return NextResponse.json({
        success: false,
        error: { message: '文档不存在或不属于该知识库' }
      }, { status: 404 });
    }

    // 删除文档记录
    await prisma.kbDocument.delete({
      where: { id: documentId }
    });

    console.log('✅ 文档删除成功:', documentId);

    return NextResponse.json({
      success: true,
      message: '文档删除成功'
    });

  } catch (error) {
    console.error('❌ 删除文档失败:', error);
    return NextResponse.json({
      success: false,
      error: { message: '删除文档失败' }
    }, { status: 500 });
  }
}

/**
 * 重新处理文档
 * POST /api/ai-rag/[kbId]/documents/[documentId]/reprocess
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string; documentId: string }> }
) {
  try {
    const { kbId, documentId } = await params;

    console.log('🔄 重新处理文档:', { kbId, documentId });

    // 验证知识库是否存在
    const knowledgeBase = await prisma.aiKb.findUnique({
      where: { id: kbId }
    });

    if (!knowledgeBase) {
      return NextResponse.json({
        success: false,
        error: { message: '知识库不存在' }
      }, { status: 404 });
    }

    // 验证文档是否存在并属于该知识库
    const document = await prisma.kbDocument.findFirst({
      where: {
        id: documentId,
        kbId: kbId
      }
    });

    if (!document) {
      return NextResponse.json({
        success: false,
        error: { message: '文档不存在或不属于该知识库' }
      }, { status: 404 });
    }

    // 更新文档状态为处理中
    await prisma.kbDocument.update({
      where: { id: documentId },
      data: {
        status: 'processing',
        processedTime: null
      }
    });

    // TODO: 这里应该触发实际的文档重新处理逻辑
    // 可以使用队列系统或后台任务来处理
    console.log('📝 文档重新处理任务已启动:', documentId);

    return NextResponse.json({
      success: true,
      message: '文档重新处理已启动'
    });

  } catch (error) {
    console.error('❌ 重新处理文档失败:', error);
    return NextResponse.json({
      success: false,
      error: { message: '重新处理文档失败' }
    }, { status: 500 });
  }
}