import { NextRequest, NextResponse } from 'next/server';
import { prisma, WorkflowConfigExistsError } from '@repo/database';

// GET - 获取工作流配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let configs;
    if (user) {
      configs = await prisma.workflowConfig.getWorkflowConfigsByUser(user);
    } else if (activeOnly) {
      configs = await prisma.workflowConfig.getActiveWorkflowConfigs();
    } else {
      configs = await prisma.workflowConfig.getAllWorkflowConfigs();
    }

    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    console.error('Error fetching workflow configs:', error);
    return NextResponse.json(
      { success: false, error: '获取工作流配置失败' },
      { status: 500 }
    );
  }
}

// POST - 创建工作流配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      version = '1.0.0',
      isActive = true,
      nodesInfo,
      relation,
      createUser = 'default_user'
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: '工作流名称不能为空' },
        { status: 400 }
      );
    }

    const config = await prisma.workflowConfig.createWorkflowConfig({
      name,
      version,
      isActive,
      nodesInfo: JSON.stringify(nodesInfo),
      relation: JSON.stringify(relation),
      createUser
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    console.error('Error creating workflow config:', error);

    if (error instanceof WorkflowConfigExistsError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: '创建工作流配置失败' },
      { status: 500 }
    );
  }
}

// PUT - 保存工作流配置（创建或更新）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workflowId,
      workflowName,
      nodesToSave,
      edgesToSave,
      createUser = 'default_user'
    } = body;

    if (!workflowId || !workflowName) {
      return NextResponse.json(
        { success: false, error: '工作流ID和名称不能为空' },
        { status: 400 }
      );
    }

    const config = await prisma.workflowConfig.saveCurrentWorkflow(
      workflowId,
      workflowName,
      nodesToSave || [],
      edgesToSave || [],
      createUser
    );

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    console.error('Error saving workflow config:', error);

    return NextResponse.json(
      { success: false, error: '保存工作流配置失败' },
      { status: 500 }
    );
  }
} 