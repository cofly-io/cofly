import { NextRequest, NextResponse } from 'next/server';
import { teamManager, UpdateTeamInput } from '@repo/common';
import { initializeServer } from '@/lib/serverInit';

/**
 * 获取单个团队详情
 * GET /api/teams/[id]?includeMembers=true
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // 确保服务器已初始化
        await initializeServer();

        const { searchParams } = new URL(request.url);
        const includeMembers = searchParams.get('includeMembers') === 'true';

        const team = await teamManager.mediator.get(id, {
            includeMembers
        });

        if (!team) {
            return NextResponse.json(
                {
                    success: false,
                    error: '团队不存在'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: team
        });
    } catch (error) {
        console.error('获取团队详情失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '获取团队详情失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}

/**
 * 更新团队信息
 * PUT /api/teams/[id]
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 确保服务器已初始化
        await initializeServer();

        const body = await request.json();
        const input: UpdateTeamInput = {
            name: body.name,
        };

        // 验证输入
        if (input.name !== undefined && input.name.trim() === '') {
            return NextResponse.json(
                {
                    success: false,
                    error: '团队名称不能为空'
                },
                { status: 400 }
            );
        }

        const { id } = await params;
        const team = await teamManager.mediator.update(id, input);

        return NextResponse.json({
            success: true,
            data: team,
            message: '团队更新成功'
        });
    } catch (error) {
        console.error('更新团队失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '更新团队失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}

/**
 * 删除团队
 * DELETE /api/teams/[id]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 确保服务器已初始化
        await initializeServer();

        const { id } = await params;
        const result = await teamManager.mediator.delete(id);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.message || '删除团队失败'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message || '团队删除成功'
        });
    } catch (error) {
        console.error('删除团队失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '删除团队失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}