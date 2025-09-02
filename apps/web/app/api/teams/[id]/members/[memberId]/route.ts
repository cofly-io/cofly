import { NextRequest, NextResponse } from 'next/server';
import { teamManager, UpdateTeamMemberInput } from '@repo/common';
import { initializeServer } from '@/lib/serverInit';

/**
 * 更新团队成员信息
 * PUT /api/teams/[id]/members/[memberId]
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    try {
        // 确保服务器已初始化
        await initializeServer();

        const body = await request.json();
        const input: UpdateTeamMemberInput = {
            isLeader: body.isLeader,
        };

        const { id, memberId } = await params;
        const member = await teamManager.mediator?.updateMember(
            id, 
            memberId, 
            input
        );

        return NextResponse.json({
            success: true,
            data: member,
            message: '成员信息更新成功'
        });
    } catch (error) {
        console.error('更新团队成员失败:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: '更新团队成员失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}

/**
 * 移除团队成员
 * DELETE /api/teams/[id]/members/[memberId]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    try {
        // 确保服务器已初始化
        await initializeServer();

        const { id, memberId } = await params;
        const result = await teamManager.mediator?.removeMember(
            id,
            memberId
        );

        if (!result || !result.success) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: result?.message || '移除成员失败'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result?.message || '成员移除成功'
        });
    } catch (error) {
        console.error('移除团队成员失败:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: '移除团队成员失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}
