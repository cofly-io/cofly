import { NextRequest } from "next/server";
import { workflowRegister } from "@repo/engine"
import { initializeServer } from "@/lib/serverInit";

initializeServer().catch(console.error);

export async function GET(expectedReq: NextRequest, res: unknown){
    return await workflowRegister().GET(expectedReq, res);
}

export async function POST(expectedReq: NextRequest, res: unknown){
    return await workflowRegister().POST(expectedReq, res);
}

export async function PUT(expectedReq: NextRequest, res: unknown){
    return await workflowRegister().PUT(expectedReq, res);
}