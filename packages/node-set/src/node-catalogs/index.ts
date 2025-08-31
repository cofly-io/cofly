import { ICatalog } from '@repo/common';
import { GeneralCatalog } from './general';
import { AICatalog } from './AI';
import { TriggerCatalog } from './trigger';
import { FlowCatalog } from './flow';
import { SocialCatalog } from './social';
import { DatabaseCatalog } from './database';
import { FilesCatalog } from './files';

// 导入其他分类文件...

/**
 * 节点分类定义
 */
export const NODE_CATEGORIES: ICatalog[] = [
    TriggerCatalog,
    AICatalog,
    GeneralCatalog,
    FlowCatalog,
    FilesCatalog,
    DatabaseCatalog,
    SocialCatalog
];


// 直接导出所有分类对象，如果前端或后端需要直接访问
export {
    TriggerCatalog,
    AICatalog,
    GeneralCatalog,
    FlowCatalog,
    FilesCatalog,
    DatabaseCatalog,
    SocialCatalog
};

const allCategories: Record<string, ICatalog> = {
    [TriggerCatalog.id]: TriggerCatalog,
    [AICatalog.id]: AICatalog,
    [GeneralCatalog.id]: GeneralCatalog,
    [FlowCatalog.id]: FlowCatalog,
    [FilesCatalog.id]: FilesCatalog,
    [DatabaseCatalog.id]: DatabaseCatalog,
    [SocialCatalog.id]: SocialCatalog,
};

export const getCatalogById = (id: string): ICatalog | undefined => {
    return allCategories[id];
};

export const getAllCatalogs = (): ICatalog[] => {
    return Object.values(allCategories);
};