import { ExperimentalEmptyAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { AguiAgent, AguiRuntime } from '@/protocols/AguiAdapters';
import { agentManager } from "@repo/engine";
import { initializeServer } from "@/lib/serverInit";
import { prisma } from "@repo/database";

declare global {
    var __handleRequest : any | undefined;
    var __agentsChecksum : number | undefined;
}

export const POST = async (req: NextRequest) => {

    await initializeServer();

    const checksum : number = prisma.aiAgent.getVersion();

    if(!globalThis.__handleRequest || globalThis.__agentsChecksum !== checksum) {
        const serviceAdapter = new ExperimentalEmptyAdapter();
        const runtime = new AguiRuntime({
            agents: (await agentManager.agents()).reduce((acc, agent) => {
                if(agent && agent.id) {
                    acc[agent.id] = new AguiAgent(agent);
                }
                return acc;
            }, {} as Record<string, AguiAgent>)
        });

        globalThis.__handleRequest = copilotRuntimeNextJSAppRouterEndpoint({
            runtime,
            serviceAdapter,
            endpoint: "/api/ag-ui",
        }).handleRequest;

        globalThis.__agentsChecksum = checksum;
    }

    return globalThis.__handleRequest(req);
};