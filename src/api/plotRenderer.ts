import Settings from '@/store/modules/settings';
import CachedFunction from '@/api/CachedFunction';
import store from '../store/';
import {cloneDeep} from 'lodash';
import arrowCloud from '@/api/arrowCloud';
import {m4} from 'twgl.js';
import ArrowCloud from '@/api/arrowCloud';

export default class PlotRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private cachedFunction: CachedFunction;

    private isWebgl2 = false;
    private MAX_PARTICLES = 1000;
    private MAX_PARTICLE_AGE = 200;

    private settings!: Settings;
    private arrowCloud: arrowCloud;
    private uniforms!: {[key: string]: any};

    constructor(canvas: HTMLCanvasElement, settings: Settings) {
        this.canvas = canvas;
        this.settings = settings;
        this.cachedFunction = new CachedFunction(
            this.settings.dxFunction,
            this.settings.dyFunction,
            this.settings.viewbox,
            canvas.width,
            canvas.height,
        );

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
            this.arrowCloud.updateSettings(this.settings)
            if(mutation.type === 'settings/changeViewBox') {
                this.updateViewBox();
            }
        });
    }

    public updateScreenSize() {
        this.uniforms.u_screen = m4.ortho(
                -this.gl.canvas.width / 2, this.gl.canvas.width / 2,
                -this.gl.canvas.height / 2, this.gl.canvas.height / 2,
                -1, 1,
        );
    }

    public updateViewBox() {
        this.uniforms.u_camera = m4.ortho(
            this.settings.viewbox.x.min, this.settings.viewbox.x.max,
            this.settings.viewbox.y.min, this.settings.viewbox.y.max,
            -1, 1);
    }

    public render() {
        this.arrowCloud.render();

        requestAnimationFrame(() => this.render());
    }

    private makeArrow(size = 0.025) {
        return [
            size, 0, 0,
            -size, 0, 0,
            0, size, 0,
        ];
    }
}
