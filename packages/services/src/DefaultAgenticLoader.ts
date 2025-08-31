import { IAgenticLoader, AgenticData, AgenticListOptions, ModelSeries, AgentAbilities, McpReference, WorkflowReference, ConnectReference } from "@repo/common";
import { prisma, AiAgent } from "@repo/database";

export class DefaultAgenticLoader implements IAgenticLoader {

    parseAbilities(info: string | null | undefined) : AgentAbilities | undefined {
        if(!info) {
            return undefined;
        }
        try {
            const abilities = JSON.parse(info) as unknown as AgentAbilities;
            if(abilities) {
                return abilities;
            }
            return undefined;
        } catch(err) {
            console.error(err);
            return undefined;
        }
    }

    async parseConfig(record: AiAgent, includeRelation?: boolean | false) : Promise<AgenticData> {
        const agent = {
            ...record,
            id: record.id,
            systemMessage: record.prompt,
            abilities: this.parseAbilities(record.agentinfo),
            mcpServers: [],
            workflows: [],
            connects: []
        } as AgenticData;

        if(includeRelation === true) {

            const connect = await prisma.connectConfig.findUnique({
                where: { id: record.connectid }
            });

            if(connect) {
                const configData : { apiKey: string, baseUrl: string, driver: string } = JSON.parse(connect.configinfo);
                agent.chatModel = {
                    baseUrl: configData.baseUrl,
                    apiKey: configData.apiKey,
                    model: record.modelId,
                    series: configData.driver as ModelSeries,
                    toolMode: agent.abilities?.toolMode,
                }
            }

            // load agent mcps
            const mcps = await prisma.agentMcp.findMany({
                where : {
                    agentId: agent.id,
                },
                select : {
                    mcp: {
                        select: {
                            'id': true, 'name': true
                        }
                    }
                }
            })??[];
            agent.mcpServers?.push(...mcps?.flatMap((item) => ({
                id: item.mcp.id,
                name: item.mcp.name,
            }) as McpReference));

            // load agent workflows
            const workflows = await prisma.agentWorkflow.findMany({
                where : {
                    agentId: agent.id
                },
                select : {
                    workflow: {
                        select: {
                            'id':true, 'name':true
                        }
                    }
                }
            });
            agent.workflows?.push(...workflows?.flatMap((item) => ({
                id: item.workflow.id,
                name: item.workflow.name,
            }) as WorkflowReference));

            // load agent connects
            const connects = await prisma.agentConnect.findMany({
                where : {
                    agentId: agent.id
                },
                select : {
                    connect: {
                        select: {
                            'id':true, 'name':true, 'ctype':true, 'mtype':true
                        }
                    }
                }
            });
            agent.connects?.push(...connects?.flatMap((item) => ({
                id: item.connect.id,
                name: item.connect.name,
                provider: item.connect.ctype,
                kind: item.connect.mtype
            }) as ConnectReference));
        }

        return agent;
    }

    async get(id: string, includeRelation?: boolean | false): Promise<AgenticData | undefined> {
        const record = await prisma.aiAgent.findUnique({
            where: { id: id },
        });
        if(!record) {
            return undefined;
        }

        return await this.parseConfig(record, includeRelation);
    }

    async list(opts?: AgenticListOptions): Promise<AgenticData[] | undefined> {
        const configs : AgenticData[] = [];
        const records = await prisma.aiAgent.findMany();
        for(const record of records) {
            configs.push(await this.parseConfig(record, opts?.includeRelation));
        }
        return configs;
    }
}