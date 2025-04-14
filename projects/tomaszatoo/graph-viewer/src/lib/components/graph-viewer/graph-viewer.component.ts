import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  EventEmitter,
  Output,
  OnDestroy
} from '@angular/core';
// uuid
import { v4 as uuidv4 } from 'uuid';
// pixi
import { Application, Ticker, Container, FederatedPointerEvent } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
// interfaces
import {
  GraphNodeAttributes,
  NodePointerEvent,
  EdgePointerEvent,
  GraphLayoutSettings,
  GraphVisualizerOptions,
  Point,
  GraphEdgeAttributes,
} from '../../models/graph-types'; 
// wrappers
import { EdgeWrapper } from '../../models/edge-wrapper';
import { NodeWrapper } from '../../models/node-wrapper';
// graphology
import Graph from 'graphology';
import { singleSource } from 'graphology-shortest-path/unweighted';
import { GraphEngineService } from '../../services/graph-engine/graph-engine.service';
import { GraphData } from '../../models/graph-types';



@Component({
  selector: 'graph-viewer',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './graph-viewer.component.html',
  styleUrl: './graph-viewer.component.scss'
})
export class GraphViewerComponent implements AfterViewInit, OnDestroy {
  // main and only container
  @ViewChild('container') containerRef!: ElementRef;
  // output emitters
  @Output() onNodeSelectChange: EventEmitter<NodePointerEvent> = new EventEmitter();
  @Output() onNodeHighlightChange: EventEmitter<NodePointerEvent> = new EventEmitter();
  @Output() onEdgeSelectChange: EventEmitter<EdgePointerEvent> = new EventEmitter();
  @Output() onEdgeHighlightChange: EventEmitter<EdgePointerEvent> = new EventEmitter();
  @Output() graphInitialised: EventEmitter<Graph> = new EventEmitter();
  @Output() graphUpdated: EventEmitter<Graph> = new EventEmitter();
  @Output() onDestroy: EventEmitter<boolean> = new EventEmitter();
  // @Output() onError: EventEmitter<Error> = new EventEmitter();

  // inputs
  @Input() options: GraphVisualizerOptions = {
    backgroundColor: 0x000000,
    backgroundAlpha: 1.0
  }
  @Input() set graphData(data: GraphData | Graph) {
    if (data instanceof Graph) {
      this.graph = data.copy();
    } else {
      const g = this.graphEngine.loadGraph(data);
      if (g) this.graph = g;
    }
  };
  @Input() nodeRenderer?: (params: { node: string; attributes: GraphNodeAttributes, position: Point }) => NodeWrapper;
  @Input() edgeRenderer?: (params: {
    edge: string;
    source: string;
    target: string;
    attributes: GraphEdgeAttributes;
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

  @Input() set toggleNodeSelection(node: string | undefined | null) {
    if (node && this.nodeGraphicsStorage[node]) {
      this._toggleNodeSelection(node);
    }
  }

  @Input() set toggleNodeHighlight(node: string | undefined | null) {
    if (node && this.nodeGraphicsStorage[node]) {
      this._toggleNodeHighlight(node);
    }
  }

  @Input() set toggleEdgeSelection(edge: string | undefined | null) {
    if (edge && this.edgeGraphicsStorage[edge]) {
      this._toggleEdgeSelection(edge);
    }
  }

  @Input() set toggleEdgeHighlight(edge: string | undefined | null) {
    if (edge && this.edgeGraphicsStorage[edge]) {
      this._toggleEdgeHighlight(edge);
    }
  }

  @Input() set animate(animate: boolean) {
    this._animate = animate;
  }
  @Input() set layoutSettings(settings: GraphLayoutSettings) {
    if (settings) {
      // this.graphEngine.layoutSettings = settings;
      this._layoutSettings = settings;
    }
  }
  get animate(): boolean {
    return this._animate;
  }

  @Input() set addNodes(nodes: Record<string, GraphNodeAttributes> | null) {
    if (!this.graph || !nodes) return;
  
    for (const [nodeKey, nodeAttrs] of Object.entries(nodes)) {
      this.graph.addNode(nodeKey, nodeAttrs);
    }
  
    this.refreshGraph(this.graph);
  }
  
  @Input() set addEdges(
    edges: ReadonlyArray<{
      source: string;
      target: string;
      attributes: GraphEdgeAttributes;
    }> | null
  ) {
    if (!this.graph || !edges?.length) return;
  
    for (const { source, target, attributes } of edges) {
      if (this.graph.hasNode(source) && this.graph.hasNode(target)) {
        this.graph.addEdge(source, target, attributes);
      }
    }
  
    this.refreshGraph(this.graph);
  }
  
  @Input() set dropNodes(nodes: ReadonlyArray<string> | null) {
    if (!this.graph || !nodes?.length) return;
  
    for (const node of nodes) {
      if (this.graph.hasNode(node)) {
        this.graph.dropNode(node);
      }
    }
  
    this.refreshGraph(this.graph);
  }
  
  @Input() set dropEdges(edges: ReadonlyArray<string> | null) {
    if (!this.graph || !edges?.length) return;
  
    for (const edge of edges) {
      if (this.graph.hasEdge(edge)) {
        this.graph.dropEdge(edge);
      }
    }
  
    this.refreshGraph(this.graph);
  }
  
  // Optional helper method
  private refreshGraph(graph: Graph): void {
    this.updateGraph(graph);
    this.graphUpdated.emit(graph);
  }



  graphViewerId: string = `graph-${uuidv4()}`;

  private graph!: Graph | null | undefined;
  private app!: Application;
  private viewport!: Viewport;
  private graphContainer: Container = new Container({interactive: true});
  private edgesContainer: Container = new Container();
  private nodesContainer: Container = new Container();
  private _animate: boolean = false;
  private _fullscreen: boolean = false;
  private _layoutSettings!: GraphLayoutSettings;
  // private _selection: string[] = [];
  private dragStartPos: { x: number; y: number } | null = null;

  
  private degrees: Record<string, number> = {};
  private maxDegree: number = 0;
  private minSize = 10;
  private maxSize = 50;


  private nodeGraphicsStorage: Record<string, NodeWrapper> = {};
  private edgeGraphicsStorage: Record<string, EdgeWrapper> = {};

  private dragTarget: {nodeGfx: NodeWrapper, node: string } | null = null;

  private needsRender: boolean = false;

  constructor(
    private graphEngine: GraphEngineService
  ) {
    this.graphContainer.addChild(this.edgesContainer);
    this.graphContainer.addChild(this.nodesContainer);
  }

  

  ngAfterViewInit() {
    // init pixi app
    this.app = new Application();
    this.app.init({
      resizeTo: this.containerRef.nativeElement,
      // width: this.containerRef.nativeElement.getBoundingClientRect().width,
      // height: this.containerRef.nativeElement.getBoundingClientRect().height,
      background: this.options.backgroundColor,
      antialias: true,
      clearBeforeRender: true,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      backgroundAlpha: this.options.backgroundAlpha
    }).then(() => {
      // fullscreen change
      this.containerRef.nativeElement.addEventListener('fullscreenchange', this.fullsScreenHanlder.bind(this));
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
      // console.log('app initialised', this.app);
      this.containerRef.nativeElement.appendChild(this.app.canvas);
      // setup viewport
      this.viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
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
        // this.graph.on('nodeAttributesUpdated', () => this.needsRender = true);
        this.renderGraph(this.graph); // move rendering here
        this.startAnimation();
      }
      
    });
  }

  private fullsScreenHanlder(e: any): void {
    // console.log('FULLSCREEN CHANGED', e);
    if (!document.fullscreenElement) {
      this.viewport.plugins.pause('wheel');
      this.app.resize();
      this.viewport.resize();
    }
  }

  ngOnDestroy(): void {
   this.containerRef.nativeElement.removeEventListener('fullscreenchange', this.fullsScreenHanlder);
   // this.app.stage.off('pointerup', this.onDragEnd);
   // this.app.stage.off('pointerupoutside', this.onDragEnd);
   this.app.stage.removeAllListeners();
   this.viewport.removeAllListeners();
   for (const id in this.edgeGraphicsStorage) {
    const edgeGfx = this.edgeGraphicsStorage[id];
    edgeGfx.removeAllListeners();
   }
   for (const id in this.nodeGraphicsStorage) {
    const nodeGfx = this.nodeGraphicsStorage[id];
    nodeGfx.removeAllListeners();
   }
   if(this.graph) this.graph.clear();
   this.graph = null;
   this.edgeGraphicsStorage = {};
   this.nodeGraphicsStorage = {};
   this.app.destroy();
   this.onDestroy.emit(true);
  }

  private renderGraph(graph: Graph, initial: boolean = true) {
    this.nodeGraphicsStorage = {};
    this.edgeGraphicsStorage = {};
    this.nodesContainer.removeChildren();
    this.edgesContainer.removeChildren();
    // count maxDegree
    // this.maxDegree = graph.nodes().length;
    graph.forEachNode((node) => {
      const degree = graph.degree(node); // total degree (can split in/out if needed)
      this.degrees[node] = degree;
      if (degree > this.maxDegree) this.maxDegree = degree;
    });
    // get graph initial positions
    const positions = initial ? 
      this.graphEngine.initPositions(graph, this._layoutSettings) :
      this.graphEngine.positions(graph, this._layoutSettings);
    // render nodes
    graph.forEachNode((node, attributes) => {
      // if (!this.nodeGraphicsStorage[node])
      this.createNodeGfx(node, attributes as GraphNodeAttributes, positions, graph);
    }); 
    // render edges
    graph.forEachEdge((edge, attributes, source, target) => {
      this.createEdgeGfx(edge, attributes, source, target, positions, graph);
    });

    if (initial) this.graphInitialised.emit(graph);
  }

  private updateGraph(graph: Graph) {
    this.renderGraph(graph, false);
  }

  private createNodeGfx(node: string, attributes: GraphNodeAttributes, positions: any, graph: Graph): void {
    const pos = positions[node];
    const attrs = attributes as GraphNodeAttributes;
    // set node size
    const radius = this.countNodeRadius(node, graph);
    graph.setNodeAttribute(node, 'radius', radius);
    // create node graphics / default or set by user
    const nodeGraphic = this.nodeRenderer
      ? this.nodeRenderer({ node, attributes: attrs, position: pos })
      : this.defaultNodeRenderer(node, attrs, pos);
    this.nodesContainer.addChild(nodeGraphic);
    // add basic interactions
    this.addNodeInteractions(nodeGraphic, node, attributes, pos);
    
    // save to node storage
    this.nodeGraphicsStorage[node] = nodeGraphic;
  }

  private countNodeRadius(node: string, graph: Graph): number {
    // TODO: better counting size based on deggre
    const nodeCount = graph.order;
    const edgeCount = graph.size;
    const scalingFactor = 1 / Math.log2(nodeCount + edgeCount + 2); // +2 to avoid div by 0
    const degree = graph.degree(node); //this.degrees[node];
    const normalized = degree / this.maxDegree;
   //  const minSize = Math.max(this.minSize, attributes['radius'] ? attributes['radius'] : 0);
    const size = /* attributes && attributes['radius'] ? attributes['radius'] :  */this.minSize + (this.maxSize - this.minSize) * normalized * scalingFactor;
    return size;
  }

  private createEdgeGfx(edge: string, attributes: GraphEdgeAttributes, source: string, target: string, positions: any, graph: Graph): void {
    const sourcePos = positions[source];
    const targetPos = positions[target];
    const targetSize = graph.getNodeAttribute(target, 'radius') || 10;
    const edgeGraphic = this.edgeRenderer
      ? this.edgeRenderer({ edge, source, target, attributes })
      : this.defaultEdgeRenderer(edge, attributes, sourcePos, targetPos, targetSize, graph);
    this.edgesContainer.addChild(edgeGraphic);
    this.edgeGraphicsStorage[edge] = edgeGraphic;
    // interaction
    this.addEdgeInteractions(edgeGraphic, edge, attributes, source, target);
  }

  private startAnimation(): void {
    
    this.app.ticker.add((ticker: Ticker) => {
      // animate only if animate true and graph present
      if (this.animate && this.graph) { // if needsRender not works well, but it saves power
        const positions = this.graphEngine.positions(this.graph, this._layoutSettings);
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

  private defaultNodeRenderer(node: string, attributes: GraphNodeAttributes, pos: { x: number; y: number }): NodeWrapper {
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
    targetSize: number,
    graph: Graph
  ): EdgeWrapper {
    const s = graph.source(edge);
    const t = graph.target(edge);

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
        const selected = this._toggleNodeSelection(node);
        const nodeEvent: NodePointerEvent = {
          id: node,
          attributes: attributes,
          position: position,
          event: e,
          selected: selected
        }
        
        this.onNodeSelectChange.emit(nodeEvent);
      } 
    });

    nodeGfx.on('pointerover', (e: FederatedPointerEvent) => {
      nodeGfx.highlight = true;
      const nodeEvent: NodePointerEvent = {
        id: node,
        attributes: attributes,
        position: position,
        event: e,
        highlighted: true
      }
      
      this.onNodeHighlightChange.emit(nodeEvent);
    });

    nodeGfx.on('pointerout', (e: FederatedPointerEvent) => {
      nodeGfx.highlight = false;
      const nodeEvent: NodePointerEvent = {
        id: node,
        attributes: attributes,
        position: position,
        event: e,
        highlighted: false
      }
      this.onNodeHighlightChange.emit(nodeEvent);
    })

    // drag
    nodeGfx.on('pointerdown', (event: FederatedPointerEvent) => {
      this.dragStartPos = { x: event.global.x, y: event.global.y };
      this.onDragStart(nodeGfx, node);
    });
  }

  private _toggleNodeSelection(node: string): boolean {
    const nodeGfx = this.nodeGraphicsStorage[node];
    nodeGfx.select = !nodeGfx.select;
    return nodeGfx.select;
    // console.log('nodeGfx.selected', nodeGfx.selected);
    // if (nodeGfx.select && !this._selection.includes(node)) {
    //   const paths = singleSource(this.graph, node);
    //   console.warn('TODO: ', '-> Returning every shortest path between source & every node of the graph', paths);
    //   this._selection.push(node);
    //   this.onSelectionChange.emit(this._selection);
    // } else {
    //   if (this._selection.includes(node)) {
    //     // remove from selection
    //     this._selection.splice(this._selection.indexOf(node), 1);
    //     this.onSelectionChange.emit(this._selection);
    //   }
    // }
  }

  private _toggleNodeHighlight(node: string): boolean {
    const nodeGfx = this.nodeGraphicsStorage[node];
    nodeGfx.highlight = !nodeGfx.highlight;
    return nodeGfx.highlight;
  }

  private _toggleEdgeSelection(edge: string): boolean {
    const edgeGfx = this.edgeGraphicsStorage[edge];
    edgeGfx.select = !edgeGfx.select;
    return edgeGfx.select;
  }

  private _toggleEdgeHighlight(edge: string): boolean {
    const edgeGfx = this.edgeGraphicsStorage[edge];
    edgeGfx.highlight = !edgeGfx.highlight;
    return edgeGfx.highlight;
  }

  // dragging nodes
  private onDragStart(nodeGfx: NodeWrapper, node: string): void {
    this.dragTarget = {nodeGfx: nodeGfx, node: node};
    // console.log('dragStart', this.dragTarget);
    this.viewport.plugins.pause('drag');
    this.app.stage.on('pointermove', this.onDragMove.bind(this));
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (this.dragTarget) {
      // console.log('dragMove', this.dragTarget);
      const position = this.dragTarget.nodeGfx && this.dragTarget.nodeGfx.parent ? this.dragTarget.nodeGfx.parent.toLocal(event.global, undefined, this.dragTarget.nodeGfx.position) : null;
      if (this.graph && position) this.graph.setNodeAttribute(this.dragTarget.node, 'x', position.x /* this.dragTarget.nodeGfx.x */);
      if (this.graph && position) this.graph.setNodeAttribute(this.dragTarget.node, 'y', position.y /* this.dragTarget.nodeGfx.y */);
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

  private addEdgeInteractions(edgeGfx: EdgeWrapper, edge: string, attributes: any, source: string, target: string): void {
    edgeGfx.on('click', (e: FederatedPointerEvent) => {
      const selected = this._toggleEdgeSelection(edge);
      const edgeEvent: EdgePointerEvent = {
        id: edge,
        attributes: attributes,
        source: source,
        target: target,
        event: e,
        selected: selected
      }
      this.onEdgeSelectChange.emit(edgeEvent);
    });
    edgeGfx.on('pointerover', (e: FederatedPointerEvent) => {
      edgeGfx.highlight = true; 
      const edgeEvent: EdgePointerEvent = {
        id: edge,
        attributes: attributes,
        source: source,
        target: target,
        event: e,
        highlighted: true
      }
      this.onEdgeHighlightChange.emit(edgeEvent);
    });
    edgeGfx.on('pointerout', (e: FederatedPointerEvent) => {
      edgeGfx.highlight = false;
      const edgeEvent: EdgePointerEvent = {
        id: edge,
        attributes: attributes,
        source: source,
        target: target,
        event: e,
        highlighted: false
      }
      this.onEdgeHighlightChange.emit(edgeEvent);
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
        // console.log('isClick');
        return true;
      } else { // its a drag end
        // console.log('isDragEnd');
        return false;
      }      
    }
    this.dragStartPos = null;
    return true;
  }

}
