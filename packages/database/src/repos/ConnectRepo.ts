import { Prisma, type ConnectConfig } from "../schema";
import { prisma } from "../client";

export const connectRepo = Prisma.defineExtension({
    name: "ConnectRepo",
    model: {
        connectConfig: {
            // 创建连接配置
            async createConnectConfig(data: {
                name: string;
                ctype: string;
                mtype?: string;
                configinfo: string;
                creator?: string;
            }): Promise<ConnectConfig> {
                try {
                    const connectConfig = await prisma.connectConfig.create({
                        data: {
                            name: data.name,
                            ctype: data.ctype,
                            mtype: data.mtype,
                            configinfo: data.configinfo,
                            creator: data.creator,
                        },
                    });
                    return connectConfig;
                } catch (error) {
                    console.error('Error creating connect config:', error);
                    throw error;
                }
            },
            // 根据ID获取连接配置
            async getConnectConfigById(id: string): Promise<ConnectConfig | null> {
                try {
                    const connectConfig = await prisma.connectConfig.findUnique({
                        where: {
                            id: id,
                        },
                        include: {
                            agentRefs: true,
                            agents: true,
                        },
                    });
                    return connectConfig;
                } catch (error) {
                    console.error('Error getting connect config by id:', error);
                    throw error;
                }
            },
            // 获取所有连接配置
            async getAllConnectConfigs(): Promise<ConnectConfig[]> {
                try {
                    const connectConfigs = await prisma.connectConfig.findMany({
                        orderBy: {
                            createdtime: 'desc',
                        },
                        include: {
                            agentRefs: true,
                            agents: true,
                        },
                    });
                    return connectConfigs;
                } catch (error) {
                    console.error('Error getting all connect configs:', error);
                    throw error;
                }
            },
            // 根据类型获取连接配置
            async getConnectConfigsByType(ctype: string, mtype?: string): Promise<ConnectConfig[]> {
                try {
                    const where: any = {
                        ctype: ctype,
                    };

                    if (mtype) {
                        where.mtype = mtype;
                    }

                    const connectConfigs = await prisma.connectConfig.findMany({
                        where: where,
                        orderBy: {
                            createdtime: 'desc',
                        },
                    });
                    return connectConfigs;
                } catch (error) {
                    console.error('Error getting connect configs by type:', error);
                    throw error;
                }
            },
            // 根据创建者获取连接配置
            async getConnectConfigsByCreator(creator: string): Promise<ConnectConfig[]> {
                try {
                    const connectConfigs = await prisma.connectConfig.findMany({
                        where: {
                            creator: creator,
                        },
                        orderBy: {
                            createdtime: 'desc',
                        },
                    });
                    return connectConfigs;
                } catch (error) {
                    console.error('Error getting connect configs by creator:', error);
                    throw error;
                }
            },
            // 更新连接配置
            async updateConnectConfig(
                id: string,
                data: {
                    name?: string;
                    ctype?: string;
                    mtype?: string;
                    configinfo?: string;
                    creator?: string;
                }
            ): Promise<ConnectConfig> {
                try {
                    const connectConfig = await prisma.connectConfig.update({
                        where: {
                            id: id,
                        },
                        data: {
                            ...data,
                            updatedtime: new Date(),
                        },
                    });
                    return connectConfig;
                } catch (error) {
                    console.error('Error updating connect config:', error);
                    throw error;
                }
            },
            // 删除连接配置
            async deleteConnectConfig(id: string): Promise<ConnectConfig> {
                try {
                    const connectConfig = await prisma.connectConfig.delete({
                        where: {
                            id: id,
                        },
                    });
                    return connectConfig;
                } catch (error) {
                    console.error('Error deleting connect config:', error);
                    throw error;
                }
            },
            // 检查连接配置是否存在
            async connectConfigExists(id: string): Promise<boolean> {
                try {
                    const count = await prisma.connectConfig.count({
                        where: {
                            id: id,
                        },
                    });
                    return count > 0;
                } catch (error) {
                    console.error('Error checking connect config existence:', error);
                    throw error;
                }
            },
            // 根据名称查找连接配置
            async getConnectConfigByName(name: string): Promise<ConnectConfig | null> {
                try {
                    const connectConfig = await prisma.connectConfig.findFirst({
                        where: {
                            name: name,
                        },
                    });
                    return connectConfig;
                } catch (error) {
                    console.error('Error getting connect config by name:', error);
                    throw error;
                }
            },
            // 批量创建连接配置
            async createManyConnectConfigs(data: {
                name: string;
                ctype: string;
                mtype?: string;
                configinfo: string;
                creator?: string;
            }[]): Promise<{ count: number }> {
                try {
                    const result = await prisma.connectConfig.createMany({
                        data: data,
                    });
                    return result;
                } catch (error) {
                    console.error('Error creating many connect configs:', error);
                    throw error;
                }
            }
        }
    }
})
