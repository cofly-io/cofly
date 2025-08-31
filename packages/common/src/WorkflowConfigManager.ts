import { IWorkflowLoader, WorkflowDef } from "@cofly-ai/interfaces";
import { BaseContainer } from "./BaseContainer";

class WorkflowConfigManager extends BaseContainer<IWorkflowLoader>{
}

export const workflowConfigManager = new WorkflowConfigManager(WorkflowDef.identifier);