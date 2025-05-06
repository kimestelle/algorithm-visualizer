import { GraphData, TraversalLogEntry, TraversalResult } from "../types";

// Performs Dijkstra's algorithm on a weighted graph with non-negative edges.
// Returns:
// - traversal: array of nodes in the order they are finalized
// - log: final distances from start to each node
// - steps: detailed logs for each iteration (current node, visited set, PQ state, annotations)
// - nodeAnnotations: final distance labels for visualization
export function runDijkstra(graph: GraphData, startId?: string): TraversalResult {
  // Input validation: check if the graph is weighted and if the start node is valid
  if (!startId || !graph.nodes.some(n => n.id === startId)) {
    throw new Error("Invalid or missing start node");
  }
  if (!graph.isWeighted) {
    throw new Error("Dijkstra's algorithm requires a weighted graph");
  }
  if (graph.edges.some(e => e.weight! < 0)) {
    throw new Error("Dijkstra's algorithm does not support negative weights");
  }

  // Initialize data structures
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const steps: TraversalLogEntry[] = [];
  const visited: Set<string> = new Set(); // finalized nodes
  const traversal: string[] = []; // order of finalization
  const pq: [string, number][] = [[startId, 0]]; // min-heap simulated by sort

  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });
  distances[startId] = 0;

  // Main loop: Extract closest unvisited node from priority queue and process neighbors
  while (pq.length > 0) {
    // Extract node with smallest distance
    pq.sort((a, b) => a[1] - b[1]);
    const [current] = pq.shift()!;

    // Skip if already finalized
    if (visited.has(current)) continue;

    visited.add(current);
    traversal.push(current);

    // Relax edges: update neighbor distances if shorter path found
    const neighbors = graph.edges
      .filter(e => e.node1 === current || (!graph.isDirected && e.node2 === current))
      .map(e => ({
        id: e.node1 === current ? e.node2 : e.node1,
        weight: e.weight!
      }))
      .filter(n => !visited.has(n.id));

    for (const { id, weight } of neighbors) {
      const alt = distances[current] + weight;
      if (alt < distances[id]) {
        distances[id] = alt;
        previous[id] = current;
        pq.push([id, alt]);
      }
    }

     // Log current state: distances and PQ contents
    const nodeAnnotations: Record<string, string> = {};
    for (const node of graph.nodes) {
      if (distances[node.id] === Infinity) {
        nodeAnnotations[node.id] = "∞";
      } else if (visited.has(node.id)) {
        nodeAnnotations[node.id] = distances[node.id].toString();
      }
    }

    steps.push({
      current,
      visited: Array.from(visited),
      structure: pq.map(([id]) => id),
      display: `Visiting ${current} (dist: ${distances[current]}), PQ: [${pq.map(([id]) => id).join(", ")}]`,
      nodeAnnotations
    });
  }

   // Return results with final distances as log and annotations
  return {
    traversal,
    log: distances,
    steps,
    nodeAnnotations: Object.fromEntries(
      Object.entries(distances).map(([key, value]) => [key, value.toString()])
    )
  };
}