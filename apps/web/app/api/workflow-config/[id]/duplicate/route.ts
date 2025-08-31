import { NextRequest, NextResponse } from 'next/server';
import { 
  prisma,
  WorkflowConfigNotFoundError,
  WorkflowConfigExistsError 
} from '@repo/database';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST - 复制工作流配置
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newName, createUser = 'default_user' } = body;

    if (!newName) {
      return NextResponse.json(
        { success: false, error: '新工作流名称不能为空' },
        { status: 400 }
      );
    }

    const config = await prisma.workflowConfig.duplicateWorkflowConfig(id, newName, createUser);
    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    console.error('Error duplicating workflow config:', error);
    
    if (error instanceof WorkflowConfigNotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error instanceof WorkflowConfigExistsError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: '复制工作流配置失败' },
      { status: 500 }
    );
  }
} 