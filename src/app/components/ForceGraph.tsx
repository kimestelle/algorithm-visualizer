'use client';

import * as d3 from 'd3';

import { useEffect, useRef } from 'react';

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
  

export default function ForceGraph({ nodes, edges, isDirected, isWeighted, highlightedNodes, nodeAnnotations }: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const width = 600;
    const height = 400;

    const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink<NodeType, LinkType>(edges).id((d: NodeType) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const link = svg.append('g')
      .attr('stroke', '#aaa')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke-width', d => isWeighted && d.weight ? d.weight : 2);

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
      );

    const text = svg.append<SVGGElement>('g')
      .selectAll<SVGTextElement, NodeType>('text')
      .data(nodes)
      .join('text')
      .text((d: NodeType) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', -20)
      .attr('font-size', 12);
    
    const edgeLabels = svg.append<SVGGElement>("g")
        .selectAll("text")
        .data(edges)
        .join("text")
        .attr("font-size", 12)
        .attr("fill", "#444")
        .text(d => isWeighted && d.weight ? `${d.weight}` : "");

      const nodeRadius = 15;

      simulation.on('tick', () => {
        link
            .attr('x1', (d: SimLink) => typeof d.source === 'object' ? d.source.x ?? 0 : 0)
            .attr('y1', (d: SimLink) => typeof d.source === 'object' ? d.source.y ?? 0 : 0)
            .attr('x2', (d: SimLink) => typeof d.target === 'object' ? d.target.x ?? 0 : 0)
            .attr('y2', (d: SimLink) => typeof d.target === 'object' ? d.target.y ?? 0 : 0)
            
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
            const sx = typeof d.source === 'object' ? d.source.x ?? 0 : 0;
            const tx = typeof d.target === 'object' ? d.target.x ?? 0 : 0;
            return (sx + tx) / 2;
          })
          .attr("y", d => {
            const sy = typeof d.source === 'object' ? d.source.y ?? 0 : 0;
            const ty = typeof d.target === 'object' ? d.target.y ?? 0 : 0;
            return (sy + ty) / 2;
          });
        
      });
      

  }, [nodes, edges, isDirected, isWeighted]);

  //second useeffect to handle highlighted nodes without rerendering graph
  useEffect(() => {
    if (!svgRef.current || !highlightedNodes) return;

    const svg = d3.select(svgRef.current);
  
    // highlight color
    svg.select("#nodes")
      .selectAll<SVGCircleElement, NodeType>("circle")
      .transition()
      .duration(300)
      .attr("fill", d => highlightedNodes.includes(d.id) ? "#4caf50" : "#ef5350");
  
    // update labels
    svg.selectAll<SVGTextElement, NodeType>("text")
      .text(d => {
        const label = d.id;
        const order = (nodeAnnotations?.[d.id] ?? '');
        return order ? `${label} (${order})` : label;
      });
  
  }, [highlightedNodes, nodeAnnotations]);
  
  

  return <svg ref={svgRef} className="rounded border w-full max-w-[800px]" />;
}
