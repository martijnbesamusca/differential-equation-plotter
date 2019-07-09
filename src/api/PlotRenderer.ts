import Settings from '@/store/modules/settings';
import CachedFunction from '@/api/CachedFunction';
import store from '../store/';
import {cloneDeep} from 'lodash';
import {m4} from 'twgl.js';
import ArrowCloud from '@/api/ArrowCloud';
import Grid from '@/api/Grid';
import ODEEstimator from "@/api/ODEEstimator";
import SolutionRenderer from "@/api/SolutionRenderer";

export default class PlotRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    // private cachedFunction: CachedFunction;

    private settings!: any;
    private arrowCloud: ArrowCloud;
    private grid: Grid;
    private uniforms!: {[key: string]: any};

    private ODEEstimator: ODEEstimator;
    private solutions: SolutionRenderer;

    constructor(canvas: HTMLCanvasElement, svg: SVGElement, settings: any) {
        this.canvas = canvas;
        this.settings = settings;
        this.grid = new Grid(svg, this.settings);
        this.ODEEstimator = new ODEEstimator();
        this.solutions = new SolutionRenderer(canvas, svg, this.settings, this.ODEEstimator);

        const gl = canvas.getContext('webgl');
        if (!gl) {
            alert('Need WebGL support');
        }
        this.gl = gl!;

        this.uniforms = {};
        this.updateScreenSize();
        this.updateViewBox();

        this.arrowCloud = new ArrowCloud(this.gl, this.uniforms, this.settings, this.ODEEstimator);

        store.subscribe((mutation, state) => {
            // @ts-ignore
            this.settings = cloneDeep(state.settings);
            this.arrowCloud.updateSettings(this.settings);
            this.grid.updateSettings(this.settings);

            if (mutation.type === 'changeValue') {
                const key = mutation.payload.key;

                if (key.startsWith('viewbox') || key === 'keepAspectRatio') {
                    this.updateViewBox();
                } else if (key === 'arrowMaxAge') {
                    this.arrowCloud.initArrows();
                } else if (key === 'arrowColor' || key === 'arrowRandomColor') {
                    this.arrowCloud.colorArrows();
                } else if (key === 'arrowSize') {
                    this.arrowCloud.resizeArrows();
                } else if (key === 'ODEType') {
                    this.arrowCloud.updateODE();
                    this.arrowCloud.initArrows();
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
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.arrowCloud.render();

        requestAnimationFrame(() => this.render());
    }
}
