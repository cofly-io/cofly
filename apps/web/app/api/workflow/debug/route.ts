import { NextRequest, NextResponse } from "next/server";
import { triggerConfig, Workflow, WorkflowEdge } from "@repo/engine";
import { EventMediator, getEventHubManager } from "@repo/engine"
import { getNodeRegistry } from "@repo/common";

export async function POST(req: NextRequest){
    try {
        const data = await req.json() as unknown as Workflow;
        if(!data || !data.actions ||  data.actions.length == 0 ) {
            return NextResponse.json({
                error: "Invalid workflow data"
            }, { status: 400 });
        }

        const registry = getNodeRegistry();

        if(data.actions[0] && registry.getNodeByKind(data.actions[0]?.kind)?.node.nodeMode == 'webhook') {

            const flowId = req.nextUrl.searchParams.get("workflowID");
            if(!flowId) {
                return NextResponse.json(
                    { error: 'Missing required parameter: Workflow ID' },
                    { status: 400 }
                );
            }
            const apiEventManager = getEventHubManager();

            // 创建hook请求
            const hookRequest = {
                id: flowId,
                remote: req.referrer,
                method: data.actions[0].inputs?.method || "POST",
                timestamp: Date.now()
            };

            // 等待响应数据
            const responseData = await apiEventManager.createHook(hookRequest);
            return NextResponse.json({
                success: true,
                data: responseData.data,
                requestId: responseData.id,
                timestamp: responseData.timestamp
            });
        } else {
            if ((data.actions && data.actions.length == 1 && data.actions[0]) && (data.edges && data.edges.length == 0)) {
                data.edges.push({
                    from: "$source",
                    to: data.actions[0].id
                } as WorkflowEdge)
            }

            const json = await EventMediator.sendEvent(triggerConfig.event, data, (req.nextUrl.searchParams.get("waitOutput") as string)?.toLowerCase() === 'true');
            return NextResponse.json(json);
        }
    } catch (error) {
        return NextResponse.json(
            { 
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }, 
            { status: 500 }
        );
    }
}