import triggerData from "./WorkflowTrigger.json"
import schedulerData from "./WorkflowScheduler.json"

export * from "./client"
export * from "./workflow"
export * from "./agentic"
export * from "./eventhub"
export * from "./FunctionManager"
export * from "./ActionManager"
export * from "./McpManager"
export * from "./AgentInterfaces"
export * from "./AgentManager"
export * from "./WorkflowRegister"
export * from "./WorkflowMediator"
export * from "./EventMediator"

export const triggerConfig = {
    ...triggerData
}

export const schedulerConfig = {
    ...schedulerData
}