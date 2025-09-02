import { NextRequest, NextResponse } from 'next/server';
import { knowledgeBaseManager } from "@repo/knowledge-base";

/**
 * 获取知识库文档列表
 * GET /api/ai-rag/[kbId]/search
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string }> }
) {
    try {
        const { kbId } = await params;
        const { searchParams } = new URL(request.url);

        // 获取查询参数
        const query = searchParams.get('query');
        if(!query) {
            throw new Error("搜索内容不能为空");
        }

        const kb = await knowledgeBaseManager.get(kbId);
        if(!kb) {
            throw new Error("找不到知识库：" + kbId);
        }

        const result = await kb.searchDocuments({
            query
        });

        return NextResponse.json({
            success: true,
            data: result.results,
        });

    } catch (error) {
        console.error('❌ 查询知识库失败:', error);
        return NextResponse.json({
            success: false,
            error: {message: '查询知识库失败'}
        }, {status: 500});
    }
}