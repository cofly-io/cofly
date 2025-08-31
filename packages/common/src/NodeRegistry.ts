import { injectable } from 'inversify';
import { ICatalog, INode, INodeBasic, INodeDetail } from './Interfaces';

@injectable()
export class NodeRegistry {
  private nodes: Map<string, INode> = new Map();
  private nodesByCatalog: Map<string, INode[]> = new Map();
  private nodeCategories: Map<string, ICatalog> = new Map();
  private nodeTypes: Set<any> = new Set();

  hasType(nodeClass: any): boolean {
    return this.nodeTypes.has(nodeClass);
  }

  registerNode(nodeClass: any): INode | undefined {
    const nodeType = new nodeClass() as INode;
    // Validate node structure
    if (!nodeType || typeof nodeType !== 'object') {
      console.warn('Invalid node type provided to registerNode:', nodeType);
      return;
    }
  
    if (!nodeType.node || !nodeType.node.kind) {
      console.warn('Node is missing required "node" or "node.kind" property:', nodeType);
      return;
    }

    const kind = nodeType.node.kind;
    if(this.nodes.has(kind)) {
        return;
    }

    this.nodes.set(kind, nodeType);
    this.nodeTypes.add(nodeClass);
    
    // Register node by category
    if (nodeType.node?.catalog) {
      const catalogId = nodeType.node.catalog;
      if (!this.nodesByCatalog.has(catalogId)) {
        this.nodesByCatalog.set(catalogId, []);
      }
      this.nodesByCatalog.get(catalogId)?.push(nodeType);
    }

    return nodeType;
  }

  getNodeByKind(kind: string): INode | undefined {
    return this.nodes.get(kind);
  }

  getAllNodes(): INode[] {
    return Array.from(this.nodes.values());
  }

  getAllNodeDetail(): INodeDetail[] {
    return this.getAllNodes().map(node => node.detail);
  }
  
  getNodesByCatalog(catalogId: string): INode[] {
    return this.nodesByCatalog.get(catalogId) || [];
  }
  
  getNodesByCategoryNotWithDetail(): Record<string, INodeBasic[]> {
    const result: Record<string, INodeBasic[]> = {};
    
    this.nodesByCatalog.forEach((nodes, catalogId) => {
      result[catalogId] = nodes.map(node => node.node);
    });
    
    return result;
  }
  
  getNodesByCatalogWithDescriptions(): Record<string, INodeDetail[]> {
    const result: Record<string, INodeDetail[]> = {};
    
    this.nodesByCatalog.forEach((nodes, catalogId) => {
      result[catalogId] = nodes.map(node => node.detail);
    });
    
    return result;
  }

  registerCatalog(catalog: ICatalog): void {
      if(!this.nodeCategories.has(catalog.id)) {
          this.nodeCategories.set(catalog.id, catalog);
      }
  }

  getAllCatalogs(): ICatalog[] {
      return Array.from(this.nodeCategories.values());
  }
}