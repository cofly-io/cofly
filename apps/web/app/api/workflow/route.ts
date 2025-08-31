import { NextRequest, NextResponse } from "next/server";
import { inngest, triggerConfig } from "@repo/engine";
import { prisma } from "@repo/database";

export async function GET(req: NextRequest){
    const id = req.nextUrl.searchParams.get("id") as string;
    if (!id) {
        return NextResponse.json(
            { error: 'Missing required parameter: Workflow ID' },
            { status: 400 }
        );
    }

    const workflow = await prisma.workflowConfig.getWorkflowEngineConfigById(id);

    const result = await inngest.send({ name: triggerConfig.event, data: workflow })

    return NextResponse.json({
        eventId: result?.ids?.length > 0 ? result.ids[0] as string : undefined,
    });
}