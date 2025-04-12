import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  EventEmitter,
  Output
} from '@angular/core';
// uuid
import { v4 as uuidv4 } from 'uuid';
// pixi
import { Application, Ticker, Container, FederatedPointerEvent } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
// wrappers
import { EdgeWrapper } from '../../models/edge-wrapper';
import { NodeWrapper } from '../../models/node-wrapper';
// graphology
import Graph from 'graphology';
import { singleSource } from 'graphology-shortest-path/unweighted';
import { GraphEngineService, LayoutSettings } from '../../services/graph-engine/graph-engine.service';
import { GraphData } from '../../models/graph-types';

export interface NodePointerEvent {
  id: string,
  attributes: any,
  position: {x: number, y: number},
  event: FederatedPointerEvent
}

export interface EdgePointerEvent {
  id: string,
  attributes: any,
  source: string,
  target: string,
  event: FederatedPointerEvent
}

@Component({
  selector: 'graph-viewer',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './graph-viewer.component.html',
  styleUrl: './graph-viewer.component.scss'
})
export class GraphViewerComponent implements AfterViewInit {
  // main and only container
  @ViewChild('container') containerRef!: ElementRef;
  // output emitters
  @Output() nodeClick: EventEmitter<NodePointerEvent> = new EventEmitter();
  @Output() nodeOver: EventEmitter<NodePointerEvent> = new EventEmitter();
  @Output() edgeClick: EventEmitter<EdgePointerEvent> = new EventEmitter();
  @Output() edgeOver: EventEmitter<EdgePointerEvent> = new EventEmitter();
  @Output() graphInitialised: EventEmitter<Graph> = new EventEmitter();
  @Output() onSelectionChange: EventEmitter<string[]> = new EventEmitter();
  // inputs
  @Input() set graphData(data: GraphData | Graph) {
    if (data instanceof Graph) {
      this.graph = data.copy();
    } else {
      const g = this.graphEngine.loadGraph(data);
      if (g) this.graph = g;
    }
  };
  @Input() nodeRenderer?: (params: { node: string; attributes: any, position: any }) => NodeWrapper;
  @Input() edgeRenderer?: (params: {
    edge: string;
    source: string;
    target: string;
    attributes: any;
  }) => EdgeWrapper;

  @Input() set fullscreen(request: boolean) {
    this._fullscreen = request;
    if (request) {
      this.containerRef.nativeElement.requestFullscreen()
      .then(() => {
        this.viewport.plugins.resume('wheel');
        this.app.resize();
        this.viewport.resize();
      })
      .catch((e: any) => console.error(e));
    } // else nothing
  }

  get fullscreen() {
    return this._fullscreen;
  }

  @Input() set select(node: string | undefined | null) {
    if (node && this.nodeGraphicsStorage[node]) {
      this.selectNode(node);
    }
  } 

  @Input() set animate(animate: boolean) {
    this._animate = animate;
  }
  @Input() set layoutSettings(settings: LayoutSettings) {
    if (settings) {
      // this.graphEngine.layoutSettings = settings;
      this._layoutSettings = settings;
    }
  }
  get animate(): boolean {
    return this._animate;
  }

  graphViewerId: string = `graph-${uuidv4()}`;

  private graph!: Graph;
  private app!: Application;
  private viewport!: Viewport;
  private graphContainer: Container = new Container({interactive: true});
  private edgesContainer: Container = new Container();
  private nodesContainer: Container = new Container();
  private _animate: boolean = false;
  private _fullscreen: boolean = false;
  private _layoutSettings!: LayoutSettings;
  private _selection: string[] = [];
  private dragStartPos: { x: number; y: number } | null = null;

  
  private degrees: Record<string, number> = {};
  private maxDegree: number = 0;
  private minSize = 10;
  private maxSize = 30;

  constructor(
    private graphEngine: GraphEngineService
  ) {
    this.graphContainer.addChild(this.edgesContainer);
    this.graphContainer.addChild(this.nodesContainer);
  }

  private nodeGraphicsStorage: any = {};
  private edgeGraphicsStorage: any = {};

  private dragTarget: {nodeGfx: Container, node: string } | null = null;

  private needsRender: boolean = false;

  ngAfterViewInit() {
    // init pixi app
    this.app = new Application();
    this.app.init({
      resizeTo: this.containerRef.nativeElement,
      // width: this.containerRef.nativeElement.getBoundingClientRect().width,
      // height: this.containerRef.nativeElement.getBoundingClientRect().height,
      background: 0x000000,
      antialias: true,
      clearBeforeRender: true,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      // backgroundAlpha: 0.0
    }).then(() => {
      // fullscreen change
      this.containerRef.nativeElement.addEventListener('fullscreenchange', (e: any) => {
        console.log('FULLSCREEN CHANGED', e);
        if (!document.fullscreenElement) {
          this.viewport.plugins.pause('wheel');
          this.app.resize();
          this.viewport.resize();
        }
      });
      // listen to resize
      // window.addEventListener('resize', () => {
      //   if (!this.fullscreen) {
      //     this.app.resize();
      //     this.viewport.resize();
      //     // this.app.renderer.resize(
      //     //   this.containerRef.nativeElement.getBoundingClientRect().width,
      //     //   this.containerRef.nativeElement.getBoundingClientRect().width
      //     // )
      //   }
      //   // this.viewport.fitWidth(this.containerRef.nativeElement.getBoundingClientRect().width);
      //   // this.app.resizeTo = this.containerRef.nativeElement;
      //   // this.app.renderer.resize(window.innerWidth, window.innerHeight);
      // });
      console.log('app initialised', this.app);
      this.containerRef.nativeElement.appendChild(this.app.canvas);
      // setup viewport
      this.viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerWidth,
        worldWidth: this.containerRef.nativeElement.getBoundingClientRect().width,
        worldHeight: this.containerRef.nativeElement.getBoundingClientRect().height,
        events: this.app.renderer.events
      });
      // setup stage
      this.app.stage.eventMode = 'static';
      this.app.stage.hitArea = this.app.screen;
      this.app.stage.on('pointerup', this.onDragEnd.bind(this));
      this.app.stage.on('pointerupoutside', this.onDragEnd.bind(this));
      // add viewport
      this.app.stage.addChild(this.viewport);
      // center graph
      this.graphContainer.width = this.app.canvas.width;
      this.graphContainer.height = this.app.canvas.height;
      this.graphContainer.position = {
        x: (this.app.canvas.width / window.devicePixelRatio) / 2, 
        y: (this.app.canvas.height / window.devicePixelRatio) / 2};
      // add graph container to viewport
      this.viewport.addChild(this.graphContainer);
      // activate viewport plugins
      this.viewport.drag().wheel()
      /* .clampZoom({
        minWidth: 300,
        minHeight: 300,
        maxWidth: 1000,
        maxHeight: 1000,
      }); */
      this.viewport.fitWorld(true);
      this.viewport.plugins.pause('wheel');
      // this.viewport.zooming = false;
      // if graph, render and
      if (this.graph) {
        this.graph.on('nodeAttributesUpdated', () => this.needsRender = true);
        this.renderGraph(this.graph); // move rendering here
        this.startAnimation();
      }
      
    });
  }

  private renderGraph(graph: Graph) {
    // count maxDegree
    this.graph.forEachNode((node) => {
      const degree = this.graph.degree(node); // total degree (can split in/out if needed)
      this.degrees[node] = degree;
      if (degree > this.maxDegree) this.maxDegree = degree;
    });
    // get graph initial positions
    const positions = this.graphEngine.initPositions(graph, this._layoutSettings);
    // render nodes
    graph.forEachNode((node, attributes) => {
      const pos = positions[node];
      // set node size
      const nodeCount = this.graph.order;
      const edgeCount = this.graph.size;
      const scalingFactor = 1 / Math.log2(nodeCount + edgeCount + 2); // +2 to avoid div by 0
      const degree = this.degrees[node];
      const normalized = degree / this.maxDegree;
      const size = this.minSize + (this.maxSize - this.minSize) * normalized * scalingFactor;
      this.graph.setNodeAttribute(node, 'size', size);
      // create node graphics / default or set by user
      const nodeGraphic = this.nodeRenderer
        ? this.nodeRenderer({ node, attributes, position: pos })
        : this.defaultNodeRenderer(node, attributes, pos);
      this.nodesContainer.addChild(nodeGraphic);
      // add basic interactions
      this.addNodeInteractions(nodeGraphic, node, attributes, pos);
    
      // save to node storage
      this.nodeGraphicsStorage[node] = nodeGraphic;
    }); 
    // render edges
    graph.forEachEdge((edge, attributes, source, target) => {
      const sourcePos = positions[source];
      const targetPos = positions[target];
      const targetSize = this.graph.getNodeAttribute(target, 'size') || 10;
      const edgeGraphic = this.edgeRenderer
        ? this.edgeRenderer({ edge, source, target, attributes })
        : this.defaultEdgeRenderer(edge, attributes, sourcePos, targetPos, targetSize);
      this.edgesContainer.addChild(edgeGraphic);
      this.edgeGraphicsStorage[edge] = edgeGraphic;
      // interaction
      this.addEdgeInteractions(edgeGraphic, edge, attributes, source, target);
    });

    this.graphInitialised.emit(this.graph);
  }

  private startAnimation(): void {
    
    this.app.ticker.add((ticker: Ticker) => {
      // console.log('app tick', this.graphViewerId);
      // this.app.render();
      if (this.animate && this.graph && this.needsRender) { // if needsRender not works well, but it saves power
        // const graph = this.graphEngine.getGraph();
        const positions = this.graphEngine.positions(this.graph, this._layoutSettings);
        // console.log('calculated positions', positions);
        // update nodes position
        for (const node of this.graph.nodes()) {
          // update graph
          if (this.dragTarget && this.dragTarget.node === node) {
            // don't set position to dragged node
          } else {
            this.graph.setNodeAttribute(node, 'x', positions[node].x);
            this.graph.setNodeAttribute(node, 'y', positions[node].y);
          }
          // update positions of graphics
          this.nodeGraphicsStorage[node].updateNodePosition({
            x: positions[node].x,
            y: positions[node].y
          })
          // this.nodeGraphicsStorage[node].x = positions[node].x;
          // this.nodeGraphicsStorage[node].y = positions[node].y;
          // console.log(this.nodeGraphicsStorage[node].x);
        }
        // update edges position
        for (const edge of this.graph.edges()) {
          // get source/target nodes
          const sourceGfx: Container = this.nodeGraphicsStorage[this.graph.source(edge)];
          const targetGfx: Container = this.nodeGraphicsStorage[this.graph.target(edge)];
          // edge graphics
          const edgeContainer: EdgeWrapper = this.edgeGraphicsStorage[edge];
          edgeContainer.updateEdgePosition({
            source: {x: sourceGfx.x, y: sourceGfx.y},
            target: {x: targetGfx.x, y: targetGfx.y}
          });          
        }
        // this.needsRender = false;    
      }  
    });    
  }

  private defaultNodeRenderer(node: string, attributes: any, pos: { x: number; y: number }): NodeWrapper {
    // Global scaling factor to tame large graphs
    
    const n: NodeWrapper = new NodeWrapper(
      node,
      pos,
      attributes
    );
    return n;
  }

  private defaultEdgeRenderer(
    edge: string,
    attributes: any,
    source: { x: number; y: number },
    target: { x: number; y: number },
    targetSize: number
  ): EdgeWrapper {
    const s = this.graph.source(edge);
    const t = this.graph.target(edge);

    const e: EdgeWrapper = new EdgeWrapper(
      edge,
      { source: {x: source.x, y: source.y}, target: {x: target.x, y: target.y}},
      attributes,
      targetSize,
      s === t ? true : false // selfloop
    );
    return e;
  }

  private addNodeInteractions(nodeGfx: NodeWrapper, node: string, attributes: any, position: any): void {
    nodeGfx.on('pointerup', (e: FederatedPointerEvent) => {
      if (this.isClick(e)) {
        const nodeEvent: NodePointerEvent = {
          id: node,
          attributes: attributes,
          position: position,
          event: e
        }
        this.selectNode(node);
        this.nodeClick.emit(nodeEvent);
      } 
    });

    nodeGfx.on('pointerover', (e: FederatedPointerEvent) => {
      const nodeEvent: NodePointerEvent = {
        id: node,
        attributes: attributes,
        position: position,
        event: e
      }
      this.nodeOver.emit(nodeEvent);
    });

    // drag
    nodeGfx.on('pointerdown', (event: FederatedPointerEvent) => {
      this.dragStartPos = { x: event.global.x, y: event.global.y };
      this.onDragStart(nodeGfx, node);
    });
  }

  private selectNode(node: string): void {
    const nodeGfx = this.nodeGraphicsStorage[node];
    nodeGfx.selected = !nodeGfx.selected;
    // console.log('nodeGfx.selected', nodeGfx.selected);
    if (nodeGfx.selected && !this._selection.includes(node)) {
      const paths = singleSource(this.graph, node);
      console.log(node, '-> Returning every shortest path between source & every node of the graph', paths);
      this._selection.push(node);
      this.onSelectionChange.emit(this._selection);
    } else {
      if (this._selection.includes(node)) {
        // remove from selection
        this._selection.splice(this._selection.indexOf(node), 1);
        this.onSelectionChange.emit(this._selection);
      }
    }
  }

  // dragging nodes
  private onDragStart(nodeGfx: Container, node: string): void {
    this.dragTarget = {nodeGfx: nodeGfx, node: node};
    // console.log('dragStart', this.dragTarget);
    this.viewport.plugins.pause('drag');
    this.app.stage.on('pointermove', this.onDragMove.bind(this));
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (this.dragTarget) {
      // console.log('dragMove', this.dragTarget);
      const position = this.dragTarget.nodeGfx.parent.toLocal(event.global, undefined, this.dragTarget.nodeGfx.position);
      this.graph.setNodeAttribute(this.dragTarget.node, 'x', position.x /* this.dragTarget.nodeGfx.x */);
      this.graph.setNodeAttribute(this.dragTarget.node, 'y', position.y /* this.dragTarget.nodeGfx.y */);
      // console.log('position', position);
    }
  }

  private onDragEnd(event: FederatedPointerEvent): void {
    if (this.dragTarget && !this.isClick(event)) {
      this.viewport.plugins.resume('drag');
      this.app.stage.off('pointermove', this.onDragMove);
    }
    this.dragTarget = null;
  }

  private addEdgeInteractions(edgeGfx: Container, edge: string, attributes: any, source: string, target: string): void {
    edgeGfx.on('click', (e: FederatedPointerEvent) => {
      const edgeEvent: EdgePointerEvent = {
        id: edge,
        attributes: attributes,
        source: source,
        target: target,
        event: e
      }
      this.edgeClick.emit(edgeEvent);
    });
    edgeGfx.on('pointerover', (e: FederatedPointerEvent) => {
      const edgeEvent: EdgePointerEvent = {
        id: edge,
        attributes: attributes,
        source: source,
        target: target,
        event: e
      }
      this.edgeOver.emit(edgeEvent);
    })
  }

  private isClick(event: FederatedPointerEvent): boolean {
    if (this.dragStartPos) {
      // console.log('dragEnd', this.dragTarget);
      const dx = event.global.x - this.dragStartPos.x;
      const dy = event.global.y - this.dragStartPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const DRAG_TRESHOLD = 5;
      if (dist < DRAG_TRESHOLD) { // its a click
        console.log('isClick');
        return true;
      } else { // its a drag end
        console.log('isDragEnd');
        return false;
      }      
    }
    this.dragStartPos = null;
    return true;
  }

}
