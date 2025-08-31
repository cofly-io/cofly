import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tabkey = searchParams.get('tabkey');

    if (!tabkey) {
      return NextResponse.json(
        { error: 'tabkey parameter is required' },
        { status: 400 }
      );
    }

    const setting = await prisma.systemModelSetting.findUnique({
      where: {
        tabkey: tabkey
      }
    });

    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    // 解析 tabDetails JSON 字符串
    let tabDetails;
    try {
      tabDetails = JSON.parse(setting.tabDetails);
    } catch (error) {
      tabDetails = setting.tabDetails;
    }

    return NextResponse.json({
      tabkey: setting.tabkey,
      tabDetails: tabDetails,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt
    });
  } catch (error) {
    console.error('Error fetching system model setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tabkey, tabDetails } = body;

    if (!tabkey || !tabDetails) {
      return NextResponse.json(
        { error: 'tabkey and tabDetails are required' },
        { status: 400 }
      );
    }

    // 确保 tabDetails 是字符串格式
    const tabDetailsString = typeof tabDetails === 'string' 
      ? tabDetails 
      : JSON.stringify(tabDetails);

    // 使用 upsert 来创建或更新记录
    const setting = await prisma.systemModelSetting.upsert({
      where: {
        tabkey: tabkey
      },
      update: {
        tabDetails: tabDetailsString,
        updatedAt: new Date()
      },
      create: {
        tabkey: tabkey,
        tabDetails: tabDetailsString
      }
    });

    // 解析返回的 tabDetails
    let parsedTabDetails;
    try {
      parsedTabDetails = JSON.parse(setting.tabDetails);
    } catch (error) {
      parsedTabDetails = setting.tabDetails;
    }

    return NextResponse.json({
      tabkey: setting.tabkey,
      tabDetails: parsedTabDetails,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt
    });
  } catch (error) {
    console.error('Error saving system model setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tabkey, tabDetails } = body;

    if (!tabkey || !tabDetails) {
      return NextResponse.json(
        { error: 'tabkey and tabDetails are required' },
        { status: 400 }
      );
    }

    // 确保 tabDetails 是字符串格式
    const tabDetailsString = typeof tabDetails === 'string' 
      ? tabDetails 
      : JSON.stringify(tabDetails);

    // 检查记录是否存在
    const existingSetting = await prisma.systemModelSetting.findUnique({
      where: {
        tabkey: tabkey
      }
    });

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    // 更新记录
    const setting = await prisma.systemModelSetting.update({
      where: {
        tabkey: tabkey
      },
      data: {
        tabDetails: tabDetailsString,
        updatedAt: new Date()
      }
    });

    // 解析返回的 tabDetails
    let parsedTabDetails;
    try {
      parsedTabDetails = JSON.parse(setting.tabDetails);
    } catch (error) {
      parsedTabDetails = setting.tabDetails;
    }

    return NextResponse.json({
      tabkey: setting.tabkey,
      tabDetails: parsedTabDetails,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt
    });
  } catch (error) {
    console.error('Error updating system model setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tabkey = searchParams.get('tabkey');

    if (!tabkey) {
      return NextResponse.json(
        { error: 'tabkey parameter is required' },
        { status: 400 }
      );
    }

    // 检查记录是否存在
    const existingSetting = await prisma.systemModelSetting.findUnique({
      where: {
        tabkey: tabkey
      }
    });

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    // 删除记录
    await prisma.systemModelSetting.delete({
      where: {
        tabkey: tabkey
      }
    });

    return NextResponse.json({
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting system model setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}