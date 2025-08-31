import { Prisma, type SystemModelSetting } from "../schema";
import { prisma } from "../client";

export const systemModelSettingRepo = Prisma.defineExtension({
    name: "SystemModelSettingRepo",
    model: {
        systemModelSetting: {
            // 创建系统模型设置
            async createSystemModelSetting(data: {
                tabkey: string;
                tabDetails: string;
            }): Promise<SystemModelSetting> {
                try {
                    const systemModelSetting = await prisma.systemModelSetting.create({
                        data: {
                            tabkey: data.tabkey,
                            tabDetails: data.tabDetails,
                        },
                    });
                    return systemModelSetting;
                } catch (error) {
                    console.error('Error creating system model setting:', error);
                    throw error;
                }
            },
            // 根据tabkey获取系统模型设置
            async getSystemModelSettingByTabkey(tabkey: string): Promise<SystemModelSetting | null> {
                try {
                    const systemModelSetting = await prisma.systemModelSetting.findUnique({
                        where: {
                            tabkey: tabkey,
                        },
                    });
                    return systemModelSetting;
                } catch (error) {
                    console.error('Error getting system model setting by tabkey:', error);
                    throw error;
                }
            },
            // 获取所有系统模型设置
            async getAllSystemModelSettings(): Promise<SystemModelSetting[]> {
                try {
                    const systemModelSettings = await prisma.systemModelSetting.findMany({
                        orderBy: {
                            createdAt: 'desc',
                        },
                    });
                    return systemModelSettings;
                } catch (error) {
                    console.error('Error getting all system model settings:', error);
                    throw error;
                }
            },
            // 更新系统模型设置
            async updateSystemModelSetting(
                tabkey: string,
                data: {
                    tabDetails?: string;
                }
            ): Promise<SystemModelSetting> {
                try {
                    const systemModelSetting = await prisma.systemModelSetting.update({
                        where: {
                            tabkey: tabkey,
                        },
                        data: {
                            ...data,
                            updatedAt: new Date(),
                        },
                    });
                    return systemModelSetting;
                } catch (error) {
                    console.error('Error updating system model setting:', error);
                    throw error;
                }
            },
            // 删除系统模型设置
            async deleteSystemModelSetting(tabkey: string): Promise<SystemModelSetting> {
                try {
                    const systemModelSetting = await prisma.systemModelSetting.delete({
                        where: {
                            tabkey: tabkey,
                        },
                    });
                    return systemModelSetting;
                } catch (error) {
                    console.error('Error deleting system model setting:', error);
                    throw error;
                }
            },
            // 检查系统模型设置是否存在
            async systemModelSettingExists(tabkey: string): Promise<boolean> {
                try {
                    const count = await prisma.systemModelSetting.count({
                        where: {
                            tabkey: tabkey,
                        },
                    });
                    return count > 0;
                } catch (error) {
                    console.error('Error checking system model setting existence:', error);
                    throw error;
                }
            },
            // 创建或更新系统模型设置（upsert操作）
            async upsertSystemModelSetting(data: {
                tabkey: string;
                tabDetails: string;
            }): Promise<SystemModelSetting> {
                try {
                    const systemModelSetting = await prisma.systemModelSetting.upsert({
                        where: {
                            tabkey: data.tabkey,
                        },
                        update: {
                            tabDetails: data.tabDetails,
                            updatedAt: new Date(),
                        },
                        create: {
                            tabkey: data.tabkey,
                            tabDetails: data.tabDetails,
                        },
                    });
                    return systemModelSetting;
                } catch (error) {
                    console.error('Error upserting system model setting:', error);
                    throw error;
                }
            },
            // 批量创建系统模型设置
            async createManySystemModelSettings(data: {
                tabkey: string;
                tabDetails: string;
            }[]): Promise<{ count: number }> {
                try {
                    const result = await prisma.systemModelSetting.createMany({
                        data: data
                    });
                    return result;
                } catch (error) {
                    console.error('Error creating many system model settings:', error);
                    throw error;
                }
            },
            // 根据tabkey模式搜索系统模型设置
            async searchSystemModelSettingsByTabkey(pattern: string): Promise<SystemModelSetting[]> {
                try {
                    const systemModelSettings = await prisma.systemModelSetting.findMany({
                        where: {
                            tabkey: {
                                contains: pattern,
                            },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    });
                    return systemModelSettings;
                } catch (error) {
                    console.error('Error searching system model settings by tabkey:', error);
                    throw error;
                }
            },
            // 获取系统模型设置统计信息
            async getSystemModelSettingsStats(): Promise<{
                total: number;
                recentlyUpdated: number; // 最近24小时内更新的数量
            }> {
                try {
                    const total = await prisma.systemModelSetting.count();

                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);

                    const recentlyUpdated = await prisma.systemModelSetting.count({
                        where: {
                            updatedAt: {
                                gte: yesterday,
                            },
                        },
                    });

                    return {
                        total,
                        recentlyUpdated,
                    };
                } catch (error) {
                    console.error('Error getting system model settings stats:', error);
                    throw error;
                }
            },
            // 批量删除系统模型设置
            async deleteManySystemModelSettings(tabkeys: string[]): Promise<{ count: number }> {
                try {
                    const result = await prisma.systemModelSetting.deleteMany({
                        where: {
                            tabkey: {
                                in: tabkeys,
                            },
                        },
                    });
                    return result;
                } catch (error) {
                    console.error('Error deleting many system model settings:', error);
                    throw error;
                }
            },
            // 解析tabDetails JSON数据的辅助函数
            parseTabDetails(tabDetails: string): any {
                try {
                    return JSON.parse(tabDetails);
                } catch (error) {
                    console.error('Error parsing tabDetails JSON:', error);
                    return null;
                }
            },
            // 格式化tabDetails为JSON字符串的辅助函数
            stringifyTabDetails(data: any): string {
                try {
                    return JSON.stringify(data);
                } catch (error) {
                    console.error('Error stringifying tabDetails:', error);
                    return '{}';
                }
            }
        }
    }
})