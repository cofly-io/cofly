export const PluginDef = {
    identifier: "IPluginLoader"
}

export interface PluginData {
    id: string;
    config?: any;
}

export interface PluginListOptions {
    limit?: number;
}

export interface IPluginLoader {
    get(id: string): Promise<PluginData | null | undefined>;
    list(opts?: PluginListOptions) : Promise<PluginData[] | null  | undefined>;
}