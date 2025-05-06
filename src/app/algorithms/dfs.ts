import { GraphData, TraversalLogEntry, TraversalResult } from "../types";

// Performs Depth-First Search on an unweighted graph.
// Returns:
// - traversal: array of visited node IDs in DFS order
// - log: maps each node ID to its position in the traversal
// - steps: detailed state at each iteration for visualization
// - display: human-readable step descriptions joined by newlines
// - nodeAnnotations: labels for nodes showing visit sequence
export function runDFS(graph: GraphData, startId?: string): TraversalResult {
  // Ensure graph is suitable for DFS
  if (graph.isWeighted) throw new Error("DFS does not run on a weighted graph");

  // Data structures for DFS
  const visited    = new Set<string>(); // tracks visited nodes
  const result     : string[] = []; // DFS visitation order
  const log        : Record<string, number> = {};  // maps node ID to its index
  const steps      : TraversalLogEntry[] = []; // logs step for visualization
  const fullDisplay: string[] = []; // step descriptions for UI
  const nodeAnnotations: Record<string, string> = {}; // labels showing visit number

  //  DFS Traversal for a connected component 
  function processComponent(initial: string) {
    const stack = [initial];

    // while stack is not empty, pop a node and process if not visited
    while (stack.length > 0) {
      const node = stack.pop()!;  
      if (visited.has(node)) continue;
      
      // Mark node as visited
      visited.add(node);
      log[node] = result.length;
      result.push(node);
      nodeAnnotations[node] = String(result.length);

      // Record this step for animation/logging
      const visitedList = Array.from(visited);
      const structure   = [...stack];
      const stepDisplay = `Current: ${node} | Stack: ${structure.join(' → ')} | Visited: ${visitedList.join(', ')}`;

      // Add unvisited neighbors onto stack (reverse order to maintain DFS sequence)
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

  // Cover any disconnected components
  for (const { id } of graph.nodes) {
    if (!visited.has(id)) {
      processComponent(id);
    }
  }

  // Return the complete DFS traversal result
  return {
    traversal     : result,
    log,
    steps,
    display       : fullDisplay.join("\n"),
    nodeAnnotations
  };
}
