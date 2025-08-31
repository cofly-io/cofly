import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// GET /api/users/[userId]/settings - 获取用户设置
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('Getting settings for user:', userId);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    // 如果没有数据库连接，返回默认设置
    if (!process.env.DATABASE_URL) {
      console.warn('No DATABASE_URL found, returning default settings');
      return NextResponse.json({
        theme: 'dark',
        notifications: {
          systemUpdates: true,
          workflowCompletion: true,
          workflowErrors: true,
          emailNotifications: true,
          emailFrequency: 'immediate',
          browserNotifications: true,
          doNotDisturb: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          soundEnabled: true,
          soundVolume: 50,
        },
        api: {
          cofly: { apiKey: '', baseUrl: 'https://api.cofly.com' },
          openai: { apiKey: '', baseUrl: 'https://api.openai.com/v1' },
          custom: { name: '', apiKey: '', baseUrl: '', headers: '' },
        },
        mcp: {
          enabledTools: ['file-system', 'database', 'email-sender', 'text-processor'],
          toolConfigs: {},
        },
        preferences: {
          language: 'zh-CN',
          timezone: 'Asia/Shanghai',
          dateFormat: 'YYYY-MM-DD',
          sessionTimeout: 480, // 默认8小时
          autoLogout: true,
          sessionWarning: true,
          warningTime: 5, // 默认5分钟前提醒
        },
      });
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 查找用户设置
    let systemSetting = await prisma.systemSetting.findUnique({
      where: { userId }
    });
    
    console.log('Found existing settings:', !!systemSetting);

    // 如果用户设置不存在，创建默认设置
    if (!systemSetting) {
    systemSetting = await prisma.systemSetting.create({
        data: {
          userId,
          theme: 'light', // 改为默认浅色主题
          notifications: JSON.stringify({
            systemUpdates: true,
            workflowCompletion: true,
            workflowErrors: true,
            emailNotifications: true,
            emailFrequency: 'immediate',
            browserNotifications: true,
            doNotDisturb: false,
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00',
            soundEnabled: true,
            soundVolume: 50,
          }),
          apiConfigs: JSON.stringify({
            cofly: { apiKey: '', baseUrl: 'https://api.cofly.com' },
            openai: { apiKey: '', baseUrl: 'https://api.openai.com/v1' },
            custom: { name: '', apiKey: '', baseUrl: '', headers: '' },
          }),
          mcpSettings: JSON.stringify({
            enabledTools: ['file-system', 'database', 'email-sender', 'text-processor'],
            toolConfigs: {},
          }),
          preferences: JSON.stringify({
            language: 'zh-CN',
            timezone: 'Asia/Shanghai',
            dateFormat: 'YYYY-MM-DD',
            sessionTimeout: 480, // 默认8小时
            autoLogout: true,
            sessionWarning: true,
            warningTime: 5, // 默认5分钟前提醒
          }),
        }
      });
    }

    // 解析JSON字段并构造响应
    const settings = {
      theme: systemSetting.theme,
    notifications: JSON.parse(systemSetting.notifications),
    api: JSON.parse(systemSetting.apiConfigs),
    mcp: JSON.parse(systemSetting.mcpSettings),
    preferences: JSON.parse(systemSetting.preferences),
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get user settings:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    // 降级方案：返回默认设置而不是错误
    console.warn('Returning default settings due to database error');
    return NextResponse.json({
      theme: 'dark',
      notifications: {
        systemUpdates: true,
        workflowCompletion: true,
        workflowErrors: true,
        emailNotifications: true,
        emailFrequency: 'immediate',
        browserNotifications: true,
        doNotDisturb: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        soundEnabled: true,
        soundVolume: 50,
      },
      api: {
        cofly: { apiKey: '', baseUrl: 'https://api.cofly.com' },
        openai: { apiKey: '', baseUrl: 'https://api.openai.com/v1' },
        custom: { name: '', apiKey: '', baseUrl: '', headers: '' },
      },
      mcp: {
        enabledTools: ['file-system', 'database', 'email-sender', 'text-processor'],
        toolConfigs: {},
      },
      preferences: {
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        dateFormat: 'YYYY-MM-DD',
        sessionTimeout: 480, // 默认8小时
        autoLogout: true,
        sessionWarning: true,
        warningTime: 5, // 默认5分钟前提醒
      },
    });
  }
}

// PUT /api/users/[userId]/settings - 更新用户设置
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // 检查请求体是否存在
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }
    
    // 获取请求体文本并验证
    const bodyText = await request.text();
    if (!bodyText || bodyText.trim() === '') {
      console.error('Empty request body');
      return NextResponse.json(
        { error: 'Request body cannot be empty' },
        { status: 400 }
      );
    }
    
    // 解析JSON
    let updates;
    try {
      updates = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Request body:', bodyText);
      return NextResponse.json(
        { error: 'Invalid JSON format', details: parseError instanceof Error ? parseError.message : 'Unknown parse error' },
        { status: 400 }
      );
    }
    
    console.log('Updating settings for user:', userId);
    console.log('Updates received:', JSON.stringify(updates, null, 2));
    
    // 如果没有数据库连接，返回错误
    if (!process.env.DATABASE_URL) {
      console.error('No DATABASE_URL found');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // 构造更新数据
    const updateData: any = {};
    
    if (updates.theme) {
      updateData.theme = updates.theme;
    }
    
    if (updates.notifications) {
      updateData.notifications = JSON.stringify(updates.notifications);
    }
    
    if (updates.api) {
      updateData.apiConfigs = JSON.stringify(updates.api);
    }
    
    if (updates.mcp) {
      updateData.mcpSettings = JSON.stringify(updates.mcp);
    }
    
    if (updates.preferences) {
      // 获取现有的 preferences 并合并新的设置
      let existingPreferences = {};
      try {
        const existingSettings = await prisma.systemSetting.findUnique({
          where: { userId }
        });
        if (existingSettings && existingSettings.preferences) {
          existingPreferences = JSON.parse(existingSettings.preferences);
        }
      } catch (error) {
        console.warn('Failed to parse existing preferences:', error);
      }
      
      // 合并现有设置和新设置
      const mergedPreferences = {
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        dateFormat: 'YYYY-MM-DD',
        sessionTimeout: 480,
        autoLogout: true,
        sessionWarning: true,
        warningTime: 5,
        ...existingPreferences,
        ...updates.preferences
      };
      
      updateData.preferences = JSON.stringify(mergedPreferences);
    }

    console.log('Update data prepared:', JSON.stringify(updateData, null, 2));

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      console.log('User not found:', userId);
      return NextResponse.json(
        { error: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    console.log('User found, proceeding with settings update');
    // 更新用户设置
    const systemSetting = await prisma.systemSetting.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        theme: updates.theme || 'dark',
        notifications: JSON.stringify(updates.notifications || {
          systemUpdates: true,
          workflowCompletion: true,
          workflowErrors: true,
          emailNotifications: true,
          emailFrequency: 'immediate',
          browserNotifications: true,
          doNotDisturb: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          soundEnabled: true,
          soundVolume: 50,
        }),
        apiConfigs: JSON.stringify(updates.api || {
          cofly: { apiKey: '', baseUrl: 'https://api.cofly.com' },
          openai: { apiKey: '', baseUrl: 'https://api.openai.com/v1' },
          custom: { name: '', apiKey: '', baseUrl: '', headers: '' },
        }),
        mcpSettings: JSON.stringify(updates.mcp || {
          enabledTools: ['file-system', 'database', 'email-sender', 'text-processor'],
          toolConfigs: {},
        }),
        preferences: JSON.stringify(updates.preferences || {
          language: 'zh-CN',
          timezone: 'Asia/Shanghai',
          dateFormat: 'YYYY-MM-DD',
          sessionTimeout: 480, // 默认8小时
          autoLogout: true,
          sessionWarning: true,
          warningTime: 5, // 默认5分钟前提醒
        }),
      }
    });

    // 构造响应
    const settings = {
      theme: systemSetting.theme,
      notifications: JSON.parse(systemSetting.notifications),
      api: JSON.parse(systemSetting.apiConfigs),
      mcp: JSON.parse(systemSetting.mcpSettings),
      preferences: JSON.parse(systemSetting.preferences),
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update user settings:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to update user settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}