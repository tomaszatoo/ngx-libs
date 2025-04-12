import { Injectable } from '@angular/core';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import forceLayout from 'graphology-layout-force';
import { random, circular, circlepack  } from 'graphology-layout';
import GraphOptions from 'graphology';
// import FA2LayoutSupervisor from 'graphology-layout-forceatlas2/worker';
// import FA2Layout from 'graphology-layout-forceatlas2/worker';

export interface LayoutSettings {
  adjustSizes?: boolean,
  barnesHutOptimize?: boolean,
  barnesHutTheta?: number,
  edgeWeightInfluence?: number,
  gravity?: number,
  linLogMode?: boolean,
  outboundAttractionDistribution?: boolean,
  scalingRatio?: number,
  slowDown?: number,
  strongGravityMode?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class GraphEngineService {

  constructor() {}

  loadGraph(data: { nodes: any[]; edges: any[] }, options?: GraphOptions): Graph | null {
    // this.graph.clear();
    const graph: Graph = new Graph( options ? options : {
      multi: false,
      allowSelfLoops: true,
      type: 'directed'
    });
    for (const node of data.nodes) {
      graph.addNode(node.id, node.attributes || {});
    }

    for (const edge of data.edges) {
      graph.addEdge(edge.source, edge.target, edge.attributes || {});
    }
    // Check if the graph has at least one node
    if (graph.order === 0) {
      console.error('Graph must have at least one node.');
      return null;
    }
    return graph;
  }

  initPositions(graph: Graph, settings?: LayoutSettings): Record<string, {x: number, y: number}> {
    console.log('initPositions with settings: ', settings);
    // set initial graph nodes positions
    const circularPositions = circlepack(graph, {scale: 200});
    // console.log('circular positions', circularPositions);
    // console.log('graph.nodes after circular/random positions...');
    graph.forEachNode((node: string, attributes: any) => {
      graph.setNodeAttribute(node, 'x', circularPositions[node]['x']);
      graph.setNodeAttribute(node, 'y', circularPositions[node]['y']);
      // console.log(node, attributes.x, attributes.y);
    })

    // forceAtlas2.assign(this.graph, {iterations: 500});
    const sensibleSettings = settings ? settings : forceAtlas2.inferSettings(graph);
    const positions = forceAtlas2(graph, { 
      iterations: 100, 
      settings: sensibleSettings
    });    

    console.log('Computed Node Positions: ', positions);
    return positions;
  }

  positions(graph: Graph, settings?: LayoutSettings): Record<string, {x: number, y: number}> {
    const sensibleSettings = settings ? settings : forceAtlas2.inferSettings(graph);
    // console.log('sensibleSettings', sensibleSettings);
    const positions = forceAtlas2(graph, { 
      iterations: 5, 
      settings: sensibleSettings
    });
    return positions;
  }
}
