import { Component, OnInit } from '@angular/core';
// @tomaszatoo/graph-visualizer
import { GraphViewerComponent, GraphLayoutSettings, GraphVisualizerOptions } from '@tomaszatoo/graph-viewer';
import { Graphics } from 'pixi.js';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [ GraphViewerComponent ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss'
})
export class GraphComponent implements OnInit {
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
  ) { }

  ngOnInit() {
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this.fullscreen = false;
      }
    });

    // setTimeout(() => {
    //   this.selectedNode = 'e';
    // }, 5000);
    // setTimeout(() => {
    //   this.selectedNode = 'g';
    // }, 10000);
    // setTimeout(() => {
    //   this.selectedNode = 'h';
    // }, 15000);
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
