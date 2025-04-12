import { Graphics, Container, Text } from 'pixi.js';

interface Point {
    x: number,
    y: number
}

interface EdgePosition {
    source: Point,
    target: Point
}

export interface EdgeWrapper {
    updatePosition?: (edgePosition: EdgePosition) => void;
}

export class EdgeWrapper extends Container {

    private edge!: string;
    private edgePosition!: EdgePosition;
    private attributes: any = {};
    private targetSize: number = 10;

    private container: Container = new Container();
    private line: Graphics = new Graphics();
    private arrow: Graphics = new Graphics();
    private edgeLabel: Text = new Text();
    private selfloop: boolean = false;


    constructor(
        edge: string,
        edgePosition: EdgePosition,
        attributes?: any,
        targetSize?: number,
        selfloop: boolean = false
    ) {
        super();
        this.interactive = true;
        this.edge = edge;
        this.edgePosition = edgePosition;
        this.attributes = attributes ? attributes : {};
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

    private draw(): void {
        this.drawLine();
        this.drawArrow();
        if (this.attributes.label) this.drawLabel();
        // console.log('draw edge', this.container);
    }

    // line
    private drawLine(): void {
        this.line.clear();
        if (this.selfloop) {
            this.line.circle(this.edgePosition.target.x, this.edgePosition.target.y, this.targetSize)
            .stroke({
                color: this.attributes && this.attributes.color ? this.attributes.color : 0xffffff,
                pixelLine: false,
                width: this.attributes && this.attributes.width ? this. attributes.width : 1
            });
            this.line.position.x = -this.targetSize - (this.targetSize / 3);
            this.line.position.y = -this.targetSize;

        } else {
            this.line.moveTo(this.edgePosition.source.x, this.edgePosition.source.y)
            .lineTo(this.edgePosition.target.x, this.edgePosition.target.y)
            .stroke({
              color: this.attributes && this.attributes.color ? this.attributes.color : 0xffffff,
              pixelLine: false,
              width: this.attributes && this.attributes.width ? this. attributes.width : 1
            });
        }
        
    }
    // arrow
    private drawArrow(): void {
        this.arrow.clear();
        // Target node's radius
        // console.log('targetSize', this.targetSize);
        const nodeRadius = this.targetSize + 5; // 5 is half of node outline width :/
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

        this.arrow.moveTo(baseX, baseY)
        .lineTo(leftX, leftY)
        .lineTo(rightX, rightY)
        .lineTo(baseX, baseY)
        .fill({
         color: this.attributes && this.attributes.color ? this.attributes.color : 0xffffff
         });
    }
    // label
    private drawLabel(): void {
        // console.log('draw label?');
        // this.edgeLabel.c
        if (this.selfloop) {
            // selfloop label position
        } else {
            const pos = this.getLabelPosition();
            // !!! recreating each redraw (maybe could help with blurring zooming)
            this.edgeLabel.text = this.attributes.label;
            this.edgeLabel.style = {
                fill: this.attributes.color ? this.attributes.color : 0xffffff,
                fontSize: 12,
                fontFamily: 'Arial',
                align: 'center'
            }
            this.edgeLabel.pivot.x = this.edgeLabel.width / 2;
            this.edgeLabel.pivot.y = 18;
            this.edgeLabel.x = pos.x;
            this.edgeLabel.y = pos.y;
            this.edgeLabel.rotation = pos.angle;
        }
        
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