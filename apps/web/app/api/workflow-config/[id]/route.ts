import { NextRequest, NextResponse } from 'next/server';
import { prisma, WorkflowConfigNotFoundError } from '@repo/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - 根据ID获取工作流配置
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const config = await prisma.workflowConfig.getWorkflowConfigById(id);
    
    if (!config) {
      return NextResponse.json(
        { success: false, error: '工作流配置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    console.error('Error fetching workflow config:', error);
    return NextResponse.json(
      { success: false, error: '获取工作流配置失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新工作流配置
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, ...updateData } = body;

    // 如果是切换状态操作
    if (action === 'toggle') {
      const config = await prisma.workflowConfig.toggleWorkflowConfigStatus(id);
      return NextResponse.json({ success: true, data: config });
    }

    // 普通更新操作
    const { nodesInfo, relation, ...otherData } = updateData;
    const config = await prisma.workflowConfig.updateWorkflowConfig(id, {
      ...otherData,
      nodesInfo: nodesInfo ? JSON.stringify(nodesInfo) : undefined,
      relation: relation ? JSON.stringify(relation) : undefined,
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    console.error('Error updating workflow config:', error);
    
    if (error instanceof WorkflowConfigNotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: '更新工作流配置失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除工作流配置
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.workflowConfig.deleteWorkflowConfig(id);
    return NextResponse.json({ success: true, message: '工作流配置已删除' });
  } catch (error: any) {
    console.error('Error deleting workflow config:', error);
    
    if (error instanceof WorkflowConfigNotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: '删除工作流配置失败' },
      { status: 500 }
    );
  }
} 