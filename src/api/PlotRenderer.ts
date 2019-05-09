import Settings from '@/store/modules/settings';
import CachedFunction from '@/api/CachedFunction';
import store from '../store/';
import {cloneDeep} from 'lodash';
import {m4} from 'twgl.js';
import ArrowCloud from '@/api/ArrowCloud';
import Grid from '@/api/Grid';

export default class PlotRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private cachedFunction: CachedFunction;

    private settings!: any;
    private arrowCloud: ArrowCloud;
    private grid: Grid;
    private uniforms!: {[key: string]: any};

    constructor(canvas: HTMLCanvasElement, svg: SVGElement, settings: any) {
        this.canvas = canvas;
        this.settings = settings;
        this.cachedFunction = new CachedFunction(
            this.settings.dxFunction,
            this.settings.dyFunction,
            this.settings.viewbox,
            canvas.width,
            canvas.height,
        );
        this.grid = new Grid(svg, this.settings);

        const gl = canvas.getContext('webgl');
        if (!gl) {
            alert('Need WebGL support');
        }
        this.gl = gl!;

        this.uniforms = {};
        this.updateScreenSize();
        this.updateViewBox();

        this.arrowCloud = new ArrowCloud(this.gl, this.uniforms, this.settings);

        store.subscribe((mutation, state) => {
            // @ts-ignore
            this.settings = cloneDeep(state.settings);
            this.arrowCloud.updateSettings(this.settings);
            this.grid.updateSettings(this.settings);

            if (mutation.type === 'changeValue') {
                const key = mutation.payload.key;

                if (key.startsWith('viewbox')) {
                    this.updateViewBox();
                } else if (key === 'arrowColor') {
                    this.arrowCloud.colorArrows();
                } else if (key === 'arrowSize') {
                    this.arrowCloud.resizeArrows();
                }
            }

        });
    }

    public updateScreenSize() {
        console.log(this.gl.canvas.width, this.gl.canvas.height);
        this.uniforms.u_screen = m4.ortho(
                -this.gl.canvas.width / 2, this.gl.canvas.width / 2,
                -this.gl.canvas.height / 2, this.gl.canvas.height / 2,
                -1, 1,
        );
        this.grid.render();
    }

    public updateViewBox() {
        this.uniforms.u_camera = m4.ortho(
            this.settings.viewbox.x.min, this.settings.viewbox.x.max,
            this.settings.viewbox.y.min, this.settings.viewbox.y.max,
            -1, 1);
        this.grid.render();
    }

    public render() {
        this.arrowCloud.render();

        requestAnimationFrame(() => this.render());
    }
}
