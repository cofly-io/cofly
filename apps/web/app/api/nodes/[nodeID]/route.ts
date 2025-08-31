import { NextResponse } from "next/server";
import { initializeNodes } from "@repo/node-set";
import { initializeServer } from "@/lib/serverInit";

// GET /api/nodes/[nodeID] - 获取特定节点的详细信息
export async function GET(
  request: Request,
  { params }: { params: Promise<{ nodeID: string }> }
) {
  try {
    const { nodeID: kind } = await params;
    console.log('params', kind);
    
    // 确保服务器已初始化
    await initializeServer();
    
    const nodeRegistry = await initializeNodes();
    const node = nodeRegistry.getNodeByKind(kind);
    
    if (!node) {
      return NextResponse.json(
        { message: `未找到kind为 "${kind}" 的节点` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      node: {
        ...node.detail,
        // 将基本信息合并到返回数据中，确保包含 catalog 等信息
        kind: node.node.kind,
        catalog: node.node.catalog,
        icon: node.node.icon,
        name: node.node.name,
        description: node.node.description,
        version: node.node.version,
        link: node.node.link,
        nodeWidth: node.node.nodeWidth,
        stepMode: node.node.stepMode,
        nodeMode: node.node.nodeMode,
        executeMode: node.node.executeMode
      }
    });
  } catch (error) {
    console.error("获取节点详情失败:", error);
    return NextResponse.json(
      { message: "获取节点详情失败" },
      { status: 500 }
    );
  }
}