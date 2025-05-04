import { GraphData, TraversalLogEntry, TraversalResult } from "../types";

// Dijkstra's Algorithm:
// Computes shortest paths from a start node to all others in a weighted graph with non-negative edge weights.
// Returns a traversal log with step-by-step details for visualization.
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

  // Initialize data structures: distances, previous node map, priority queue, and result containers 
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const steps: TraversalLogEntry[] = [];
  const visited: Set<string> = new Set();
  const traversal: string[] = [];
  const pq: [string, number][] = [[startId, 0]];

  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });
  distances[startId] = 0;

  // Main loop: Extract closest unvisited node from priority queue and process neighbors
  while (pq.length > 0) {
    pq.sort((a, b) => a[1] - b[1]);
    const [current] = pq.shift()!;

    if (visited.has(current)) continue;

    visited.add(current);
    traversal.push(current);

    // Get neighbors and update distances if a shorter path is found 
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

    // Annotate current step with distances and priority queue state 
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

  // Final result: return traversal path, distance map, and step logs for visualization 
  return {
    traversal,
    log: distances,
    steps,
    nodeAnnotations: Object.fromEntries(
      Object.entries(distances).map(([key, value]) => [key, value.toString()])
    )
  };
}