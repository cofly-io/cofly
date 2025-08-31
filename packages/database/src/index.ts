export * from "./schema";
export * from "./repos/UserRepo";
export * from "./repos/WorkflowRepo";
export * from "./repos/ConnectRepo";
export * from "./repos/SystemModelSettingRepo";
export * from "./repos/KbDocumentChunkRepo";
export * from "./repos/KbDocumentRepo";
export * from "./repos/KbProcessingStatusRepo";

import { userRepo } from "./repos/UserRepo";
import { workflowRepo } from "./repos/WorkflowRepo";
import { connectRepo } from "./repos/ConnectRepo";
import { systemModelSettingRepo } from "./repos/SystemModelSettingRepo";
import { kbDocumentChunkRepo } from "./repos/KbDocumentChunkRepo";
import { kbDocumentRepo } from "./repos/KbDocumentRepo";
import { kbProcessingStatusRepo } from "./repos/KbProcessingStatusRepo";
import { prisma } from "./client";

const prismax = prisma
    .$extends(userRepo)
    .$extends(workflowRepo)
    .$extends(connectRepo)
    .$extends(systemModelSettingRepo)
    .$extends(kbDocumentChunkRepo)
    .$extends(kbDocumentRepo)
    .$extends(kbProcessingStatusRepo);

export { prismax as prisma }
