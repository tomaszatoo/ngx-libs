import { FederatedPointerEvent } from "pixi.js";

export interface GraphVisualizerOptions {
  backgroundColor?: string | number,
  backgroundAlpha?: number
}

export interface GraphColors {
  fill?: number,
  stroke?: number,
  label?: number,
  selection?: number,
  highlight?: number
}

export interface GraphNodeAttributes {
  x: number,
  y: number,
  label?: string,
  colors?: GraphColors,
  radius?: number,
  strokeWidth?: number
}

export interface GraphEdgeAttributes {
  label?: string,
  strokeWidth?: number,
  colors?: GraphColors
}

export interface GraphNode {
  id: string;
  attributes?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  attributes?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NodePointerEvent {
  id: string,
  attributes: GraphNodeAttributes,
  position: {x: number, y: number},
  event: FederatedPointerEvent,
  selected?: boolean,
  highlighted?: boolean
}

export interface EdgePointerEvent {
  id: string,
  attributes: GraphEdgeAttributes,
  source: string,
  target: string,
  event: FederatedPointerEvent,
  selected?: boolean,
  highlighted?: boolean
}

export interface GraphLayoutSettings {
  adjustSizes?: boolean,
  barnesHutOptimize?: boolean,
  barnesHutTheta?: number,
  edgeWeightInfluence?: number,
  gravity?: number,
  linLogMode?: boolean,
  outboundAttractionDistribution?: boolean,
  scalingRatio?: number,
  slowDown?: number,
  strongGravityMode?: boolean
}

export interface Point {
    x: number,
    y: number
}

export interface EdgePosition {
    source: Point,
    target: Point
}