import { NextRequest, NextResponse } from 'next/server';
import { prisma, WorkflowConfigNotFoundError } from '@repo/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE - 软删除工作流配置
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const config = await prisma.workflowConfig.softDeleteWorkflowConfig(id);
    return NextResponse.json({ 
      success: true, 
      data: config,
      message: '工作流配置已删除' 
    });
  } catch (error: any) {
    console.error('Error soft deleting workflow config:', error);
    
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