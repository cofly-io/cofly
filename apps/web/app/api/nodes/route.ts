import { NextResponse } from "next/server";
import { initializeNodes } from "@repo/node-set";
import { initializeServer } from "@/lib/serverInit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind');
    await initializeServer();
    const nodeRegistry = await initializeNodes();

    if (kind) {
      // If kind is provided, return the specific node
      const node = nodeRegistry.getNodeByKind(kind);
      if (node) {

        return NextResponse.json({ node });
      } else {

        return NextResponse.json(
          { message: `Node with kind ${kind} not found` },
          { status: 404 }
        );
      }
    } else {
      // If no kind is provided, return all categorized nodes
      const categories = nodeRegistry.getAllCatalogs();
      const nodesByCategory = nodeRegistry.getNodesByCategoryNotWithDetail();

      // Build complete category and node association data
      const result = categories.map(category => {
        const categoryNodes = nodesByCategory[category.id] || [];
        return {
          ...category,
          nodes: categoryNodes
        };
      });
      // Add cache control headers
      const response = NextResponse.json({ dataSource: result });
      // response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return response;
    }
  } catch (error) {
    console.error('Failed to get node information:', error);
    return NextResponse.json(
      {
        message: "Failed to get node information",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}