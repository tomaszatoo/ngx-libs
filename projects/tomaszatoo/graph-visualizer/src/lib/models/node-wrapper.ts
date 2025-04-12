import { Graphics, Container, Text } from 'pixi.js';

interface Point {
    x: number,
    y: number
}

export interface NodeWrapper {}

export class NodeWrapper extends Container {
    private node!: string;
    private nodePosition!: Point;
    private attributes!: any;
    private container: Container = new Container();
    private circle: Graphics = new Graphics();
    private nodeLabel: Text = new Text();
    set selected(selected: boolean) { 
        this._selected = selected;
        if (this._selected) {
            this.zIndex = 999999;
        } else {
            this.zIndex = 0;
        }
        this.drawCircle();
        this.drawLabel();
    }
    get selected() { return this._selected; }
    private _selected: boolean = false;

    constructor(
        node: string,
        nodePosition: Point,
        attributes?: any
    ) {
        super();
        this.interactive = true;
        this.node = node;
        this.nodePosition = nodePosition;
        this.attributes = attributes ? attributes : {};
        this.container.addChild(this.circle);
        this.container.addChild(this.nodeLabel);
        this.addChild(this.container);
        // draw
        this.draw();
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
        this.drawCircle();
        if (this.attributes && this.attributes.label) this.drawLabel();
    }

    private drawCircle(): void {
        this.circle.clear();
        this.circle.circle(0, 0, this.getNodeSize())
        .stroke({
            color: this.selected ? 0x30D973 : (this.attributes && this.attributes.stroke || this.attributes.stroke === 0 ? this.attributes.stroke : 0x000000),
            width: 10
        })
        .circle(0, 0, this.getNodeSize())
        .fill({
            color: this.attributes && this.attributes.color || this.attributes.color === 0 ? this.attributes.color : 0xffffff
        });
    }

    private drawLabel(): void {
        this.nodeLabel.text = this.attributes.label;
        this.nodeLabel.style = {
            fontSize: 24,
            fontFamily: 'Arial',
            fill: this.selected ? 0x30D973 : (this.attributes.color ? this.attributes.color : 0xffffff),
            align: 'center'
        }
        this.nodeLabel.x = this.circle.x + this.circle.width;
    }

    private getNodeSize(): number {
        return this.attributes.size ? this.attributes.size : 10;
    }
}