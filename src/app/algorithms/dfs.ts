import { GraphData, TraversalLogEntry, TraversalResult } from "../types";

// Depth-First Search (DFS):
// Explores as far as possible along each branch before backtracking. 
// Returns traversal order, log, and per-step annotations for visualization.
export function runDFS(graph: GraphData, startId?: string): TraversalResult {
  if (graph.isWeighted) throw new Error("DFS does not run on a weighted graph");

  const visited    = new Set<string>();
  const result     : string[] = [];
  const log        : Record<string, number> = {};
  const steps      : TraversalLogEntry[] = [];
  const fullDisplay: string[] = [];
  const nodeAnnotations: Record<string, string> = {};

  //  DFS Traversal for a connected component 
  function processComponent(initial: string) {
    const stack = [initial];

    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;

      visited.add(node);
      log[node] = result.length;
      result.push(node);
      nodeAnnotations[node] = String(result.length);

      // Record this step for animation/logging
      const visitedList = Array.from(visited);
      const structure   = [...stack];
      const stepDisplay = `Current: ${node} | Stack: ${structure.join(' → ')} | Visited: ${visitedList.join(', ')}`;

      steps.push({
        current: node,
        visited: visitedList,
        structure,
        display: stepDisplay,
        nodeAnnotations: { ...nodeAnnotations }
      });
      fullDisplay.push(stepDisplay);

      // Push unvisited neighbors (reversed to preserve DFS order)
      const neighbors = graph.edges
        .filter(e => e.node1 === node || (!graph.isDirected && e.node2 === node))
        .map(e => e.node1 === node ? e.node2 : e.node1)
        .filter(n => !visited.has(n));

      for (let i = neighbors.length - 1; i >= 0; i--) {
        stack.push(neighbors[i]);
      }
    }
  }

  //Start DFS from a given node if valid
  if (startId && graph.nodes.some(n => n.id === startId)) {
    processComponent(startId);
  }

  // Catch any disconnected components
  for (const { id } of graph.nodes) {
    if (!visited.has(id)) {
      processComponent(id);
    }
  }

  return {
    traversal     : result,
    log,
    steps,
    display       : fullDisplay.join("\n"),
    nodeAnnotations
  };
}
