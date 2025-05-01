import { GraphData, TraversalLogEntry, TraversalResult } from "../types";

export function runDFS(graph: GraphData, startId?: string): TraversalResult {
  if (graph.isWeighted) throw new Error("DFS does not run on a weighted graph");

  const visited    = new Set<string>();
  const result     : string[] = [];
  const log        : Record<string, number> = {};
  const steps      : TraversalLogEntry[] = [];
  const fullDisplay: string[] = [];
  const nodeAnnotations: Record<string, string> = {};

  // helper that empties stack in a standard DFS
  function processComponent(initial: string) {
    const stack = [initial];

    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;

      visited.add(node);
      log[node] = result.length;
      result.push(node);
      nodeAnnotations[node] = String(result.length);

      // record one step
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

      // push all unvisited neighbors
      const neighbors = graph.edges
        .filter(e => e.node1 === node || (!graph.isDirected && e.node2 === node))
        .map(e => e.node1 === node ? e.node2 : e.node1)
        .filter(n => !visited.has(n));

      for (let i = neighbors.length - 1; i >= 0; i--) {
        stack.push(neighbors[i]);
      }
    }
  }

  // 1) Optionally start from a preferred node
  if (startId && graph.nodes.some(n => n.id === startId)) {
    processComponent(startId);
  }

  // 2) Then sweep through *all* nodes to catch disconnected ones
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
