# Graph Algorithm Visualizer

Deployed on website: [algo-visualizer-olive-rho.vercel.app](https://algo-visualizer-olive-rho.vercel.app)


## Project Overview

Graph Algorithm Visualizer is a browser-based interactive tool that enables users to construct graphs and visualize classical traversal algorithms. Users can toggle between directed/undirected and weighted/unweighted modes and add/delete nodes and edges dynamically. The application supports step-by-step visualization for Depth-First Search (DFS), Breadth-First Search (BFS), Dijkstra’s algorithm, and Topological Sort, providing logs and annotated nodes to help understand traversal behavior. This tool is designed to enhance intuition around graph algorithms through visual interactivity.

## Project Category

Code Implementation

This project falls under the Code Implementation category. We implemented graph algorithms from scratch, integrated them with a force-directed graph visualizer using D3.js, and created an interactive frontend using React and TypeScript.

## Work Breakdown

Bailey  
- Implemented BFS and Dijkstra’s algorithm  
- Improved UI/UX for consistency across the app  
- Refactored DFS logic to align with what was taught in class

Estelle  
- Set up the initial UI/UX layout and prop / graph structure  
- Implemented the initial version of the DFS algorithm and Topological Sort
- Built the algorithm selection and setup panel

## How to Run

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and go to:

```
http://localhost:3000
```

## Features

- Add and delete nodes and edges from the graph
- Toggle between directed/undirected and weighted/unweighted graphs
- Select and run DFS, BFS, Dijkstra's algorithm, or TopoSort
- Visualize traversal step-by-step with logs and annotations
- Edit node labels and edge weights interactively

## Screenshots
- Main Panel with Initial Set Up: This is the default view when you first load the app with graph‑setup controls (directed/undirected, weighted/unweighted toggles), and the algorithm panel on the right.
  ![Screenshot 2025-05-06 014815](https://github.com/user-attachments/assets/dfa097c5-fda3-42ea-9412-2a9d8dcb7464)

- Nodes and Edges Added:  To add nodes, type a unique ID into the  field and click Add Node. To add edges, choose two nodes from the dropdowns, enter a weight if enabled, and click Add Edge.
  ![Screenshot 2025-05-06 014856](https://github.com/user-attachments/assets/e5244922-6585-41e9-b1ac-dd26dbe7e3dc)

- DFS Iteration on an undirected graph (also supports directed graphs): Select Undirected/directed (depending on your graph setup), unweighted, pick a starting node, and click DFS. The component will step through each branch depth‑first, highlighting nodes in visit order.
  ![Screenshot 2025-05-06 014933](https://github.com/user-attachments/assets/67129af6-7192-4779-a36a-5bce5a31714b)

- BFS Iteration on a directed graph (also supports undirected graphs): Select Undirected/directed (depending on your graph setup), unweighted, choose your start node, and click BFS. The queue‐based exploration will animate level by level.
  ![Screenshot 2025-05-06 015847](https://github.com/user-attachments/assets/04d0d6a6-a991-4b87-ab8c-937d3beb267c)

- Dijkstra Iteration on a directed, weighted graph (also supports weighted, undirected graphs): Enable Weighted (and Directed if desired), set your edge weights, pick a start node, and click Dijkstra. The algorithm will display shortest distances as it finalizes each node.
  ![Screenshot 2025-05-06 021207](https://github.com/user-attachments/assets/44e520cc-0a82-4e9b-b8bb-8d5e3476676e)

- TopoSort Iteration on a directed, unweighted graph (also supports weighted graphs): Enable Directed (and Weighted if desired) and click TopoSort. The algorithm will display shortest distances as it finalizes each node (does not account for starting node).
  <img width="1470" alt="Screenshot 2025-05-07 at 6 51 56 PM" src="https://github.com/user-attachments/assets/4860853a-3fd8-4123-957c-34de99099d2a" />
