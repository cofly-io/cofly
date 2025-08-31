import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)

export class importer {
    static async load(pluginName: string): Promise<any> {
        try {
            let plugin: any;

            try {
                // 首先尝试直接 require（适用于已安装的包）
                plugin = require(pluginName)
                return plugin
            } catch (directError) {
                // 如果直接 require 失败，尝试从全局路径加载
                const globalPaths = [
                    // 环境变量 NODE_PATH
                    ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter).map(p => path.join(p, pluginName)) : []),
                    // 常见的全局路径
                    path.join('/usr/local/lib/node_modules', pluginName),
                    path.join(process.env.HOME || '', '.nvm/versions/node', process.version, 'lib/node_modules', pluginName)
                ];

                for (const globalPath of globalPaths) {
                    try {
                        // 尝试 require
                        plugin = require(globalPath)
                        return plugin
                    } catch (requireError) {
                        // 在服务器端环境中尝试动态导入
                        if (typeof window === 'undefined') {
                            // 尝试直接导入具体的 index.mjs 文件
                            const mjsPath = `file://${globalPath}/dist/index.mjs`
                            try {
                                // 使用 Function 构造函数来避免 webpack 静态分析
                                const dynamicImport = new Function('path', 'return import(path)');
                                plugin = await dynamicImport(mjsPath)
                                return plugin
                            } catch (mjsImportError) {
                                // 尝试 index.js 文件
                                const jsPath = `file://${globalPath}/dist/index.js`
                                try {
                                    const dynamicImport = new Function('path', 'return import(path)');
                                    plugin = await dynamicImport(jsPath)
                                    return plugin
                                } catch (jsImportError) {
                                    // 继续尝试下一个路径
                                    continue
                                }
                            }
                        }
                    }
                }

                // 如果所有路径都失败，抛出原始错误
                throw directError
            }

        } catch (error) {
            // 只在开发环境显示详细错误信息
            if (process.env.NODE_ENV === 'development') {
                console.error(`导入包 ${pluginName} 失败:`, error)
            } else {
                console.warn(`插件 ${pluginName} 加载失败，已跳过`)
            }
            return null
        }
    }
}