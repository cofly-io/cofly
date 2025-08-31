import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

/**
 * 获取知识库文档列表
 * GET /api/ai-rag/[kbId]/documents
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string }> }
) {
  try {
    const { kbId } = await params;
    const { searchParams } = new URL(request.url);
    
    // 获取查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const fileType = searchParams.get('fileType');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'uploadTime';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log('📋 获取知识库文档列表:', { kbId, page, limit, status, fileType, search, sortBy, sortOrder });

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

    // 构建查询条件
    const where: any = {
      kbId: kbId
    };

    if (status) {
      where.status = status;
    }

    if (fileType) {
      where.fileType = fileType;
    }

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { textPreview: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 构建排序条件
    const orderBy: any = {};
    switch (sortBy) {
      case 'fileName':
        orderBy.fileName = sortOrder;
        break;
      case 'fileSize':
        orderBy.fileSize = sortOrder;
        break;
      case 'status':
        orderBy.status = sortOrder;
        break;
      default:
        orderBy.uploadTime = sortOrder;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 查询文档总数
    const total = await prisma.kbDocument.count({ where });

    // 查询文档列表
    const documents = await prisma.kbDocument.findMany({
      where,
      orderBy,
      skip,
      take: limit
    });

    // 转换数据格式
    const transformedDocuments = documents.map((doc: any) => ({
      id: doc.id,
      fileName: doc.fileName,
      originalName: doc.originalName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      uploadTime: doc.uploadTime,
      processedTime: doc.processedTime,
      status: doc.status,
      chunkCount: doc.chunkCount || 0,
      filePath: doc.filePath,
      textPreview: doc.textPreview || '',
      mimeType: doc.mimeType,
      checksum: doc.checksum
    }));

    // 计算分页信息
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      success: true,
      data: {
        documents: transformedDocuments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 获取文档列表失败:', error);
    return NextResponse.json({
      success: false,
      error: { message: '获取文档列表失败' }
    }, { status: 500 });
  }
}