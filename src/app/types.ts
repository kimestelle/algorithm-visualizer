export interface GraphNode {
    id: string;
  }
  
  export interface GraphEdge {
    node1: string;
    node2: string;
    weight?: number;
  }
  
  export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    isDirected: boolean;
    isWeighted: boolean;
  }
  