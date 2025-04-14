import { Component, OnInit } from '@angular/core';
// @tomaszatoo/graph-viewer
import { GraphViewerComponent, GraphLayoutSettings, GraphVisualizerOptions, GraphNodeAttributes, GraphEdgeAttributes } from '@tomaszatoo/graph-viewer';
import { Graphics } from 'pixi.js';
// graphology
import Graph from 'graphology';
import florentineFamilies from 'graphology-generators/social/florentine-families';
import clusters from 'graphology-generators/random/clusters';
import ladder from 'graphology-generators/classic/ladder';
import { v4 as uuidv4 } from 'uuid';
// rxjs
import { Subject } from 'rxjs';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [ GraphViewerComponent ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss'
})
export class GraphComponent implements OnInit {
  
  initialGraph!: Graph;
  graph!: Graph;
  
  // Define renderers as class properties to bind via Input
  graphData = {
    nodes: [
      { id: 'e', attributes: { label: 'Node E', x: 1, y: 1 } },
      { id: 'f', attributes: { label: 'Node F', x: 1, y: 1 } },
      { id: 'g', attributes: { label: 'Node G', x: 1, y: 1 } },
      { id: 'h', attributes: { label: 'Node H', x: 1, y: 1 } }
    ],
    edges: [
      { source: 'f', target: 'e', attributes: { label: "follow", width: 2, color: 0x30D973 }},
      /* { source: 'f', target: 'e', attributes: { label: "follow", width: 2, color: 0xff0000 }}, */ // not works with multi: false (solve by attributes (add to already existing))
      { source: 'h', target: 'e', attributes: { label: "follow", width: 2, color: 0x30D973 }},
      { source: 'h', target: 'h', attributes: { label: "follow", width: 2, color: 0x30D973 }},
      { source: 'h', target: 'f', attributes: { label: "follow", width: 2, color: 0x30D973 }}
    ],
  };
  renderNode = this.createNodeRenderer();
  renderEdge = this.createEdgeRenderer();

  fullscreen: boolean = false;
  selectNode: string = '';
  selectEdge: string = '';
  hightlightNode: string = '';
  hightlightEdge: string = '';
  addNodes: Record<string, GraphNodeAttributes> | null = null;
  addEdges: {source: string, target: string, attributes: GraphEdgeAttributes}[] | null = null;
  dropNodes: string[] | null = null;
  dropEdges: string[] | null = null;

  layoutSettings: GraphLayoutSettings = {
    adjustSizes: true,
    barnesHutOptimize: false,
    barnesHutTheta: 0.5,
    edgeWeightInfluence: 1,
    gravity: .1,
    linLogMode: true,
    outboundAttractionDistribution: true,
    scalingRatio: 50,
    slowDown: 2,
    strongGravityMode: true // very effective
  }

  constructor(
    // private graphEngine: GraphEngineService
  ) {
    const g: Graph = ladder(Graph, 20);
    g.forEachNode((node) => {
      g.setNodeAttribute(node, 'label', node);
    });
    g.forEachEdge((edge) => {
      g.setEdgeAttribute(edge, 'label', edge);
    })
    this.initialGraph = g;
  }

  ngOnInit() {
    
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this.fullscreen = false;
      }
    });

    setInterval(() => {
      // const nodes = [];
      if (this.graph) {
        const randomNode = () => {
          return this.graph.nodes()[this.getRandomInteger(0, this.graph.nodes().length)];
        }
        const randomEdge = () => {
          return this.graph.edges()[this.getRandomInteger(0, this.graph.edges().length)];
        }
        // dropping
        // nodes
        const node = randomNode();
        this.dropNodes = null;
        this.dropNodes = [node];
        // edges
        const edge = randomEdge();
        console.log('randomEdge source', this.graph.source(edge));
        console.log('randomEdge target', this.graph.target(edge));
        this.dropEdges = null;
        this.dropEdges = [edge];

        // adding
        const nodes = {};
        const edges = [];
        for (let i = 0; i < 5; i++) {
          const id = uuidv4();

          nodes[id as keyof Object] = { x: 1, y: 1, label: `DYN NODE`} as any;
          edges.push({target: randomNode(), source: id, attributes: {label: 'DYN EDGE'}})
        }
        // console.log('temp', temp);
        this.addNodes = nodes;
        this.addEdges = edges;
      
        console.log('graph is set...');
        
      }
      

    }, 5000);

    // setInterval(() => {
    //   const nodes = this.graph.nodes();
    //   const randomNode = nodes[this.getRandomInteger(0, nodes.length)];
    //   this.selectNode = randomNode;
    // }, 5000);
// 
    // setInterval(() => {
    //   const nodes = this.graph.nodes();
    //   const randomNode = nodes[this.getRandomInteger(0, nodes.length)];
    //   this.hightlightNode = randomNode;
    // }, 2000);
// 
    // setInterval(() => {
    //   const edges = this.graph.edges();
    //   const randomEdge = edges[this.getRandomInteger(0, edges.length)];
    //   this.selectEdge = randomEdge;
    // }, 5000);
// 
    // setInterval(() => {
    //   const edges = this.graph.edges();
    //   const randomEdge = edges[this.getRandomInteger(0, edges.length)];
    //   this.hightlightEdge = randomEdge;
    // }, 2000);

  }

  graphUpdated(graph: Graph): void {
    if (this.graph) this.graph.clear();
    this.graph = graph.copy();
    console.log('GRAPH UPDATED', graph);
  }

  createNodeRenderer() {
    return ({ attributes, position }: any) => {
      const g = new Graphics();
      console.log('createNodeRenderer position', position);
      console.log('attributes', attributes);
      // console.log('layout', this.layout);
      g.circle(0, 0, 10).setFillStyle({color: attributes.color || 0x00ffff}).fill();
      console.log('nodeRenderer', g);
      return g;
    };
  }

  createEdgeRenderer() {
    return ({ source, target, attributes }: any) => {
      const g = new Graphics();
      g.setStrokeStyle({ width: attributes.width || 1, color: 0xffffff, alpha: 0.4 });
      g.moveTo(0, 0);
      g.lineTo(50, 50); // you’d actually use layout positions, this is just demo
      g.stroke();
      console.log('edgeRenderer', g);
      return g;
    };
  }

  toggleFullscreen(): void {
    this.fullscreen = !this.fullscreen;
  }

  log(key: any, value: any): void {
    console.log(key, value);
  }

  private getRandomInteger(minValue: number, maxValue: number): number {
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
  }

}
