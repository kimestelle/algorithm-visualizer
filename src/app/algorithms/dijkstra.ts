import { GraphData, TraversalLogEntry, TraversalResult } from "../types";

// Min-priority queue with decrease-key operation
class MinPriorityQueue {
  private heap: { id: string; priority: number }[] = [];
  private indexMap: Record<string, number> = {};

  // Insert a node with given priority, or decrease-key if already present
  insert(id: string, priority: number) {
    if (id in this.indexMap) {
      const i = this.indexMap[id];
      if (priority < this.heap[i].priority) {
        this.heap[i].priority = priority;
        this.siftUp(i);
      }
    } else {
      const i = this.heap.length;
      this.heap.push({ id, priority });
      this.indexMap[id] = i;
      this.siftUp(i);
    }
  }

  // Pop the node with smallest priority
  pop(): { id: string; priority: number } | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    delete this.indexMap[min.id];
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.indexMap[last.id] = 0;
      this.siftDown(0);
    }
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  // Return array of node IDs currently in the PQ
  toArray(): string[] {
    return this.heap.map(entry => entry.id);
  }

  private siftUp(i: number) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[i].priority < this.heap[p].priority) {
        this.swap(i, p);
        i = p;
      } else break;
    }
  }

  private siftDown(i: number) {
    const n = this.heap.length;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < n && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest !== i) {
        this.swap(i, smallest);
        i = smallest;
      } else break;
    }
  }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    this.indexMap[this.heap[i].id] = i;
    this.indexMap[this.heap[j].id] = j;
  }
}

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
  const pq = new MinPriorityQueue();  // decrease-key PQ

  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });
  distances[startId] = 0;
  pq.insert(startId, 0);

  // Main loop: Extract closest unvisited node from priority queue and process neighbors
  while (!pq.isEmpty()) {
    const top = pq.pop()!;
    const current = top.id;
    const currentDist = top.priority;

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
        pq.insert(id, alt);  // decrease-key or insert new
      }
    }

    // Log current state: distances and PQ contents
    const nodeAnnotations: Record<string, string> = {};
    for (const node of graph.nodes) {
      nodeAnnotations[node.id] =
        distances[node.id] === Infinity ? "∞" : distances[node.id].toString();
    }

    steps.push({
      current,
      visited: Array.from(visited),
      structure: pq.toArray(),
      display: `Visiting ${current} (dist: ${currentDist}), PQ: [${pq.toArray().join(", ")}]`,
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
