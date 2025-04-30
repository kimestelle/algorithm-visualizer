import { runDFS } from "./dfs";
import { GraphData } from "../types";

export type TraversalFunction = (graph: GraphData, startId: string) => string[];

export const algorithmMap: Record<string, TraversalFunction> = {
  dfs: runDFS,
};