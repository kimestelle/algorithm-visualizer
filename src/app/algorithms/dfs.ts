import { GraphData } from "../types";

export function runDFS(graph: GraphData, startId: string): string[] {
  if (graph.isWeighted) throw new Error("DFS does not run on a weighted graph");

  const visited = new Set<string>();
  const result: string[] = [];

  function dfs(node: string) {
    if (visited.has(node)) return;
    visited.add(node);
    result.push(node);
    const neighbors = graph.edges
      .filter(e => e.node1 === node || (!graph.isDirected && e.node2 === node))
      .map(e => (e.node1 === node ? e.node2 : e.node1));
    neighbors.forEach(dfs);
  }

  dfs(startId);
  return result;
}
