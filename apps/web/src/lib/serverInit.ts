import { initializeContainers } from "@repo/services";
import { initializeNodes, initializeConnects } from "@repo/node-set";

declare global {
    var __isInitializing: boolean | false;
}

export async function initializeServer() {
    // start server initialize.
    if(globalThis.__isInitializing) {
        return;
    }

    globalThis.__isInitializing = true;

    console.log("Initializing server...");
    await initializeContainers();
    await initializeNodes();
    await initializeConnects();
}

if (typeof window === 'undefined') {
    // 延迟预加载，避免阻塞模块初始化
    setInterval(() => {
        initializeServer().catch(console.error);
    }, 100);
}