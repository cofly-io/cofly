import { IAgenticThreadLoader, AgenticThreadDef } from "./AgenticInterfaces";
import { BaseContainer } from "./BaseContainer";

class AgenticThreadManager extends BaseContainer<IAgenticThreadLoader>{
}

export const agenticThreadManager = new AgenticThreadManager(AgenticThreadDef.identifier);