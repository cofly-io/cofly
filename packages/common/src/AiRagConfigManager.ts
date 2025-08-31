import { IAiRagLoader, AiRagDef } from "./AiRagInterfaces";
import { BaseContainer } from "./BaseContainer";

class AiRagConfigManager extends BaseContainer<IAiRagLoader>{
}

export const aiRagConfigManager = new AiRagConfigManager(AiRagDef.identifier);