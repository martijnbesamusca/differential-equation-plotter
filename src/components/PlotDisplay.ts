import {html, CustomElement} from './CustomElement'
import state from "../api/store/state";
import GridDisplay from '../api/GridDisplay';

export default class PlotDisplay extends CustomElement {
    canvas: HTMLCanvasElement;
    private gridDisp: GridDisplay|null;

    constructor() {
        super();
        this.canvas = <HTMLCanvasElement> this.refs.canvas;
        this.gridDisp = null;
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
        let gl: WebGLRenderingContext | WebGL2RenderingContext | null = canvas.getContext('webgl2');
        if (!gl) {
            console.log('Trying webgl v1');
            gl = canvas.getContext('webgl');
        }
        if (!gl) {
            console.error('Webgl is not supported');
            return;
        }
        this.gridDisp = new GridDisplay(gl);
        requestAnimationFrame(this.draw.bind(this))
    }

    draw() {
        requestAnimationFrame(this.draw.bind(this))
        this.gridDisp!.draw()
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
                background-color: white;
              }
            </style>
        `;
    }
}

customElements.define('plot-display', PlotDisplay);
