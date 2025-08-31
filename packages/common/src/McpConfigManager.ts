import { IMcpLoader, McpDef } from "./McpInterfaces";
import { BaseContainer } from "./BaseContainer";

class McpConfigManager extends BaseContainer<IMcpLoader>{
}

export const mcpConfigManager = new McpConfigManager(McpDef.identifier);