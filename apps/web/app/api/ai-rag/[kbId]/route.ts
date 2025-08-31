import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

/**
 * 获取单个 AI RAG 知识库
 * GET /api/ai-rag/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string }> }
) {
  try {
    const { kbId: id } = await params;
    console.log('🔧 GET /api/ai-rag/[id] 开始, ID:', id);
    
    const aiRag = await prisma.aiKb.findUnique({
      where: { id },
      include: {
        vectorConnectConfig: {
          select: {
            id: true,
            name: true,
            ctype: true
          }
        },
        embeddingConnectConfig: {
          select: {
            id: true,
            name: true,
            ctype: true
          }
        },
        rerankConnectConfig: {
          select: {
            id: true,
            name: true,
            ctype: true
          }
        }
      }
    });

    if (!aiRag) {
      return NextResponse.json({
        success: false,
        error: 'AI RAG 知识库不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: aiRag
    });

  } catch (error) {
    console.error('🔧 GET /api/ai-rag/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取 AI RAG 知识库失败'
    }, { status: 500 });
  }
}

/**
 * 更新 AI RAG 知识库
 * PUT /api/ai-rag/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string }> }
) {
  try {
    const { kbId: id } = await params;
    
    const body = await request.json();

    // 检查 AI RAG 知识库是否存在
    const existingAiRag = await prisma.aiKb.findUnique({
      where: { id }
    });

    if (!existingAiRag) {
      return NextResponse.json({
        success: false,
        error: 'AI RAG 知识库不存在'
      }, { status: 404 });
    }

    // 准备更新数据
    const updateData: any = {};
    
    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    
    if (body.collectionName !== undefined) {
      updateData.collectionName = body.collectionName;
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    
    if (body.vectorConnectId !== undefined) {
      updateData.vectorConnectId = body.vectorConnectId || null;
    }
    
    if (body.processorConnectId !== undefined) {
      updateData.processorConnectId = body.processorConnectId || null;
    }
    
    if (body.processorModelId !== undefined) {
      updateData.processorModelId = body.processorModelId || null;
    }
    
    if (body.embeddingConnectId !== undefined) {
      updateData.embeddingConnectId = body.embeddingConnectId || null;
    }
    
    if (body.embeddingModelId !== undefined) {
      updateData.embeddingModelId = body.embeddingModelId || null;
    }
    
    if (body.embeddingDimension !== undefined) {
      updateData.embeddingDimension = body.embeddingDimension && body.embeddingDimension !== '' && body.embeddingDimension !== 0 ? body.embeddingDimension : null;
    }
    
    if (body.documentCount !== undefined) {
      updateData.documentCount = body.documentCount || null;
    }
    
    if (body.rerankerConnectId !== undefined) {
      updateData.rerankerConnectId = body.rerankerConnectId || null;
    }
    
    if (body.rerankerModelId !== undefined) {
      updateData.rerankerModelId = body.rerankerModelId || null;
    }
    
    if (body.chunkSize !== undefined) {
      updateData.chunkSize = body.chunkSize;
    }

    if (body.chunkOverlap !== undefined) {
      updateData.chunkOverlap = body.chunkOverlap;
    }
    
    if (body.matchingThreshold !== undefined) {
      updateData.matchingThreshold = body.matchingThreshold;
    }

    console.log(updateData);
    // 如果有连接配置更新，验证其存在性（排除null值）
    const connectIds = [];
    if (updateData.processorConnectId && updateData.processorConnectId !== null) {
      connectIds.push(updateData.processorConnectId);
    }
    if (updateData.vectorConnectId && updateData.vectorConnectId !== null) {
      connectIds.push(updateData.vectorConnectId);
    }
    if (updateData.embeddingConnectId && updateData.embeddingConnectId !== null) {
      connectIds.push(updateData.embeddingConnectId);
    }
    if (updateData.rerankerConnectId && updateData.rerankerConnectId !== null) {
      connectIds.push(updateData.rerankerConnectId);
    }

    if (connectIds.length > 0) {
      const existingConfigs = await prisma.connectConfig.findMany({
        where: {
          id: {
            in: connectIds
          }
        }
      });

      if (existingConfigs.length !== connectIds.length) {
        return NextResponse.json({
          success: false,
          error: '部分连接配置不存在'
        }, { status: 400 });
      }
    }

    // 更新数据库
    const updatedAiRag = await prisma.aiKb.update({
      where: { id },
      data: updateData,
      include: {
        vectorConnectConfig: {
          select: {
            id: true,
            name: true,
            ctype: true
          }
        },
        embeddingConnectConfig: {
          select: {
            id: true,
            name: true,
            ctype: true
          }
        },
        rerankConnectConfig: {
          select: {
            id: true,
            name: true,
            ctype: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedAiRag,
      message: 'AI RAG 知识库更新成功'
    });

  } catch (error) {
    console.error('🔧 PUT /api/ai-rag/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: '更新 AI RAG 知识库失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * 删除 AI RAG 知识库
 * DELETE /api/ai-rag/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string }> }
) {
  try {
    const { kbId: id } = await params;
    console.log('🔧 DELETE /api/ai-rag/[id] 开始, ID:', id);
    
    // 检查 AI RAG 知识库是否存在
    const existingAiRag = await prisma.aiKb.findUnique({
      where: { id }
    });

    if (!existingAiRag) {
      return NextResponse.json({
        success: false,
        error: 'AI RAG 知识库不存在'
      }, { status: 404 });
    }

    // TODO: 检查是否有其他资源引用此 AI RAG 知识库
    // 例如：检查是否有智能体或工作流使用此知识库
    // const referencingResources = await prisma.someModel.findMany({
    //   where: { aiRagId: id }
    // });
    // 
    // if (referencingResources.length > 0) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'REFERENCED_BY_RESOURCES',
    //     message: '此知识库正被其他资源引用，不能删除',
    //     referencingResources
    //   }, { status: 400 });
    // }

    // 删除 AI RAG 知识库
    await prisma.aiKb.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'AI RAG 知识库删除成功'
    });

  } catch (error) {
    console.error('🔧 DELETE /api/ai-rag/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: '删除 AI RAG 知识库失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}