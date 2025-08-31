import { getAllCatalogs } from "./node-catalogs";

export * from './node-catalogs';
export * from "./nodes";
export * from './connects';
export * from './utils';

import * as nodes from "./nodes";
import * as connects from "./connects";
import { getNodeRegistry, getConnectRegistry, pluginManager } from "@repo/common";
import { importer } from "./utils/importer";

function isValidNodeClass(NodeClass: any): boolean {
    try {
        const instance = new NodeClass();
        return 'detail' in instance && 'node' in instance;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function isValidConnectClass(ConnectClass: any): boolean {
    try {
        const instance = new ConnectClass();
        return 'overview' in instance && 'detail' in instance && typeof instance.test === 'function';
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function initializeNodes() {

    const nodeRegistry = getNodeRegistry();
    for (const key in nodes) {
        const exportedItem = (nodes as any)[key];
        if (nodeRegistry.hasType(exportedItem)) {
            continue;
        }

        // 检查是否为类且包含 INode 标记
        if (typeof exportedItem === 'function' && isValidNodeClass(exportedItem)) {
            try {
                const node = nodeRegistry.registerNode(exportedItem);
            } catch (error) {
                console.error(`❌ Failed to register node ${key}:`, error);
            }
        }
    }

    const plugins = await pluginManager.mediator?.list() || [];

    for (const plugin of plugins) {
        const nodes = await importer.load(plugin.config.name);
        if (!nodes) continue;

        for (const key in nodes) {
            const exportedItem = (nodes as any)[key];
            if (nodeRegistry.hasType(exportedItem)) {
                continue;
            }

            // 检查是否为类且包含 INode 标记
            if (typeof exportedItem === 'function' && isValidNodeClass(exportedItem)) {
                try {
                    const node = nodeRegistry.registerNode(exportedItem);
                } catch (error) {
                    console.error(`❌ Failed to register node ${key}:`, error);
                }
            }
        }
    }

    console.log('🎉 Node registry initialized with', nodeRegistry.getAllNodes().length, 'nodes');

    getAllCatalogs().forEach(catalog => {
        nodeRegistry.registerCatalog(catalog);
    });

    console.log('🎉 Node catalogs initialized with', nodeRegistry.getAllCatalogs().length, 'catalogs');

    return nodeRegistry;
}

async function initializeConnects() {

    const connectRegistry = getConnectRegistry();

    for (const key in connects) {
        const exportedItem = (connects as any)[key];
        if(connectRegistry.hasType(exportedItem)) {
            continue;
        }

        // 检查是否为类且包含 IConnect 标记
        if (typeof exportedItem === 'function' && isValidConnectClass(exportedItem)) {
            try {
                const connectInstance = connectRegistry.registerConnect(exportedItem);
            } catch (error) {
                console.error(`❌ Failed to register connect ${key}:`, error);
            }
        }
    }

    const plugins = await pluginManager.mediator?.list() || [];

    for (const plugin of plugins) {
        const nodes = await importer.load(plugin.config.name);
        if (!nodes) continue;

        for (const key in nodes) {
            const exportedItem = (nodes as any)[key];
            if (connectRegistry.hasType(exportedItem)) {
                continue;
            }

            // 检查是否为类且包含 IConnect 标记
            if (typeof exportedItem === 'function' && isValidConnectClass(exportedItem)) {
                try {
                    const connect = connectRegistry.registerConnect(exportedItem);
                } catch (error) {
                    console.error(`❌ Failed to register connect ${key}:`, error);
                }
            }
        }
    }

    console.log('🎉 Connect registry initialized with', connectRegistry.getAllConnects().length, 'connects');

    return connectRegistry;
}

export { initializeNodes, initializeConnects };