import { inngest } from './client';
import { functionManager } from './FunctionManager';
import { serve, RequestHandler } from 'inngest/next';
import { workflowTrigger } from "./WorkflowTrigger";
import { workflowScheduler } from "./WorkflowScheduler";
import { agentTrigger } from "./AgentTrigger";

functionManager.set(workflowTrigger.name, workflowTrigger);
functionManager.set(workflowScheduler.name, workflowScheduler);
functionManager.set(agentTrigger.name, agentTrigger);

const cache : {
    handler?: RequestHandler & {
        GET: RequestHandler;
        POST: RequestHandler;
        PUT: RequestHandler;
    };
    version: number;
} = {
    version: 0
};

export const workflowRegister = (): RequestHandler & {
    GET: RequestHandler;
    POST: RequestHandler;
    PUT: RequestHandler;
} => {

    if(!cache.handler || cache.version != functionManager.version) {
        cache.handler = serve({ client: inngest, functions: functionManager.functions})
        cache.version = functionManager.version
        console.log("Inngest workflowRegister loaded.");
    }

    return cache.handler;
}