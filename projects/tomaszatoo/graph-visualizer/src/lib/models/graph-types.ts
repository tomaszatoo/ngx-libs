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