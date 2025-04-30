'use client'
import ForceGraph from './components/ForceGraph';
import { algorithmMap } from './algorithms';
import { GraphData } from './types';
import { useState, useMemo } from "react";

export default function Home() {
  const [nodes, setNodes] = useState<string[]>(["A", "B", "C", "D", "E"]);
  const [edges, setEdges] = useState<{ node1: string; node2: string; weight?: number }[]>([
    { node1: "A", node2: "B" },
    { node1: "A", node2: "C" },
    { node1: "B", node2: "D" },
    { node1: "C", node2: "E" },
    { node1: "D", node2: "E" },
  ]);
  const [isDirected, setIsDirected] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);

  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>(nodes[0]); 

  //memoize nodes and edges to avoid unnecessary rerenders
  const memoizedNodes = useMemo(() => nodes.map(id => ({ id })), [nodes]);
  const memoizedEdges = useMemo(
    () => edges.map(({ node1, node2, weight }) => ({ source: node1, target: node2, weight })),
    [edges]
  );


  function runAlgorithm(algo: keyof typeof algorithmMap) {
    const graph: GraphData = {
      nodes: nodes.map((id) => ({ id })),
      edges,
      isDirected,
      isWeighted,
    };
  
    try {
      const traversal = algorithmMap[algo](graph, selectedNode);
      let index = 0;
      const interval = setInterval(() => {
        setHighlightedNodes(traversal.slice(0, index + 1));
        index++;
        if (index >= traversal.length) clearInterval(interval);
      }, 500);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
<main className="w-full h-full flex flex-row ">
  {/* graph setup panel */}
  <div id='graph-setup' className="flex-2 p-4 bg-gray-100 dark:bg-gray-800 flex flex-col gap-4">
  <h1 className="text-xl font-bold">Graph Setup</h1>

  <div className="flex flex-wrap gap-4">
    <div className="flex flex-row gap-2 items-center">
      <label htmlFor="undirected" className="text-sm font-semibold">Undirected</label>
      <input type="radio" id="undirected" name="graph-direction" value="undirected" checked={!isDirected} onChange={() => setIsDirected(false)} />
      <label htmlFor="directed" className="text-sm font-semibold">Directed</label>
      <input type="radio" id="directed" name="graph-direction" value="directed" checked={isDirected} onChange={() => setIsDirected(true)} />
    </div>

    <div className="flex flex-row gap-2 items-center">
      <label htmlFor="unweighted" className="text-sm font-semibold">Unweighted</label>
      <input type="radio" id="unweighted" name="graph-weight" value="unweighted" checked={!isWeighted} onChange={() => setIsWeighted(false)} />
      <label htmlFor="weighted" className="text-sm font-semibold">Weighted</label>
      <input type="radio" id="weighted" name="graph-weight" value="weighted" checked={isWeighted} onChange={() => setIsWeighted(true)} />
    </div>
  </div>

  {/* add node */}
  <div className="flex gap-2">
  <button
      onClick={() => {
        const input = document.getElementById("new-node-id") as HTMLInputElement;
        const newId = input.value.trim();
        if (newId && !nodes.includes(newId)) {
          setNodes(prev => [...prev, newId]);
          input.value = "";
        }
      }}
      className="bg-red-400 text-white px-2 py-1 rounded text-sm"
    >
      Add Node
    </button>
    <input type="text" placeholder="New node ID" id="new-node-id" className="p-1 border rounded text-sm" />
  </div>

  {/* add edge */}
  <div className="flex flex-wrap gap-2 items-center">
  <button
      onClick={() => {
        const node1 = (document.getElementById("edge-node1") as HTMLInputElement).value.trim();
        const node2 = (document.getElementById("edge-node2") as HTMLInputElement).value.trim();
        const weightInput = document.getElementById("edge-weight") as HTMLInputElement;
        const weight = isWeighted ? Number(weightInput?.value) || 1 : undefined;
        if (node1 && node2 && node1 !== node2) {
          setEdges(prev => [...prev, { node1, node2, weight }]);
          (document.getElementById("edge-node1") as HTMLInputElement).value = "";
          (document.getElementById("edge-node2") as HTMLInputElement).value = "";
          if (isWeighted && weightInput) weightInput.value = "";
        }
      }}
      className="bg-red-500 text-white px-2 py-1 rounded text-sm"
    >
      Add Edge
    </button>
    <select id="edge-node1" className="p-1 border rounded text-sm">
    {nodes.map(n => <option key={n}>{n}</option>)}
    </select>
    &rarr;
    <select id="edge-node2" className="p-1 border rounded text-sm">
      {nodes.map(n => <option key={n}>{n}</option>)}
    </select>

    {isWeighted && (
      <input id="edge-weight" type="number" placeholder="Weight" className="p-1 border rounded text-sm w-20" />
    )}
  </div>

  {/* delete node */}
  <div className="flex gap-2">
  <button
      onClick={() => {
        const input = document.getElementById("delete-node-id") as HTMLInputElement;
        const toDelete = input.value.trim();
        setNodes(prev => prev.filter(n => n !== toDelete));
        setEdges(prev => prev.filter(e => e.node1 !== toDelete && e.node2 !== toDelete));
        input.value = "";
      }}
      className="bg-red-600 text-white px-2 py-1 rounded text-sm"
    >
      Delete Node
    </button>
    <select id="delete-node-id" className="p-1 border rounded text-sm">
      {nodes.map(n => <option key={n}>{n}</option>)}
    </select>
  </div>

  {/* delete edge */}
  <div className="flex gap-2">
    <button
        onClick={() => {
          const node1 = (document.getElementById("delete-edge-node1") as HTMLInputElement).value.trim();
          const node2 = (document.getElementById("delete-edge-node2") as HTMLInputElement).value.trim();
          setEdges(prev => prev.filter(e => !(e.node1 === node1 && e.node2 === node2)));
        }}
        className="bg-red-700 text-white px-2 py-1 rounded text-sm"
      >
        Delete Edge
    </button>
    <select id="delete-edge-node1" className="p-1 border rounded text-sm">
      {nodes.map(n => <option key={n}>{n}</option>)}
    </select>
    &rarr;
    <select id="delete-edge-node2" className="p-1 border rounded text-sm">
      {nodes.map(n => <option key={n}>{n}</option>)}
    </select>
  </div>

  {/* graph interface */}
  <ForceGraph
    nodes={memoizedNodes}
    edges={memoizedEdges}
    isDirected={isDirected}
    isWeighted={isWeighted}
    highlightedNodes={highlightedNodes}
  />

  </div>

  {/* panel for algorithm display */}
  <div id='algorithm-setup' className="flex-1 p-4 bg-gray-100 dark:bg-gray-800 flex flex-col gap-4">
    <h1 className="text-xl font-bold">Algorithm Setup</h1>
    <p className="text-sm">Select an algorithm to visualize the graph traversal.</p>
    <select
      className="p-1 border rounded text-sm"
      value={selectedNode}
      onChange={(e) => setSelectedNode(e.target.value)}
    >
      {nodes.map((n) => (
        <option key={n}>{n}</option>
        ))}
      </select>

    <button onClick={() => runAlgorithm("dfs")} className="...">DFS</button>

  </div>
</main>

  );
}
