import { IAgenticLoader, AgenticDef } from "./AgenticInterfaces";
import { BaseContainer } from "./BaseContainer";

class AgenticConfigManager extends BaseContainer<IAgenticLoader>{
}

export const agenticConfigManager = new AgenticConfigManager(AgenticDef.identifier);