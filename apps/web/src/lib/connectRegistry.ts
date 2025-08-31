import { IConnectRegistry } from '@repo/common';

// 缓存连接注册表实例
let connectRegistry: IConnectRegistry | null = null;
let isInitializing = false;

/**
 * 获取连接注册表实例
 * 确保只初始化一次，并支持并发请求
 */
export async function getConnectRegistry(): Promise<IConnectRegistry> {
  // 如果已经有实例，直接返回
  if (connectRegistry) {
    return connectRegistry;
  }

  // 如果正在初始化，等待初始化完成
  if (isInitializing) {
    // 轮询等待初始化完成，最多等待10秒
    let attempts = 0;
    while (isInitializing && attempts < 100) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
      if (connectRegistry) {
        return connectRegistry;
      }
    }
    throw new Error('连接注册表初始化超时');
  }

  // 开始初始化
  isInitializing = true;
  
  try {
    console.log('🔄 Initializing connect registry...');
    
    // 动态导入连接加载器（仅在服务器端）
    const { initializeConnects } = await import('@repo/node-set');
    connectRegistry = await initializeConnects();
    
    console.log('✅ Connect registry initialized successfully');
    console.log(`📊 Loaded ${connectRegistry.getAllConnects().length} connects`);
    
    return connectRegistry;
  } catch (error) {
    console.error('❌ Failed to initialize connect registry:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * 重置连接注册表缓存
 * 主要用于测试或开发环境
 */
export function resetConnectRegistry(): void {
  connectRegistry = null;
  isInitializing = false;
  console.log('🔄 Connect registry cache reset');
}

/**
 * 预热连接注册表
 * 在应用启动时调用，避免首次请求时的初始化延迟
 */
export async function preloadConnectRegistry(): Promise<void> {
  try {
    await getConnectRegistry();
    console.log('🚀 Connect registry preloaded');
  } catch (error) {
    console.error('❌ Failed to preload connect registry:', error);
  }
}