import { Graphics, Container, Text } from 'pixi.js';
// interfaces
import { GraphNodeAttributes, GraphColors, Point } from './graph-types';

export interface NodeWrapper {
    updatePosition?: (nodePosition: Point) => void;
}

export class NodeWrapper extends Container {
    // private nodeId!: string;
    private nodePosition!: Point;
    private attributes!: GraphNodeAttributes;
    private container: Container = new Container();
    private node: Graphics = new Graphics();
    private nodeLabel: Text = new Text();
    // select
    private _select: boolean = false;
    set select(select: boolean) { 
        this._select = select;
        if (this._select) {
            this.zIndex = 999999;
        } else {
            this.zIndex = 0;
        }
        // this.drawNode();
        // this.drawLabel();
        this.draw();
    }
    get select() { return this._select; }
    // highlight
    private _highlight: boolean = false;
    set highlight(highlight: boolean) {
        this._highlight = highlight;
        this.draw();
    }
    get highlight() { return this._highlight; }
    
    
    protected defaultNodeColors: GraphColors = {
        fill: 0x000000,
        stroke: 0x2DC9DC,
        label: 0x2DC9DC,
        selection: 0xffffff,
        highlight: 0x30D973
    }

    protected defaultNodeAttributes: GraphNodeAttributes = {
        x: 1,
        y: 1,
        colors: this.defaultNodeColors,
        radius: 10,
        strokeWidth: 7
    }

    constructor(
        node: string,
        nodePosition: Point,
        attributes?: Partial<GraphNodeAttributes>
    ) {
        super();
        this.interactive = true;
        // this.nodeId = node;
        this.nodePosition = nodePosition;
        this.attributes = this.createGraphNodeAttributes(attributes ? attributes : {})
        this.container.addChild(this.node);
        this.container.addChild(this.nodeLabel);
        this.addChild(this.container);
        // draw
        this.draw();
    }

    protected initLabelGraphics(t: Text): void {
        t.text = this.attributes.label && this.attributes.label ? this.attributes.label : '';
        t.style = {
            fontSize: 24,
            fontFamily: 'Arial',
            fill: this.select ? this.getAttributeColor('selection') : (this.highlight ? this.getAttributeColor('highlight') : this.getAttributeColor('label')),
            align: 'center'
        }
    }

    protected initNodeGraphics(g: Graphics): void {
        // g.clear();
        g.circle(0, 0, this.getNodeSize())
        .stroke({
            color: this.select ? this.getAttributeColor('selection') : (this.highlight ? this.getAttributeColor('highlight') : this.getAttributeColor('stroke')),
            width: this.attributes && this.attributes.strokeWidth ? this.attributes.strokeWidth : 10
        })
        .circle(0, 0, this.getNodeSize())
        .fill({
            color: this.getAttributeColor('fill')
        });
    }

    updateNodePosition(nodePosition: Point): void {
        if (this.nodePosition.x === nodePosition.x && this.nodePosition.y === nodePosition.y) {
            // console.log('no change in node position');
            return;
        }
        // console.log('update node position');
        this.nodePosition = nodePosition;
        // this.draw();
        this.x = this.nodePosition.x;
        this.y = this.nodePosition.y;
    }

    private draw(): void {
        this.x = this.nodePosition.x;
        this.y = this.nodePosition.y;
        this.drawNode();
        if (this.attributes && this.attributes.label) this.drawLabel();
    }

    private drawNode(): void {
        this.node.clear();
        this.initNodeGraphics(this.node);
    }

    

    private drawLabel(): void {
        this.initLabelGraphics(this.nodeLabel);
        this.nodeLabel.x = this.node.x + this.node.width;
        this.nodeLabel.y = this.node.y - (this.nodeLabel.height / 2);
    }

    

    private getAttributeColor(attr: string): number {
        if (this.attributes.colors && this.attributes.colors[attr as keyof GraphColors]) {
            return Number(this.attributes.colors[attr as keyof GraphColors]);
        }
        return 0;
    }

    private createGraphNodeAttributes(attributes: Partial<GraphNodeAttributes>): GraphNodeAttributes {
        return {
            ...this.defaultNodeAttributes,
            ...attributes,
            colors: {
                ...this.defaultNodeColors,
                ...(attributes.colors || {})
            }
        };
    }

    private getNodeSize(): number {
        const size = this.attributes.radius ? this.attributes.radius : 10;
        return this.highlight ? (size + (size * .2)) : size;
    }
}