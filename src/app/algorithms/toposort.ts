import { GraphData, TraversalLogEntry, TraversalResult } from "../types";

// Performs topological sort using Kahn's algorithm
// Returns:
// - traversal: array of nodes in topological order
// - log: maps each node ID to its position in the order
// - steps: detailed state at each iteration for visualization
// - display: human-readable step descriptions joined by newlines
// - nodeAnnotations: labels for nodes showing sort orer
export function runToposort(graph: GraphData): TraversalResult {
  if (!graph.isDirected) {
    throw new Error("Topological sort requires a directed graph");
  }

  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};
  const traversal: string[] = [];
  const log: Record<string, number> = {};
  const nodeAnnotations: Record<string, string> = {};
  const steps: TraversalLogEntry[] = [];
  const displayLines: string[] = [];

  // set up in-degree and adjacency list
  for (const { id } of graph.nodes) {
    inDegree[id] = 0;
    adjList[id] = [];
  }

  for (const edge of graph.edges) {
    inDegree[edge.node2]++;
    adjList[edge.node1].push(edge.node2);
  }

  // set up queue with nodes with in-degree 0
  const queue: string[] = graph.nodes
    .map(n => n.id)
    .filter(id => inDegree[id] === 0);

  // main loop: process nodes in queue until none left
  while (queue.length > 0) {
    const current = queue.shift()!;
    const index = traversal.length;

    traversal.push(current);
    log[current] = index;
    nodeAnnotations[current] = String(index + 1); // start counting at 1

    // reduce in-degree of neighbors and enqueue if they become 0
    for (const neighbor of adjList[current]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }

    const stepDisplay = `Selected: ${current} | Queue: [${queue.join(", ")}] | Order: ${traversal.join(" → ")}`;
    displayLines.push(stepDisplay);

    steps.push({
      current,
      visited: [...traversal],
      structure: [...queue],
      display: stepDisplay,
      nodeAnnotations: { ...nodeAnnotations }
    });
  }

  // if cycle detected, throw error
  if (traversal.length !== graph.nodes.length) {
    throw new Error("Graph contains a cycle — topological sort is not possible");
  }

  return {
    traversal,
    log,
    steps,
    display: displayLines.join("\n"),
    nodeAnnotations
  };
}
