import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// GET - 获取 AI RAG 知识库列表（支持过滤）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vectorConnectId = searchParams.get('vectorConnectId');
    const embeddingConnectId = searchParams.get('embeddingConnectId');
    const rerankerConnectId = searchParams.get('rerankerConnectId');
    const name = searchParams.get('name');

    const where: any = {};

    if (vectorConnectId) {
      where.vectorConnectId = vectorConnectId;
    }

    if (embeddingConnectId) {
      where.embeddingConnectId = embeddingConnectId;
    }

    if (rerankerConnectId) {
      where.rerankerConnectId = rerankerConnectId;
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive'
      };
    }

    const aiRags = await prisma.aiKb.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: aiRags,
      total: aiRags.length
    });
  } catch (error) {
    console.error('Error fetching AI RAG configs:', error);
    return NextResponse.json({
      success: false,
      error: '获取 AI RAG 知识库列表失败'
    }, { status: 500 });
  }
}

// POST - 创建新的 AI RAG 知识库
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 POST /api/ai-rag 开始执行');

    const body = await request.json();
    console.log('📥 接收到的请求数据:', body);

    const {
      name,
      vectorConnectId,
      embeddingConnectId,
      embeddingModelId,
      embeddingModelName,
      embeddingDimension,
      documentCount,
      rerankerConnectId,
      rerankerModelId,
      rerankerModelName,
      chunkSize,
      chunkOverlap,
      matchingThreshold
    } = body;

    // 验证必填字段
    if (!name) {
      const error = '缺少必填字段：name';
      console.error('❌ 验证失败:', error);
      return NextResponse.json({
        success: false,
        error
      }, { status: 400 });
    }

    console.log('✅ 字段验证通过');

    // 检查连接配置是否存在
    const [vectorConfig, embeddingConfig, rerankerConfig] = await Promise.all([
      prisma.connectConfig.findUnique({ where: { id: vectorConnectId } }),
      prisma.connectConfig.findUnique({ where: { id: embeddingConnectId } }),
      prisma.connectConfig.findUnique({ where: { id: rerankerConnectId } })
    ]);

    // if (!vectorConfig) {
    //   return NextResponse.json({
    //     success: false,
    //     error: '向量库连接配置不存在'
    //   }, { status: 400 });
    // }

    // if (!embeddingConfig) {
    //   return NextResponse.json({
    //     success: false,
    //     error: '嵌入模型连接配置不存在'
    //   }, { status: 400 });
    // }

    // if (!rerankerConfig) {
    //   return NextResponse.json({
    //     success: false,
    //     error: '排序模型连接配置不存在'
    //   }, { status: 400 });
    // }

    // console.log('💾 准备插入数据库...');

    // 保存到数据库
    const savedAiRag = await prisma.aiKb.create({
      data: {
        name,
        vectorConnectId: vectorConnectId || null,
        embeddingConnectId: embeddingConnectId || null,
        embeddingModelId: embeddingModelId || null,
        embeddingDimension: embeddingDimension && embeddingDimension !== '' && embeddingDimension !== 0 ? embeddingDimension : null,
        documentCount: documentCount || null,
        rerankerConnectId: rerankerConnectId || null,
        rerankerModelId: rerankerModelId || null,
        chunkSize: chunkSize || null,
        chunkOverlap: chunkOverlap || null,
        matchingThreshold: matchingThreshold || null
      },
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
      data: savedAiRag,
      message: 'AI RAG 知识库创建成功'
    });

  } catch (error) {
    console.error('❌ 创建 AI RAG 知识库失败:', error);
    console.error('🔍 错误详情:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({
      success: false,
      error: '创建 AI RAG 知识库失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}