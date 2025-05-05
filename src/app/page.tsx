// 'use client' ensures the component is rendered on the client side in Next.js
'use client'

import ForceGraph from './components/ForceGraph';
import { algorithmMap } from './algorithms';
import { GraphData } from './types';
import { useState, useMemo, useEffect } from "react";

export default function Home() {
  // Manages Graph State: 
  // Handles node list, edge list, and graph type toggles (directed/weighted)
  const [nodes, setNodes] = useState<string[]>(["A", "B", "C", "D", "E"]);
  const [edges, setEdges] = useState<{ node1: string; node2: string; weight?: number }[]>([
    { node1: "A", node2: "B", weight: 1 },
    { node1: "A", node2: "C", weight: 1 },
    { node1: "B", node2: "D", weight: 1 },
    { node1: "C", node2: "E", weight: 1 },
    { node1: "D", node2: "E", weight: 1 },
  ]);
  const [isDirected, setIsDirected] = useState(false); 
  const [isWeighted, setIsWeighted] = useState(false);

  // Graph Visualization & Interaction Management:
  // Highlighted nodes during traversal, selected node for algorithm, full log of steps, 
  // selected algorithm, node annotations, error message, and running stat
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]); 
  const [selectedNode, setSelectedNode] = useState<string>(nodes[0]); 
  const [fullLog, setFullLog] = useState<string>(''); 
  const [selectedAlgo, setSelectedAlgo] = useState<keyof typeof algorithmMap>(""); 
  const [nodeAnnotations, setNodeAnnotations] = useState<Record<string, string>>({}); 
  const [errorMessage, setErrorMessage] = useState<string>(''); 
  const [isRunningAlgorithm, setIsRunningAlgorithm] = useState<boolean>(false); 

  // Edge Weight Normalization: 
  // Ensures consistent edge weight format when toggling between weighted and unweighted
  useEffect(() => {
    if (isWeighted) {
      setEdges(prev => prev.map(edge => ({
        ...edge,
        weight: edge.weight != null ? edge.weight : 1
      })));
    } else {
      setEdges(prev => prev.map(edge => ({
        ...edge,
        weight: undefined
      })));
    }
  }, [isWeighted]);

  // Memoized Data for Rendering:
  // Prevents unnecessary recalculations in ForceGraph
  const memoizedNodes = useMemo(() => nodes.map(id => ({ id })), [nodes]);
  const memoizedEdges = useMemo(() => {
    const nodeMap = new Map(memoizedNodes.map(n => [n.id, n]));
    return edges.map(({ node1, node2, weight }) => ({
      source: nodeMap.get(node1)?.id || node1,
      target: nodeMap.get(node2)?.id || node2,
      weight,
    }));
  }, [edges, memoizedNodes]);

  // Graph Reset:
  // Clears all graph data and resets UI state
  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    setHighlightedNodes([]);
    setNodeAnnotations({});
    setFullLog('');
    setSelectedAlgo('');
    setSelectedNode('');
    setErrorMessage('');
    setIsRunningAlgorithm(false);
  };

  // Run Algorithm:
  // Validates inputs, runs selected algorithm, and animates traversal step-by-step
  function runAlgorithm(algo: keyof typeof algorithmMap) {
    const graph: GraphData = {
      nodes: nodes.map((id) => ({ id })),
      edges,
      isDirected,
      isWeighted,
    };

    try {
      // Input validation
      if (!graph.nodes.length) throw new Error("The graph is empty. Add nodes and edges to run the algorithm.");
      if (!selectedNode || !graph.nodes.some(n => n.id === selectedNode)) throw new Error("Please select a valid starting node.");

      // Execute algorithm
      const result = algorithmMap[algo].run(graph, selectedNode);
      const { traversal, steps, nodeAnnotations: finalAnnotations } = result;

      // Reset UI before animation
      setHighlightedNodes([]);
      setSelectedAlgo(algo);
      setFullLog('');
      setNodeAnnotations({});
      setErrorMessage('');
      setIsRunningAlgorithm(true);

      // Animate traversal log and highlight updates
      let index = 0;
      const interval = setInterval(() => {
        if (index >= steps.length) {
          clearInterval(interval);
          setHighlightedNodes(traversal);
          setNodeAnnotations(finalAnnotations || {});
          setIsRunningAlgorithm(false);
          return;
        }
        const step = steps[index];
        setHighlightedNodes(traversal.slice(0, index + 1));
        if (step.nodeAnnotations) setNodeAnnotations(step.nodeAnnotations);
        setFullLog(prev => prev + step.display + '\n');
        index++;
      }, 500);
    } catch (err) {
      // Handle algorithm-specific and validation errors
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      let userFriendlyMessage = message;

      if (message.includes("does not run on a weighted graph")) {
        userFriendlyMessage = `${algo.toUpperCase()} requires an unweighted graph. Please switch to an unweighted graph in the Graph Setup panel.`;
      } else if (message.includes("requires a weighted graph")) {
        userFriendlyMessage = `Dijkstra's algorithm requires a weighted graph. Please enable weights in the Graph Setup panel and add weights to edges.`;
      } else if (message.includes("negative weights")) {
        userFriendlyMessage = `Dijkstra's algorithm does not support negative edge weights. Please ensure all edge weights are non-negative.`;
      } else if (message.includes("Invalid or missing start node")) {
        userFriendlyMessage = "Please select a valid starting node from the Algorithm Setup panel.";
      }

      setErrorMessage(userFriendlyMessage);
      setIsRunningAlgorithm(false);
    }
  }

  // Ensure new nodes are visible by resetting camera zoom and position in ForceGraph
  useEffect(() => {
    const graphCanvas: any = document.querySelector('canvas');
    if (graphCanvas && typeof graphCanvas.__zoomToFit === 'function') {
      graphCanvas.__zoomToFit(); // Custom method exposed in ForceGraph to fit nodes
    }
  }, [nodes.length]);

  // UI Rendering Section
  return (
    <main className="w-full h-full flex flex-col md:flex-row font-sans text-[15px] bg-gradient-to-br from-white via-gray-100 to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <div id='graph-setup' className="flex-1 p-4 bg-white/90 dark:bg-gray-800/90 flex flex-col gap-3 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">Graph Setup</h1>

        <div className="flex gap-3 text-sm flex-wrap">
          <label><input type="radio" checked={!isDirected} onChange={() => setIsDirected(false)} className="accent-indigo-500" /> Undirected</label>
          <label><input type="radio" checked={isDirected} onChange={() => setIsDirected(true)} className="accent-indigo-500" /> Directed</label>
          <label><input type="radio" checked={!isWeighted} onChange={() => setIsWeighted(false)} className="accent-indigo-500 ml-6" /> Unweighted</label>
          <label><input type="radio" checked={isWeighted} onChange={() => setIsWeighted(true)} className="accent-indigo-500" /> Weighted</label>
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                const input = document.getElementById("new-node-id") as HTMLInputElement;
                const val = input.value.trim();
                if (val && !nodes.includes(val)) {
                  setNodes([...nodes, val]);
                  input.value = '';
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap"
            >
              Add Node
            </button>
            <input
              type="text"
              id="new-node-id"
              placeholder="New node ID"
              className="flex-grow p-1 border rounded text-xs w-0 min-w-0 bg-white dark:bg-gray-700"
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => {
                const n1 = (document.getElementById("edge-node1") as HTMLSelectElement).value;
                const n2 = (document.getElementById("edge-node2") as HTMLSelectElement).value;
                const weight = isWeighted ? Number((document.getElementById("edge-weight") as HTMLInputElement).value) : undefined;
                if (n1 && n2 && n1 !== n2) {
                  setEdges([...edges, { node1: n1, node2: n2, weight }]);
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-md text-xs"
            >Add Edge</button>
            <select id="edge-node1" className="p-1 border rounded text-xs bg-white dark:bg-gray-700">{nodes.map(n => <option key={n}>{n}</option>)}</select>
            →
            <select id="edge-node2" className="p-1 border rounded text-xs bg-white dark:bg-gray-700">{nodes.map(n => <option key={n}>{n}</option>)}</select>
            {isWeighted && (
              <input id="edge-weight" type="number" defaultValue="1" className="p-1 border rounded text-xs w-16 bg-white dark:bg-gray-700" />
            )}
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                const val = (document.getElementById("delete-node-id") as HTMLSelectElement).value;
                setNodes(nodes.filter(n => n !== val));
                setEdges(edges.filter(e => e.node1 !== val && e.node2 !== val));
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-md text-xs"
            >Delete Node</button>
            <select id="delete-node-id" className="p-1 border rounded text-xs bg-white dark:bg-gray-700">{nodes.map(n => <option key={n}>{n}</option>)}</select>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                const n1 = (document.getElementById("delete-edge-node1") as HTMLSelectElement).value;
                const n2 = (document.getElementById("delete-edge-node2") as HTMLSelectElement).value;
                setEdges(edges.filter(e => !(e.node1 === n1 && e.node2 === n2) && !(e.node1 === n2 && e.node2 === n1)));
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-md text-xs"
            >Delete Edge</button>
            <select id="delete-edge-node1" className="p-1 border rounded text-xs bg-white dark:bg-gray-700">{nodes.map(n => <option key={n}>{n}</option>)}</select>
            →
            <select id="delete-edge-node2" className="p-1 border rounded text-xs bg-white dark:bg-gray-700">{nodes.map(n => <option key={n}>{n}</option>)}</select>
          </div>
        </div>

        <div className="mt-2">
          <button onClick={clearGraph} className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-md text-xs font-medium">Clear Graph</button>
        </div>

        <ForceGraph
          nodes={memoizedNodes}
          edges={memoizedEdges}
          isDirected={isDirected}
          isWeighted={isWeighted}
          highlightedNodes={highlightedNodes}
          nodeAnnotations={nodeAnnotations}
          setNodes={setNodes}
          setEdges={setEdges}
          isWeightedGraph={isWeighted}
          isRunningAlgorithm={isRunningAlgorithm}
          setErrorMessage={setErrorMessage}
        />
      </div>

      {/* Algorithm Setup */}
      <div id='algorithm-setup' className="flex-1 p-4 bg-white/90 dark:bg-gray-800/90 flex flex-col gap-3 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">Algorithm Setup</h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">Select an algorithm to visualize the graph traversal.</p>

        {errorMessage && (
          <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-3 py-2 rounded text-xs">
            {errorMessage}
          </div>
        )}

        <div className='flex flex-row gap-2 items-center'>
          <p className="font-semibold text-xs">Starting Node:</p>
          <select className="p-1 border rounded text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" value={selectedNode} onChange={(e) => setSelectedNode(e.target.value)}>
            <option value="">Select a node</option>
            {nodes.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['dfs', 'bfs', 'dijkstra'].map(algo => (
            <button key={algo} onClick={() => runAlgorithm(algo as keyof typeof algorithmMap)} className={`${selectedAlgo === algo ? 'bg-purple-300 dark:bg-purple-600' : 'bg-purple-500 dark:bg-purple-700'} text-white px-2 py-1 rounded-md text-xs font-medium transition`}>
              {algo.toUpperCase()}
            </button>
          ))}
        </div>

        <p className="text-xs italic text-gray-600 dark:text-gray-400">
          {algorithmMap[selectedAlgo]?.description}
        </p>

        <div className="mt-2 text-xs font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded-lg overflow-y-auto max-h-60 shadow-inner">
          {fullLog.split('\n').map((line, index) => (
            <div key={index} className="text-gray-700 dark:text-gray-300">
              {line}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
