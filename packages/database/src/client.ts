import { PrismaClient, Prisma } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate'
import { join } from "path";

// 获取数据库文件的绝对路径
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // 从当前包目录构建数据库文件路径
  const dbPath = join(__dirname, "..", "prisma", "database.db");
  return `file:${dbPath}`;
};

/**
 * 简单的版本计数器
 * 在内存中追踪每个模型的变化次数
 */
class VersionCounter {
    private versions = new Map<string, number>()

    /**
     * 递增模型版本号
     */
    increment(modelName: string): number {
        const currentVersion = this.versions.get(modelName) || 0
        const newVersion = currentVersion + 1
        this.versions.set(modelName, newVersion)
        return newVersion
    }

    /**
     * 获取模型当前版本号
     */
    getVersion(modelName: string): number {
        return this.versions.get(modelName) || 0
    }

    /**
     * 重置指定模型版本
     */
    reset(modelName: string): void {
        this.versions.delete(modelName)
    }

    /**
     * 重置所有版本
     */
    resetAll(): void {
        this.versions.clear()
    }

    /**
     * 获取所有模型版本
     */
    getAllVersions(): Record<string, number> {
        return Object.fromEntries(this.versions)
    }
}

function getTableName() {
    return Prisma.defineExtension({
        name: 'getTableName',
        model: {
            // 为所有模型添加 getTableName 方法
            $allModels: {
                getTableName<T>(this: T) {
                    // 获取当前模型名（如 "User"）
                    const modelName = (this as any).$name as string;
                    // 访问 DMMF 元数据
                    const dmmf = (prisma as any)._dmmf;
                    // 查找模型定义
                    const model = dmmf.modelMap[modelName];
                    // 返回映射的表名（若未定义 @@map，则返回模型名的小写形式）
                    return model?.dbName || modelName.toLowerCase();
                },
            },
        },
    });
}

// 全局版本计数器实例
const versionCounter = new VersionCounter()

/**
 * Prisma扩展：简化版本感知
 */
function versionExtension() {
    return Prisma.defineExtension({
        name: 'version-tracker',
        model: {
            $allModels: {
                /**
                 * 获取模型当前版本号
                 */
                getVersion<T>(this: T): number {
                    const context = Prisma.getExtensionContext(this)
                    return versionCounter.getVersion(context.$name || 'unknown')
                }
            }
        },

        query: {
            $allModels: {
                async create({ args, query, model }) {
                    const result = await query(args)
                    versionCounter.increment(model)
                    return result
                },

                async createMany({ args, query, model }) {
                    const result = await query(args)
                    versionCounter.increment(model)
                    return result
                },

                async update({ args, query, model }) {
                    const result = await query(args)
                    versionCounter.increment(model)
                    return result
                },

                async updateMany({ args, query, model }) {
                    const result = await query(args)
                    versionCounter.increment(model)
                    return result
                },

                async upsert({ args, query, model }) {
                    const result = await query(args)
                    versionCounter.increment(model)
                    return result
                },

                async delete({ args, query, model }) {
                    const result = await query(args)
                    versionCounter.increment(model)
                    return result
                },

                async deleteMany({ args, query, model }) {
                    const result = await query(args)
                    versionCounter.increment(model)
                    return result
                }
            }
        }
    })
}

// Create a single instance of Prisma Client
const prisma = new PrismaClient({
  log: process.env.DB_LOG_LEVEL === "all" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
});

const prismax = prisma
    .$extends(withAccelerate())
    .$extends(getTableName())
    .$extends(versionExtension());

export { prismax as prisma };
