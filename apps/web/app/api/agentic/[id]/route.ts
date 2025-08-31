import { NextRequest, NextResponse } from "next/server";
import { agentManager } from "@repo/engine";
import { initializeServer } from "@/lib/serverInit";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const agent = await agentManager.get(id);
    if(agent) {
        return NextResponse.json({
            success: true,
            data: agent
        });
    }

    return NextResponse.json({
        success: false,
        error: `Agent ${id} not found.`
    })
}