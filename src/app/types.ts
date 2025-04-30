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
  
  //step-wise individual entry
  export interface TraversalLogEntry {
    current: string;
    visited: string[]; 
    structure: string[]; 
    display: string;
    nodeAnnotations?: Record<string, string>;
  };
  
  //final result
  export interface TraversalResult {
    traversal: string[];
    log: Record<string, number>;
    steps: TraversalLogEntry[];
    display?: string;
    nodeAnnotations?: Record<string, string>;
  }
  
  