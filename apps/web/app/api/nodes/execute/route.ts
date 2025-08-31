import { NextResponse } from "next/server";
import { initializeNodes } from "@repo/node-set";

// POST /api/nodes/execute - 执行指定节点
export async function POST(request: Request) {
  // try {
  //   const { kind, params } = await request.json();
    
  //   if (!kind) {
  //     return NextResponse.json(
  //       { message: "请提供节点名称" },
  //       { status: 400 }
  //     );
  //   }
    
    // const nodeRegistry = await initializeNodes();
    // const node = nodeRegistry.getNodeByKind(kind);
    
    // if (!node) {
    //   return NextResponse.json(
    //     { message: `未找到名为 "${kind}" 的节点` },
    //     { status: 404 }
    //   );
    // }
    
    //执行节点
  //   const result = node?.execute ? await node.execute({ params }) : null;

  //   if (result === null) {
  //     return NextResponse.json(
  //       { message: `节点 "${kind}" 不支持执行或执行方法未定义` },
  //       { status: 400 }
  //     );
  //   }
    
  //   return NextResponse.json({ result });
  // } catch (error) {
  //   console.error("执行节点失败:", error);
  //   return NextResponse.json(
  //     { message: "执行节点失败", error: (error as Error).message },
  //     { status: 500 }
  //   );
  // }
}


// 如果你需要获取特定节点的详细信息，可以添加一个额外的 API 路由：
// import { NextResponse } from "next/server";
// import { initializeNodes } from "@repo/nodes";

// // GET /api/nodes/[name] - 获取特定节点的详细信息
// export async function GET(
//   request: Request,
//   { params }: { params: { name: string } }
// ) {
//   try {
//     const nodeName = params.name;
    
//     const nodeRegistry = await initializeNodes();
//     const node = nodeRegistry.getNodeByName(nodeName);
    
//     if (!node) {
//       return NextResponse.json(
//         { message: `未找到名为 "${nodeName}" 的节点` },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json({ node: node.description });
//   } catch (error) {
//     console.error("获取节点详情失败:", error);
//     return NextResponse.json(
//       { message: "获取节点详情失败" },
//       { status: 500 }
//     );
//   }
// }