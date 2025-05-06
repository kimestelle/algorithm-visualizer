import { GraphData, TraversalLogEntry, TraversalResult } from "../types";

// Performs Breadth-First Search on an unweighted graph.
// Returns:
// - traversal: array of visited node IDs in order
// - log: maps each node ID to its position in the traversal
// - steps: detailed state at each iteration for visualization
// - display: human-readable step descriptions joined by newlines
// - nodeAnnotations: labels for nodes showing visit sequence
export function runBFS(graph: GraphData, startId?: string): TraversalResult {
  // Input validation: check if the graph is unweighted and if the start node is valid
  if (graph.isWeighted) throw new Error("BFS does not run on a weighted graph");
  if (!startId || !graph.nodes.some(n => n.id === startId)) {
    throw new Error("Invalid or missing start node");
  }

  // Data structures for BFS
  const discovered = new Map<string, boolean>(); // whether each node has discovered
  const parent = new Map<string, string | null>(); // parent pointer
  const result: string[] = []; // order of visited nodes
  const log: Record<string, number> = {}; // maps node ID to traversal index
  const steps: TraversalLogEntry[] = []; // logs of each BFS step
  const fullDisplay: string[] = [];  // step descriptions for UI
  const nodeAnnotations: Record<string, string> = {}; // labels showing visit order

  
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

  // Main BFS loop: process until queue is empty
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
        queue.push(u);  // enqueue for future exploration
        parent.set(u, v); // update parent pointer
        result.push(u); // add to traversal order
        log[u] = result.length - 1; // record visit index
        nodeAnnotations[u] = String(result.length);
      }
    }
  }

  // Return the full BFS traversal result
  return {
    traversal: result,
    log,
    steps,
    display: fullDisplay.join("\n"),
    nodeAnnotations
  };
}