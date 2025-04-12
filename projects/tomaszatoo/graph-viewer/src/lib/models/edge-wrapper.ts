import { Graphics, Container, Text } from 'pixi.js';
// models
import { EdgePosition, GraphEdgeAttributes, GraphColors} from './graph-types';


export interface EdgeWrapper {
    updatePosition?: (edgePosition: EdgePosition) => void;
}

export class EdgeWrapper extends Container {

    private edgeId!: string;
    private edgePosition!: EdgePosition;
    private attributes: any = {};
    private targetSize: number = 10;

    private container: Container = new Container();
    private line: Graphics = new Graphics();
    private arrow: Graphics = new Graphics();
    private edgeLabel: Text = new Text();
    private selfloop: boolean = false;

    private _selected: boolean = false;
    set selected(selected: boolean) {
        this._selected = selected;
        if (this._selected) {
            this.zIndex = 999999;
        } else {
            this.zIndex = 0;
        }
        this.draw();
    }
    get selected() { return this._selected; }

    private defaultEdgeColors: GraphColors = {
        stroke: 0x2DC9DC,
        label: 0x2DC9DC,
        selection: 0xffffff
    }

    private defaultEdgeAttributes: GraphEdgeAttributes = {
        colors: this.defaultEdgeColors,
        strokeWidth: 2
    }


    constructor(
        edge: string,
        edgePosition: EdgePosition,
        attributes?: GraphEdgeAttributes,
        targetSize?: number,
        selfloop: boolean = false
    ) {
        super();
        this.interactive = true;
        this.edgeId = edge;
        this.edgePosition = edgePosition;
        this.attributes = this.createEdgeAttributes(attributes ? attributes : {});
        this.targetSize = targetSize ? targetSize : this.targetSize;
        this.selfloop = selfloop;

        this.container.addChild(this.line);
        this.container.addChild(this.arrow);
        this.container.addChild(this.edgeLabel);
        this.addChild(this.container);
        
        // draw
        this.draw();

    }

    updateEdgePosition(edgePosition: EdgePosition): void {
        // TIP: maybe check if something changed
        if (
            this.edgePosition.source.x === edgePosition.source.x &&
            this.edgePosition.source.y === edgePosition.source.y &&
            this.edgePosition.target.x === edgePosition.target.x &&
            this.edgePosition.target.y === edgePosition.target.y
        ) {
            // console.log('not update');
            // nothing changed
            return;
        }
        this.edgePosition = edgePosition;
        this.draw();
    }

    protected initEdgeLine(g: Graphics): void {
        if (this.selfloop) {
            g.circle(this.edgePosition.target.x, this.edgePosition.target.y, this.targetSize)
            .stroke({
                color: this.selected ? this.getAttributeColor('selection') : this.getAttributeColor('stroke'),
                pixelLine: false,
                width: this.attributes && this.attributes.strokeWidth ? this. attributes.strokeWidth : 1
            });
            g.position.x = -this.targetSize - (this.targetSize / 3);
            g.position.y = -this.targetSize;

        } else {
            g.moveTo(this.edgePosition.source.x, this.edgePosition.source.y)
            .lineTo(this.edgePosition.target.x, this.edgePosition.target.y)
            .stroke({
              color: this.selected ? this.getAttributeColor('selection') : this.getAttributeColor('stroke'),
              pixelLine: false,
              width: this.attributes && this.attributes.strokeWidth ? this. attributes.strokeWidth : 1
            });
        }
    }

    protected initEdgeArrow(g: Graphics): void {
        // Target node's radius
        // console.log('targetSize', this.targetSize);
        const nodeRadius = this.targetSize + 3.5; // 5 is half of node outline width :/
        const arrowLength = 10; // length of the arrowhead lines
        const arrowWidth = 5;   // how wide the arrowhead spreads

        const dx = this.edgePosition.target.x - this.edgePosition.source.x;
        const dy = this.edgePosition.target.y - this.edgePosition.source.y;
        const angle = Math.atan2(dy, dx);

        // Shift the arrowhead back by nodeRadius along the edge direction
        const baseX = this.edgePosition.target.x - Math.cos(angle) * nodeRadius;
        const baseY = this.edgePosition.target.y - Math.sin(angle) * nodeRadius;

        const arrowBaseX = baseX - Math.cos(angle) * arrowLength;
        const arrowBaseY = baseY - Math.sin(angle) * arrowLength;

        const leftX = arrowBaseX + Math.cos(angle + Math.PI / 2) * arrowWidth;
        const leftY = arrowBaseY + Math.sin(angle + Math.PI / 2) * arrowWidth;

        const rightX = arrowBaseX + Math.cos(angle - Math.PI / 2) * arrowWidth;
        const rightY = arrowBaseY + Math.sin(angle - Math.PI / 2) * arrowWidth;

        g.moveTo(baseX, baseY)
        .lineTo(leftX, leftY)
        .lineTo(rightX, rightY)
        .lineTo(baseX, baseY)
        .fill({
         color: this.selected ? this.getAttributeColor('selection') : this.getAttributeColor('stroke')
         });
    }

    protected initEdgeLabel(t: Text): void {
        // console.log('draw label?');
        // this.edgeLabel.c
        if (this.selfloop) {
            // selfloop label position
        } else {
            const pos = this.getLabelPosition();
            // !!! recreating each redraw (maybe could help with blurring zooming)
            t.text = this.attributes.label;
            t.style = {
                fill: this.selected ? this.getAttributeColor('selection') : this.getAttributeColor('label'),
                fontSize: 12,
                fontFamily: 'Arial',
                align: 'left'
            }
            t.pivot.x = this.edgeLabel.width / 2;
            t.pivot.y = 18;
            t.x = pos.x;
            t.y = pos.y;
            t.rotation = pos.angle;
        }
    }

    private draw(): void {
        this.drawLine();
        this.drawArrow();
        if (this.attributes.label) this.drawLabel();
        // console.log('draw edge', this.container);
    }

    // line
    private drawLine(): void {
        this.line.clear();
        this.initEdgeLine(this.line);        
    }
    // arrow
    private drawArrow(): void {
        this.arrow.clear();
        this.initEdgeArrow(this.arrow);
    }
    // label
    private drawLabel(): void {
        this.initEdgeLabel(this.edgeLabel);
    }

    private createEdgeAttributes(attributes: Partial<GraphEdgeAttributes>): GraphEdgeAttributes {
        return {
            ...this.defaultEdgeAttributes,
            ...attributes,
            colors: {
                ...this.defaultEdgeColors,
                ...(attributes.colors || {})
            }
        };
    }

    private getAttributeColor(attr: string): number {
        if (this.attributes.colors && this.attributes.colors[attr as keyof GraphColors]) {
            return Number(this.attributes.colors[attr as keyof GraphColors]);
        }
        return 0;
    }


    private getLabelPosition(): any {
        const centerX = (this.edgePosition.source.x + this.edgePosition.target.x) / 2;
        const centerY = (this.edgePosition.source.y + this.edgePosition.target.y) / 2;
        const angle = Math.atan2(
            this.edgePosition.target.y - this.edgePosition.source.y, 
            this.edgePosition.target.x - this.edgePosition.source.x
        );
        const result = {
          x: centerX,
          y: centerY,
          angle: angle
        }
        return result;
    }

}