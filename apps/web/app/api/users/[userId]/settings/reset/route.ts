import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// POST /api/users/[userId]/settings/reset - 重置用户设置
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // 重置为默认设置
    const systemSetting = await prisma.systemSetting.upsert({
      where: { userId },
      update: {
        theme: 'dark',
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
        }),
      },
      create: {
        userId,
        theme: 'dark',
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
    console.error('Failed to reset user settings:', error);
    return NextResponse.json(
      { error: 'Failed to reset user settings' },
      { status: 500 }
    );
  }
}