import { runDFS } from "./dfs";
import { runBFS } from "./bfs";
import { GraphData, TraversalResult } from "../types";

export type TraversalFunction = (graph: GraphData, startId: string) => TraversalResult;

export type AlgorithmEntry = {
  run: TraversalFunction;
  description: string;
};

export const algorithmMap: Record<string, AlgorithmEntry> = {
  dfs: {
    run: runDFS,
    description: "Depth-First Search (DFS) traverses a graph by exploring as far as possible along each branch before backtracking to the last un-visited node and repeating the process. It uses a stack to keep track of nodes to visit next.",
  },
  bfs: {
    run: runBFS,
    description: "Breadth-First Search (BFS) traverses a graph by exploring all neighbors of a node before moving to the next level of neighbors. It uses a queue to keep track of nodes to visit next.",
  }
};