import { IPluginLoader, PluginDef } from "@cofly-ai/interfaces";
import { BaseContainer } from "./BaseContainer";

class PluginManager extends BaseContainer<IPluginLoader>{
}

export const pluginManager = new PluginManager(PluginDef.identifier);