
// Graph Types & Traversal Logging:
// Defines interfaces for representing graph structure (nodes, edges, metadata)
// and for capturing step-by-step traversal logs used in visualization and algorithms.


/**
 * Node in the graph, identified by a unique string ID.
 */
export interface GraphNode {
    id: string;
  }
  
/**
 * Edge between two nodes, may have an optional weight
 */
export interface GraphEdge {
  node1: string; // ID of the first node
  node2: string; // ID of the second node
  weight?: number; // non-negative weight for weighted graphs
}
  

/**
 * Graph combining nodes, edges, and type flags.
 */
export interface GraphData {
  nodes: GraphNode[]; // list of all nodes
  edges: GraphEdge[]; // list of all edges connecting nodes
  isDirected: boolean; // whether edges are directed
  isWeighted: boolean; // whether edges have weights
}
  
// Traversal Logging Interfaces:
// How algorithm logs its  execution during animation.

/**
 * A step during traversal.
 */
export interface TraversalLogEntry {
  current: string; // current node being processed
  visited: string[]; // list of nodes visited so far
  structure: string[]; // current queue/stack/PQ contents
  display: string; // human-readable description of the step
  nodeAnnotations?: Record<string, string>; // optional labels (e.g., visit order, weights)
};
  
//final result
export interface TraversalResult {
  traversal: string[]; // order of nodes visited
  log: Record<string, number>; // map of node IDs to their index in traversal
  steps: TraversalLogEntry[]; // detailed logs for each step
  display?: string; // human-readable step descriptions
  nodeAnnotations?: Record<string, string>; // final node labels
}
  
  