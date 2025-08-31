import { NextRequest, NextResponse } from 'next/server'
import { EventMediator } from "@repo/engine";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ eventId: string, step: string }> }
) {
    const { eventId, step } = await params;
    const includeOutput = req.nextUrl.searchParams.get('includeOutput') === 'false' ? false : true;

    if (!eventId || !step) {
        return NextResponse.json({
            success: false,
            error: '缺少必填参数: eventId or step'
        }, {
            status: 400
        });
    }

    try {
        const result = await EventMediator.getEventStepTrace(eventId, step, includeOutput);

        return NextResponse.json({
            success: result !== undefined,
            data: result
        }, {
            status: 200
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        }, {
            status: 500
        });
    }
}