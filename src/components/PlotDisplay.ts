import {html, CustomElement} from './CustomElement'
import state from "../api/store/state";
import * as renderer from '../api/renderer/controller';
import * as gridRenderer from '../api/renderer/grid';
import * as textRenderer from '../api/renderer/text';
export default class PlotDisplay extends CustomElement {
    canvas: HTMLCanvasElement;

    constructor() {
        super();
        this.canvas = <HTMLCanvasElement> this.refs.canvas;

        const resizeObserver = new ResizeObserver(entries => {
            const {width, height} = entries[0].contentRect;
            this.canvas.width = width;
            this.canvas.height = height;
            state.set("canvas_width", width);
            state.set("canvas_height", height);
        });
        resizeObserver.observe(this);

        this.canvas.addEventListener('pointermove', e => {
            state.set('mouse_x', e.offsetX);
            state.set('mouse_y', e.offsetY);
        })
    }

    connectedCallback() {
        super.connectedCallback();
        const canvas = this.refs.canvas as HTMLCanvasElement;
        renderer.init(canvas);
        renderer.addRenderer(gridRenderer);
        renderer.addRenderer(textRenderer);
        const textBox = textRenderer.addTextBox(5, '01234');
    }

    render() {
        return html`
            <canvas ref="canvas"></canvas>
            <style>
              :host {
                display: block;
                height:100%;
              }
              canvas {
                display:block;
                position:absolute;
                /*background-color: white;*/
              }
            </style>
        `;
    }
}

customElements.define('plot-display', PlotDisplay);
