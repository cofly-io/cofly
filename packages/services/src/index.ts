import {
    agenticConfigManager, agenticThreadManager,
    credentialManager,
    mcpConfigManager,
    pluginManager,
    teamManager,
    workflowConfigManager
} from "@repo/common";
import { DefaultCredentialLoader } from "@/DefaultCredentialLoader";
import { DefaultWorkflowLoader } from "@/DefaultWorkflowLoader";
import { DefaultMcpLoader } from "@/DefaultMcpLoader";
import { DefaultPluginLoader } from "@/DefaultPluginLoader";
import { DefaultTeamLoader } from "@/DefaultTeamLoader";
import { DefaultAgenticLoader } from "@/DefaultAgenticLoader";
import { DefaultAgentThreadLoader } from "@/DefaultAgentThreadLoader";

declare global {
    var __containerInited: boolean | false;
    var __isInitializing: boolean | false;
}

export async function initializeContainers() {
    if(globalThis.__containerInited) {
        return;
    }

    credentialManager.bind(DefaultCredentialLoader);
    workflowConfigManager.bind(DefaultWorkflowLoader);
    mcpConfigManager.bind(DefaultMcpLoader);
    pluginManager.bind(DefaultPluginLoader);
    teamManager.bind(DefaultTeamLoader);
    agenticConfigManager.bind(DefaultAgenticLoader);
    agenticThreadManager.bind(DefaultAgentThreadLoader);

    globalThis.__containerInited = true;
}