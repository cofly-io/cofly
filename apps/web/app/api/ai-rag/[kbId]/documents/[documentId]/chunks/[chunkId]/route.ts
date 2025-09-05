import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { knowledgeBaseManager } from '@repo/common';

/**
 * 删除单个文档片段
 * DELETE /api/ai-rag/[kbId]/documents/[documentId]/chunks/[chunkId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string; documentId: string; chunkId: string }> }
) {
  try {
    const { kbId, documentId, chunkId } = await params;

    console.log('🗑️ 删除文档片段:', { kbId, documentId, chunkId });

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

    // 验证文档片段是否存在并属于该文档
    const chunk = await prisma.kbDocumentChunk.findFirst({
      where: {
        id: chunkId,
        documentId: documentId
      }
    });

    if (!chunk) {
      return NextResponse.json({
        success: false,
        error: { message: '文档片段不存在或不属于该文档' }
      }, { status: 404 });
    }

    // 使用 KnowledgeBaseManager 删除文档片段
    const kbInstance = await knowledgeBaseManager.mediator?.get(kbId);
    const deleteResult = await kbInstance?.deleteDocumentChunk(chunkId);

    if (!deleteResult) {
      return NextResponse.json({
        success: false,
        error: { message: '删除文档片段失败' }
      }, { status: 500 });
    }

    console.log('✅ 文档片段删除成功:', chunkId);

    return NextResponse.json({
      success: true,
      message: '文档片段删除成功'
    });

  } catch (error) {
    console.error('❌ 删除文档片段失败:', error);
    return NextResponse.json({
      success: false,
      error: { message: '删除文档片段失败' }
    }, { status: 500 });
  }
}