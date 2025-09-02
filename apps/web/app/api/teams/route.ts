import { NextRequest, NextResponse } from 'next/server';
import { teamManager, CreateTeamInput } from '@repo/common';
import { initializeServer } from '@/lib/serverInit';

/**
 * 获取团队列表
 * GET /api/teams?includeMembers=true
 */
export async function GET(request: NextRequest) {
    try {
        // 确保服务器已初始化
        await initializeServer();

        const { searchParams } = new URL(request.url);
        const includeMembers = searchParams.get('includeMembers') === 'true';

        const teams = await teamManager.mediator?.list({
            includeMembers
        });

        return NextResponse.json({
            success: true,
            data: teams || []
        });
    } catch (error) {
        console.error('获取团队列表失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '获取团队列表失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}

/**
 * 创建新团队
 * POST /api/teams
 */
export async function POST(request: NextRequest) {
    try {
        // 确保服务器已初始化
        await initializeServer();

        const body = await request.json();
        const input: CreateTeamInput = {
            name: body.name,
            createdBy: body.createdBy,
        };

        // 验证输入
        if (!input.name || input.name.trim() === '') {
            return NextResponse.json(
                {
                    success: false,
                    error: '团队名称不能为空'
                },
                { status: 400 }
            );
        }

        const team = await teamManager.mediator?.create(input);

        return NextResponse.json({
            success: true,
            data: team,
            message: '团队创建成功'
        }, { status: 201 });
    } catch (error) {
        console.error('创建团队失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '创建团队失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}