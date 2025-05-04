import { GraphData, TraversalLogEntry, TraversalResult } from "../types";

// Breadth-First Search (BFS):
// Traverses the graph level-by-level starting from a source node.
// Returns traversal order, step-by-step log, and node annotations for visualization.
export function runBFS(graph: GraphData, startId?: string): TraversalResult {
  // Input validation: check if the graph is unweighted and if the start node is valid
  if (graph.isWeighted) throw new Error("BFS does not run on a weighted graph");
  if (!startId || !graph.nodes.some(n => n.id === startId)) {
    throw new Error("Invalid or missing start node");
  }

   // Initialization of data structures
  const discovered = new Map<string, boolean>();
  const parent = new Map<string, string | null>();
  const result: string[] = [];
  const log: Record<string, number> = {};
  const steps: TraversalLogEntry[] = [];
  const fullDisplay: string[] = [];
  const nodeAnnotations: Record<string, string> = {};

  
  // Mark all nodes undiscovered and without parent
  for (const { id } of graph.nodes) {
    discovered.set(id, false);
    parent.set(id, null);
  }

  // Start BFS from the source node
  const queue: string[] = [];
  queue.push(startId);
  discovered.set(startId, true);
  result.push(startId);
  log[startId] = 0;
  nodeAnnotations[startId] = "1";

  while (queue.length > 0) {
    const v = queue.shift()!;

    // Record current step
    const visitedList = result;
    const structure = [...queue];
    const stepDisplay = `Current: ${v} | Queue: ${structure.join(' → ')} | Visited: ${visitedList.join(', ')}`;

    steps.push({
      current: v,
      visited: visitedList,
      structure,
      display: stepDisplay,
      nodeAnnotations: { ...nodeAnnotations }
    });
    fullDisplay.push(stepDisplay);

    // Process all adjacent vertices
    const neighbors = graph.edges
      .filter(e => e.node1 === v || (!graph.isDirected && e.node2 === v))
      .map(e => e.node1 === v ? e.node2 : e.node1);

    for (const u of neighbors) {
      if (!discovered.get(u)) {
        discovered.set(u, true);
        queue.push(u);
        parent.set(u, v);
        result.push(u);
        log[u] = result.length - 1;
        nodeAnnotations[u] = String(result.length);
      }
    }
  }

  return {
    traversal: result,
    log,
    steps,
    display: fullDisplay.join("\n"),
    nodeAnnotations
  };
}