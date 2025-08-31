/**
 * 画布相关类型定义
 */

import { Node, Edge, Connection } from 'reactflow';

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
}

export interface CanvasOperations {
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  addEdge: (edge: Edge | Connection) => void;
  removeEdge: (edgeId: string) => void;
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void;
}

export interface CanvasConfig {
  autoLayout: boolean;
  snapToGrid: boolean;
  gridSize: number;
  zoomOnDoubleClick: boolean;
  panOnDrag: boolean;
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
}

export interface EdgeLabelStyle {
  fill: string;
  fontSize: number;
  fontWeight: number;
}

export interface EdgeLabelBgStyle {
  fill: string;
  fillOpacity: number;
}

export interface EdgeStyleConfig {
  style: EdgeStyle;
  labelStyle: EdgeLabelStyle;
  labelBgStyle: EdgeLabelBgStyle;
}

export interface CopyPasteState {
  copiedNodes: Node[];
  copiedEdges: Edge[];
  pasteOffset: NodePosition;
}

export interface CanvasHistory {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

export interface CanvasSelection {
  selectedNodes: string[];
  selectedEdges: string[];
}

export interface DragDropState {
  isDragging: boolean;
  draggedNodeType?: string;
  dropPosition?: NodePosition;
}