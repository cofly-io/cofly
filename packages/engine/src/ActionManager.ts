import { getNodeRegistry, IEnumeratorData, IExecuteResult, INode, StatusType } from '@repo/common';
import { Engine, EngineAction } from "./workflow";
import { WorkflowActionEvent, WorkflowMediator } from "./WorkflowMediator";

class ActionManager {
    readonly #actions: EngineAction[];
    #isLoaded : boolean = false;
    #version : number = 0;

    get actions(): EngineAction[] {
        return [...this.#actions];
    }

    get version(): number {
        return this.#version;
    }

    constructor() {
        this.#actions = [];
    }

    add(action: EngineAction) {
        this.#actions.push(action);
        this.#version = Date.now();
        return this;
    }

    isExecuteResult(result: any) : result is IExecuteResult {
        if(result === null || result === undefined || typeof result !== 'object') {
            return false;
        }

        return 'data' in result && 'status' in result;
    }

    async initialize() {
        if(this.#isLoaded) {
            return;
        }

        const registry = getNodeRegistry();
        const nodes = registry.getAllNodes();
        nodes.forEach((node: INode) => {
            this.add({
                kind: node.node.kind,
                name: node.node.name,
                description: node.node.description,
                handler: async ({event, step, workflow, workflowAction, state, publish}) => {

                    const subflow = workflow.subflows ? workflow.subflows[workflowAction.id] : null;
                    if(subflow) {
                        const result : Record<string, any> = {};
                        const engine = new Engine({ actions: actionManager.actions });

                        if(node.node.executeMode === 'each') {

                            let enumerator = await step.run(workflowAction.id, async () => {
                                return node.first?.({
                                    id: workflowAction.id,
                                    name: workflowAction.name,
                                    kind: workflowAction.kind,
                                    description: workflowAction.description,
                                    inputs: workflowAction.inputs,
                                    state: state
                                });
                            }) as IEnumeratorData;

                            state.set(workflowAction.id, { ...enumerator })

                            await engine.run({event, step, workflow: subflow, state, publish});

                            while(!enumerator.eof) {
                                const index = enumerator.current??0;

                                enumerator = await step.run(workflowAction.id, async () => {
                                    return node.next?.({
                                        id: workflowAction.id,
                                        name: workflowAction.name,
                                        kind: workflowAction.kind,
                                        description: workflowAction.description,
                                        inputs: workflowAction.inputs,
                                        state: state,
                                        index: index + 1
                                    }) as unknown as IEnumeratorData;
                                });

                                if(!enumerator?.data) {
                                    break;
                                }
                                state.set(workflowAction.id, { ...enumerator });
                                await engine.run({event, step, workflow: subflow, state, publish});
                            }
                        }

                        return {
                            data: result,
                            status: 'COMPLETED'
                        };
                    } else {

                        const actionEvent : WorkflowActionEvent | undefined = publish ? {
                            name: workflowAction.id,
                            type: 'action',
                            status: 'RUNNING',
                            startedAt: Date.now(),
                            input: workflowAction.inputs
                        } : undefined;

                        if(publish) {
                            await WorkflowMediator.publish(publish, event.id, actionEvent);
                        }

                        await step.run(`${workflowAction.id}:start`, async() => {
                            return workflowAction.inputs;
                        });

                        let resultData: any;

                        if(node.node.stepMode === 'nested') {
                            const nodeResult = await node.execute?.({
                                id: workflowAction.id,
                                name: workflowAction.name,
                                kind: workflowAction.kind,
                                description: workflowAction.description,
                                inputs: workflowAction.inputs,
                                state: state,
                                step: step,
                            });

                            resultData = await step.run(workflowAction.id, async() => {
                                return this.isExecuteResult(nodeResult) ? nodeResult.data : nodeResult;
                            });
                        } else {
                            resultData = await step.run(workflowAction.id, async () => {
                               return node.execute?.({
                                    id: workflowAction.id,
                                    name: workflowAction.name,
                                    kind: workflowAction.kind,
                                    description: workflowAction.description,
                                    inputs: workflowAction.inputs,
                                    state: state,
                                    step: step,
                                });
                            });
                        }

                        const output = this.isExecuteResult(resultData) ?
                            resultData as IExecuteResult :
                            {
                                data: resultData,
                                status: 'COMPLETED'
                            } as IExecuteResult;

                        if(publish && actionEvent) {

                            actionEvent.status = 'COMPLETED';
                            actionEvent.endedAt = Date.now();
                            actionEvent.output = output;

                            await WorkflowMediator.publish(publish, event.id, actionEvent);
                        }

                        return output;
                    }
                }
            });
        })

        console.log('🎉 Action registry initialized with', nodes.length, 'actions');

        this.#isLoaded = true;
    }
}

export const actionManager = new ActionManager();