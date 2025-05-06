'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';


// === ForceGraph Component ===
// Renders an interactive, force-directed graph that supports node dragging, edge editing,
// arrow rendering for directed graphs, edge weight editing for weighted graphs, and animation updates
// for traversal steps with live annotation and highlighting.

interface NodeType {
  id: string;
  fx?: number | null;
  fy?: number | null;
  x?: number;
  y?: number;
}

interface LinkType {
  source: string;
  target: string;
  weight?: number;
}

interface ForceGraphProps {
  nodes: NodeType[];
  edges: LinkType[];
  isDirected: boolean;
  isWeighted: boolean;
  highlightedNodes?: string[];
  nodeAnnotations?: Record<string, string>;
  setNodes: React.Dispatch<React.SetStateAction<string[]>>;
  setEdges: React.Dispatch<React.SetStateAction<{ node1: string; node2: string; weight?: number }[]>>;
  isWeightedGraph: boolean;
  isRunningAlgorithm: boolean;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  x?: number;
  y?: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  weight?: number;
}

export default function ForceGraph({
  nodes,
  edges,
  isDirected,
  isWeighted,
  highlightedNodes,
  nodeAnnotations,
  setNodes,
  setEdges,
  isWeightedGraph,
  isRunningAlgorithm,
  setErrorMessage
}: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<NodeType, LinkType> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600;
    const height = 400;

    // Initial Render: Simulation and Element Binding 
    if (!simulationRef.current) {
      d3.select(svgRef.current).selectAll('*').remove();

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink<NodeType, LinkType>(edges).id((d: NodeType) => d.id).distance(120))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2));
      simulationRef.current = simulation;

      // Link Rendering & Interactions:
      // Draws edges and enables editing via click interactions
      const linkGroup = svg.append('g')
        .attr('stroke', '#aaa')
        .attr('id', 'links');

      const link = linkGroup
        .selectAll('line')
        .data(edges)
        .join('line')
        .attr('stroke-width', d => {
          const weight = isWeighted && d.weight != null ? d.weight : 2;
          return Math.max(2, Math.min(10, weight));
        })
        .on('click', (event, d) => {
           // Edge Click Handler:
          // Allows weight editing or deletion depending on graph type

          if (isRunningAlgorithm) {
            setErrorMessage('Cannot edit edges while an algorithm is running.');
            return;
          }

          const sourceId = typeof d.source === 'object' ? (d.source as SimNode).id : d.source;
          const targetId = typeof d.target === 'object' ? (d.target as SimNode).id : d.target;

          if (isWeightedGraph) {
            const action = prompt('Enter new edge weight or type "delete" to remove the edge:', d.weight?.toString() || '1');
            if (action !== null) {
              if (action.toLowerCase() === 'delete') {
                setEdges(prev => {
                  const newEdges = prev.filter(e =>
                    !(e.node1 === sourceId && e.node2 === targetId) && !(e.node1 === targetId && e.node2 === sourceId)
                  );
                  return newEdges;
                });
              } else {
                const weight = Number(action);
                if (!isNaN(weight) && weight >= 0) {
                  setEdges(prev => {
                    const newEdges = prev.map(e =>
                      (e.node1 === sourceId && e.node2 === targetId) || (!isDirected && e.node1 === targetId && e.node2 === sourceId)
                        ? { ...e, weight }
                        : e
                    );
                    return newEdges;
                  });
                } else {
                  setErrorMessage('Please enter a valid non-negative number for the weight.');
                }
              }
            }
          } else {
            const confirmDelete = confirm(`Delete edge between ${sourceId} and ${targetId}?`);
            if (confirmDelete) {
              setEdges(prev => {
                const newEdges = prev.filter(e =>
                  !(e.node1 === sourceId && e.node2 === targetId) && !(e.node1 === targetId && e.node2 === sourceId)
                );
                return newEdges;
              });
            }
          }

           // Temporary highlight on interaction
          d3.select(event.currentTarget)
            .transition()
            .duration(300)
            .attr('stroke', '#ff0')
            .transition()
            .duration(300)
            .attr('stroke', '#aaa');
        });

      // Directed Graph Arrow Marker Setup:
      if (isDirected) {
        svg.append("defs").selectAll("marker")
          .data(["end"])
          .join("marker")
          .attr("id", "arrow")
          .attr("stroke-width", 0)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 20)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", "#999");

        link.attr("marker-end", "url(#arrow)");
      }

      // Node Rendering & Drag Interaction
      const nodeGroup = svg.append<SVGGElement>('g')
        .attr('id', 'nodes');

      const node = nodeGroup
        .selectAll<SVGCircleElement, NodeType>('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 15)
        .attr('fill', '#ef5350')
        .call(d3.drag<SVGCircleElement, NodeType>()
          .on('start', (event: d3.D3DragEvent<SVGCircleElement, NodeType, NodeType>, d: NodeType) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event: d3.D3DragEvent<SVGCircleElement, NodeType, NodeType>, d: NodeType) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event: d3.D3DragEvent<SVGCircleElement, NodeType, NodeType>, d: NodeType) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
        )
        .on('click', (event, d) => {
          //Node Click Handler:
          // Allows node renaming via prompt
          if (isRunningAlgorithm) {
            setErrorMessage('Cannot edit nodes while an algorithm is running.');
            return;
          }

          const newLabel = prompt('Enter new node label:', d.id);
          if (newLabel !== null && newLabel.trim() && !nodes.some(n => n.id === newLabel.trim())) {
            setNodes(prev => prev.map(id => id === d.id ? newLabel.trim() : id));
            setEdges(prev => prev.map(e => ({
              node1: e.node1 === d.id ? newLabel.trim() : e.node1,
              node2: e.node2 === d.id ? newLabel.trim() : e.node2,
              weight: e.weight
            })));
          } else if (newLabel !== null && (newLabel.trim() === '' || nodes.some(n => n.id === newLabel.trim()))) {
            setErrorMessage('Please enter a unique, non-empty node label.');
          }

          d3.select(event.currentTarget)
            .transition()
            .duration(300)
            .attr('stroke', '#ff0')
            .attr('stroke-width', 2)
            .transition()
            .duration(300)
            .attr('stroke', null)
            .attr('stroke-width', 0);
        });

      // Label Rendering:
      // Renders static node and edge labels
      const text = svg.append<SVGGElement>('g')
        .attr('id', 'node-labels')
        .selectAll<SVGTextElement, NodeType>('text')
        .data(nodes)
        .join('text')
        .text((d: NodeType) => d.id)
        .attr('text-anchor', 'middle')
        .attr('dy', -20)
        .attr('font-size', 12);

      const edgeLabels = svg.append<SVGGElement>("g")
        .attr('id', 'edge-labels')
        .selectAll("text")
        .data(edges)
        .join("text")
        .attr("font-size", 12)
        .attr("fill", "#444");

      const nodeRadius = 30;

      // Simulation Tick Update:
      // Updates node/edge positions and label placement on each tick
      simulation.on('tick', () => {
        link
          .attr('x1', (d: SimLink) => typeof d.source === 'object' ? d.source.x ?? 0 : 0)
          .attr('y1', (d: SimLink) => typeof d.source === 'object' ? d.source.y ?? 0 : 0)
          .attr('x2', (d: SimLink) => typeof d.target === 'object' ? d.target.x ?? 0 : 0)
          .attr('y2', (d: SimLink) => typeof d.target === 'object' ? d.target.y ?? 0 : 0);

        node
          .attr('cx', d => {
            d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x!));
            return d.x!;
          })
          .attr('cy', d => {
            d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y!));
            return d.y!;
          });

        text
          .attr('x', d => d.x!)
          .attr('y', d => d.y!);

        edgeLabels
          .attr("x", d => {
            const sx = typeof d.source === 'object' ? (d.source as SimNode).x ?? 0 : 0;
            const tx = typeof d.target === 'object' ? (d.target as SimNode).x ?? 0 : 0;
            return (sx + tx) / 2;
          })
          .attr("y", d => {
            const sy = typeof d.source === 'object' ? (d.source as SimNode).y ?? 0 : 0;
            const ty = typeof d.target === 'object' ? (d.target as SimNode).y ?? 0 : 0;
            return (sy + ty) / 2 + 5;
          })
          .text(d => isWeighted && d.weight != null ? `${d.weight}` : "");
      });
    } else {
      // Graph Update Only (No Full Re-render):
      // Updates only data-bound attributes when props change
      simulationRef.current.nodes(nodes);
      if (simulationRef.current) {
        (simulationRef.current?.force('link') as d3.ForceLink<NodeType, LinkType>)?.links(edges);
      }
      simulationRef.current.alpha(0.3).restart();

      const svg = d3.select(svgRef.current);
      svg.select('#links')
        .selectAll('line')
        .data(edges)
        .join('line')
        .attr('stroke-width', d => {
          const weight = isWeighted && d.weight != null ? d.weight : 2;
          return Math.max(2, Math.min(10, weight));
        })
        .attr('stroke', '#aaa')
        .attr('marker-end', isDirected ? 'url(#arrow)' : null);

      svg.select('#nodes')
        .selectAll<SVGCircleElement, NodeType>('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 15)
        .attr('fill', d => highlightedNodes?.includes(d.id) ? '#4caf50' : '#ef5350');

      svg.select('#node-labels')
        .selectAll<SVGTextElement, NodeType>('text')
        .data(nodes)
        .join('text')
        .text(d => {
          const label = d.id;
          const order = (nodeAnnotations?.[d.id] ?? '');
          return order ? `${label} (${order})` : label;
        })
        .attr('text-anchor', 'middle')
        .attr('dy', -20)
        .attr('font-size', 12);

      svg.select('#edge-labels')
        .selectAll("text")
        .data(edges)
        .join("text")
        .attr("font-size", 12)
        .attr("fill", "#444")
        .text(d => isWeighted && d.weight != null ? `${d.weight}` : "");
    }

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
    };
  }, [nodes, edges, isDirected, isWeighted, isWeightedGraph, setNodes, setEdges, setErrorMessage]);


  // Traversal Highlight Update:
  // Animates color and label updates as algorithm progresses
  useEffect(() => {
    if (!svgRef.current || !highlightedNodes) return;

    const svg = d3.select(svgRef.current);

    svg.select("#nodes")
      .selectAll<SVGCircleElement, NodeType>("circle")
      .transition()
      .duration(300)
      .attr("fill", d => highlightedNodes.includes(d.id) ? "#4caf50" : "#ef5350");

    svg.select("#node-labels")
      .selectAll<SVGTextElement, NodeType>("text")
      .text(d => {
        const label = d.id;
        const order = (nodeAnnotations?.[d.id] ?? '');
        return order ? `${label} (${order})` : label;
      });
  }, [highlightedNodes, nodeAnnotations]);

  return <svg ref={svgRef} className="rounded border w-full max-w-[800px]" />;
}