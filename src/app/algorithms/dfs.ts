import { GraphData, TraversalLogEntry, TraversalResult } from "../types";

export function runDFS(graph: GraphData, startId: string): TraversalResult {
    if (graph.isWeighted) throw new Error("DFS does not run on a weighted graph");
  
    const visited = new Set<string>();
    const result: string[] = [];
    const log: Record<string, number> = {};
    const steps: TraversalLogEntry[] = [];
    const fullDisplay: string[] = [];
    const nodeAnnotations: Record<string, string> = {}; 
  
    const stack = [startId];
  
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;
  
      visited.add(node);
      log[node] = result.length;
      result.push(node);
  
      // label nodes with visit order
      nodeAnnotations[node] = String(result.length);
    //update data structures
      const visitedList = Array.from(visited);
      const structure = [...stack];
      //log intermediate step
      const stepDisplay = `Current: ${node} | Stack: ${structure.join(' → ')} | Visited (In order): ${visitedList.join(', ')}`;
  
      steps.push({ 
        current: node, 
        visited: visitedList, 
        structure, 
        display: stepDisplay,
        nodeAnnotations: { ...nodeAnnotations }, });
      //store all steps so far to display on screen
      fullDisplay.push(stepDisplay);
  
      const neighbors = graph.edges
        .filter(e => e.node1 === node || (!graph.isDirected && e.node2 === node))
        .map(e => (e.node1 === node ? e.node2 : e.node1))
        .filter(n => !visited.has(n));
  
      for (let i = neighbors.length - 1; i >= 0; i--) {
        stack.push(neighbors[i]);
      }
    }
  
    return {
      traversal: result,
      log,
      steps,
      display: fullDisplay.join('\n'),
      nodeAnnotations 
    };
  }
  