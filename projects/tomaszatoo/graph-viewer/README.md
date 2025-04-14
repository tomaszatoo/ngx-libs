# `GraphViewerComponent`

An Angular standalone component for rendering interactive, animated graphs using Pixi.js and Graphology.  
Designed for modularity, performance, and customizability—bring your own renderers, drive your own layout, hack the internals.

---

## 🐣 Installation
```bash
npm i @tomaszatoo/graph-viewer
``` 

## 🧩 TL;DR

- **Framework**: Angular (standalone component)
- **Rendering**: Pixi.js + `pixi-viewport`
- **Layout**: ForceAtlas2 (`graphology-layout-forceatlas2`)
- **Graph engine**: Graphology
- **Customization**: Pluggable node/edge renderers

---

## 🧠 Core Concepts

This component is built around the idea of rendering *just enough* of the graph, as fast as possible, while letting you hook into every meaningful part of the lifecycle.

All rendering is done via Pixi.js on a WebGL canvas. Interaction (hovering, dragging, selection) is mapped using Pixi’s `FederatedPointerEvent` system.

Graph logic (nodes/edges/attributes/layout) is delegated to [Graphology](https://graphology.github.io/), allowing separation of state and rendering.

---

## 🧪 Inputs

### `graphData: GraphData | Graph`
Can be:
- A raw object of the form:
  ```ts
  {
    nodes: { key: string, attributes: GraphNodeAttributes }[],
    edges: { source: string, target: string, attributes: GraphEdgeAttributes }[]
  }
  ```
- Or a ready-to-go `Graphology.Graph` instance.

### `nodeRenderer?: (params) => NodeWrapper`
Function to customize how a node is rendered. Gets:
```ts
{
  node: string,
  attributes: GraphNodeAttributes,
  position: Point
}
```
Must return a `NodeWrapper` (your custom Pixi `Container` subclass).

### `edgeRenderer?: (params) => EdgeWrapper`
Same idea, but for edges:
```ts
{
  edge: string,
  source: string,
  target: string,
  attributes: GraphEdgeAttributes
}
```
Returns an `EdgeWrapper`.

### `fullscreen: boolean`
If `true`, canvas will stretch to fit the container via viewport resize.

### `animate: boolean`
Turns on ForceAtlas2 layout animation. Layout runs in update loop.

### `layoutSettings?: GraphLayoutSettings`
Layout tuning object—passed to ForceAtlas2. Includes:
- gravity
- scalingRatio
- slowDown
- edgeWeightInfluence
- etc.

### `toggleNodeSelection: string`
Pass a node ID to programmatically toggle node selection.

### `toggleEdgeSelection: string`
Pass a edge ID to programmatically toggle edge selection.

### `toggleNodeHighlight: string`
Pass a node ID to programmatically toggle node highlight.

### `toggleEdgeHighlight: string`
Pass a edge ID to programmatically toggle edge highlight.

### `options?: GraphVisualizerOptions`
Low-level visual config:
```ts
{
  backgroundAlpha?: number;
  backgroundColor?: number;
}
```

---

## 🧯 Outputs

### `onNodeSelectChange: EventEmitter<NodePointerEvent>`
```ts
{
  node: string,
  attributes: GraphNodeAttributes,
  event: FederatedPointerEvent,
  selected: boolean
}
```

### `onNodeHighlightChange: EventEmitter<NodePointerEvent>`
```ts
{
  node: string,
  attributes: GraphNodeAttributes,
  event: FederatedPointerEvent,
  highlighted: boolean
}
```
### `onEdgeSelectChange: EventEmitter<EdgePointerEvent>`
```ts
{
  edge: string,
  attributes: GraphEdgeAttributes,
  event: FederatedPointerEvent,
  selected: boolean
}
```

### `onEdgeHighlightChange: EventEmitter<EdgePointerEvent>`
```ts
{
  edge: string,
  attributes: GraphEdgeAttributes,
  event: FederatedPointerEvent,
  highlighted: boolean
}
```

### `graphInitialised: EventEmitter<Graph>`
Fires once the Graphology graph is built, with all nodes rendered.

### `onDestroy: EventEmitter<boolean>`
Fires once the GraphViewerComponent is destroyed.


---

## 🛠 Usage

Import it directly into any Angular component (it’s standalone):

```ts
import { GraphViewerComponent } from '@tomaszatoo/graph-viewer';
```

Use it in your HTML:

```html
<graph-viewer
  [graphData]="myGraphData"
  [nodeRenderer]="myCustomNodeRenderer"
  [edgeRenderer]="myCustomEdgeRenderer"
  [animate]="true"
  [fullscreen]="true"
  [layoutSettings]="myLayoutSettings"
  (graphInitialised)="computeGraphTheory($event)"
  (onNodeSelectChange)="handleNodeSelection($event)"
  (onEdgeSelectChange)="handleEdgeSelection($event)"
  (onNodeHighlightChange)="handleNodeSelection($event)"
  (onEdgeHighlightChange)="handleEdgeSelection($event)"
  (onDestroy)="clean()">
</graph-viewer>
```

---

## 📚 Internals (aka "You can hack this")

- `NodeWrapper` and `EdgeWrapper` are custom `Container`s (extendable).
- Node radii are auto-scaled using degree-based heuristics:
  ```
  radius = base + log(degree)
  ```
- The layout engine is a service wrapping `graphology-layout-forceatlas2`, updated in the animation loop.
- Selection state is internal but exposed via `onSelectionChange`.

---

## 🛣️ Roadmap Ideas

- [ ] Demo / Examples
- [ ] Selecting eges 
- [ ] Arrowheads and directed edges
- [ ] Cluster folding / node collapsing
- [ ] Tooltip system with hover delay
- [ ] Export to PNG / SVG
- [ ] Mini-map viewport tracker

---

## 📎 Dependencies

- `pixi.js`
- `pixi-viewport`
- `graphology`
- `graphology-layout-forceatlas2`

---

## 🐛 Known Quirks

- Changing `graphData` destroys/rebuilds the graph entirely.
- ForceAtlas2 runs on the main thread—can spike with large graphs.
- No built-in edge label support (yet).
- Selection is node-only (no edge selection for now).

---

## 🧬 Author Notes

Built for high-performance graph rendering in web dashboards, internal devtools, and exploratory graph hacking. Designed to be extended, broken, refactored, and shaped by the needs of weird data.

---

## 🕳️ License

MIT – because locking pixels behind walls is boring.