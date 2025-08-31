import { NextRequest, NextResponse } from "next/server"
import { EventMediator, triggerConfig, WorkflowAction } from "@repo/engine";
import { INodeWebhook, IWebhookMessage, workflowConfigManager } from "@repo/common";

async function handler(req: NextRequest) {

    const id = req.nextUrl.pathname.split("/")[2];
    if (!id) {
        return NextResponse.json(
            { error: 'Missing required parameter: Workflow ID' },
            { status: 400 }
        );
    }

    const workflow = await workflowConfigManager.mediator?.get(id);
    if(!workflow) {
        return NextResponse.json(
            { error: `Workflow not found: ${id}` },
            { status: 400 }
        );
    }

    const webhook = workflow.config.actions.filter((item: WorkflowAction) => item.node?.node?.nodeMode == 'webhook').pop() as WorkflowAction;
    if(!webhook) {
        return NextResponse.json(
            { error: 'Missing required action: Webhook' },
            { status: 400 }
        );
    }

    const webHookNode = webhook.node?.node as INodeWebhook;
    if(!webHookNode) {
        return NextResponse.json(
            { error: 'Missing required config: Webhook' },
            { status: 400 }
        );
    }

    if(webhook.inputs?.method && webhook.inputs?.method !== req.method) {
        return NextResponse.json(
            { error: `Request method cannot be match with workflow: ${workflow.config.name}#${id}` },
            { status: 400 }
        );
    }

    const isJson = req.headers.get("content-type") == "application/json";
    const body = ["GET", "DELETE"].includes(req.method.toUpperCase()) ? {} :
            isJson ? await req.json() : await req.text();

    if(!webhook.inputs) {
        webhook.inputs = {};
    }

    webhook.inputs.message = {
        workflowId: id,
        body: body,
        method: req.method,
        url: req.url,
        query: req.nextUrl.search
    } as IWebhookMessage;

    const waitOutput = webHookNode.respondData == 'workflow-result' && (webhook.inputs?.respondMode || 'onFinished') === 'onFinished';

    const runData = await EventMediator.sendEvent(triggerConfig.event, workflow.config, waitOutput);
    if(webHookNode.respondData == "node-result") {

        try {
            const result = await EventMediator.getEventStepTrace(runData.eventId, webhook.id, true, true);

            if(!result || !result.output) {
                throw new Error("Cannot found run data");
            }

            if(typeof result.output === "string") {
                return new Response(result.output, {
                    headers: {'Content-Type': 'text/plain'}
                })
            }

            return NextResponse.json(result.output);
        } catch(error) {
            console.error(error);
            return NextResponse.json({
                success: false,
                error: error
            })
        }
    } else {
        return NextResponse.json(runData);
    }
}

export {
    handler as POST,
    handler as GET,
    handler as PUT,
    handler as DELETE
}