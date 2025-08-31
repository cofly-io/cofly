import { NextRequest, NextResponse } from 'next/server';
import { AgentInvokeOptions, TextMessage, agentManager } from '@repo/engine';
import { prisma } from '@repo/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tabkey, config, agentInvokeOpts } = body;
    let isAppend = false;
    // 如果提供了tabkey，获取连接配置并更新config
    if (tabkey) {
      const connectConfigResponse = await getConnectConfigData(tabkey);
      if (connectConfigResponse) {
        config.chatModel.apiKey = connectConfigResponse.apiKey;
        config.chatModel.baseUrl = connectConfigResponse.baseUrl;
        config.chatModel.series = connectConfigResponse.series;
        config.chatModel.model = connectConfigResponse.model;
        config.chatModel.series = connectConfigResponse.series;
        isAppend = connectConfigResponse.isAppend as boolean;
      }
    } else {
      return NextResponse.json({
        content: '你还未配置内置模型：请前往[系统]-[内置模型]进行配置',
      });
    }

    const invokeOptions: AgentInvokeOptions = {
      extSystemMessage: `\n remember:Rules and requirements must be followed strictly. Do not deviate from the rules.'
                         \n Don't return any descriptions and explanations of the rules, only return the content the user wants.`,
      input: agentInvokeOpts.input || '',
      // state: agentInvokeOpts.state || {},
      stream: false,
      threadId: agentInvokeOpts.threadId || '',
      userId: agentInvokeOpts.userId || '',
      persistentHistory: false,
      usingDefaultSystemMessage: false,
      waitOutput: agentInvokeOpts.waitOutput !== undefined ? agentInvokeOpts.waitOutput : true
    };

    invokeOptions.agentConfig = config;
    const result = (await agentManager.invoke(invokeOptions));

    // // 根据用户提供的数据结构，正确的路径是 result.runData[0][0].output[0].content
    if (result?.runData?.[0]?.[0]?.output?.[0]?.content) {
      const content = result.runData[0][0].output[0].content;
      return NextResponse.json({ content: content, isAppend: isAppend });
    }
    return NextResponse.json({
      content: '模型异常：针对你设置的模型，可创建agent进行对话测试。',
    });

    // return NextResponse.json({ message: result });
  } catch (error) {
    console.error('Agent run error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 模块级函数，不需要static关键字
async function getConnectConfigData(tabkey: string): Promise<any> {
  try {
    const systemModelSetting = await prisma.systemModelSetting.getSystemModelSettingByTabkey(tabkey);
    if (!systemModelSetting) {
      console.error('System model setting not found for tabkey:', tabkey);
      return null;
    }

    const systemModelSettingsData = prisma.systemModelSetting.parseTabDetails(systemModelSetting.tabDetails);
        if (!systemModelSettingsData) {
      console.error('Failed to parse system settings data');
      return null;
    }

    const connectId = systemModelSettingsData.connectid;

    //获取连接配置
    const connectConfig = await prisma.connectConfig.getConnectConfigById(connectId);

    if (!connectConfig) {
      console.error('Connect config not found for id:', connectId);
      return null;
    }

    const configData = JSON.parse(connectConfig.configinfo);
    const { driver, apiKey, baseUrl } = configData;

    return { series: driver, apiKey, baseUrl, model: systemModelSettingsData.model, isAppend: systemModelSettingsData.isAppend };
  } catch (error) {
    console.error('Connect config error:', error);
    return null;
  }
}