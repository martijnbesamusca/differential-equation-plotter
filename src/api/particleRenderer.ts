import {
    BufferGeometry,
    ClampToEdgeWrapping,
    Clock,
    DataTexture,
    Float32BufferAttribute,
    Geometry, InstancedBufferAttribute, InstancedBufferGeometry,
    LineBasicMaterial,
    LineSegments, Mesh,
    NearestFilter,
    OrthographicCamera,
    Points, RawShaderMaterial,
    RGBAFormat,
    Scene,
    ShaderMaterial,
    Uint16BufferAttribute,
    Vector3,
    WebGLRenderer,
} from 'three';
import Settings from '@/store/modules/settings';
import {random} from 'lodash';
// @ts-ignore
import pointFrag from './shaders/webgl1/point.frag';
// @ts-ignore
import pointVert from './shaders/webgl1/point.vert';
// @ts-ignore
import arrowFrag from './shaders/webgl1/arrow.frag';
// @ts-ignore
import arrowVert from './shaders/webgl1/arrow.vert';
import CachedFunction from '@/api/CachedFunction';
import store from '../store/';
import {cloneDeep} from 'lodash';

export default class ParticleRenderer {
    private canvas: HTMLCanvasElement;
    private renderer!: WebGLRenderer;
    private scene: Scene;
    private camera: OrthographicCamera;

    private positions!: Float32Array;
    private colors!: Float32Array;
    private age!: Float32Array;
    private alpha!: Float32Array;
    private mesh!: Mesh;
    private cachedFunction: CachedFunction;

    private isWebgl2 = false;
    private MAX_PARTICLES = 1000;
    private MAX_PARTICLE_AGE = 200;

    private clock: Clock;
    private settings!: Settings;

    constructor(canvas: HTMLCanvasElement, settings: Settings) {
        this.canvas = canvas;
        this.settings = settings;
        this.scene = new Scene();
        this.clock = new Clock();
        this.camera = new OrthographicCamera(
            this.settings.viewbox.x.min,
            this.settings.viewbox.x.max,
            this.settings.viewbox.y.min,
            this.settings.viewbox.y.max,
            0,
            100,
        );

        this.camera.position.set(0, 0, 1);
        this.camera.lookAt(0, 0, 0);
        this.cachedFunction = new CachedFunction(
            this.settings.dxFunction,
            this.settings.dyFunction,
            this.settings.viewbox,
            canvas.width,
            canvas.height,
        );

        this.createRenderer();
        if (this.settings.drawFunctionBackground) {
            this.drawCachedFunction();
        }
        this.drawGrid();
        this.initParticles();

        // console.log(store)
        store.subscribe((mutation, state) => {
                // @ts-ignore
            this.settings = cloneDeep(state.settings);
        })
    }

    updateScreenSize() {
        this.renderer.setSize(this.canvas.width, this.canvas.height);
    }

    private createRenderer() {
        let ctx: WebGLRenderingContext | WebGL2RenderingContext | null;
        ctx = this.canvas.getContext('webgl') as WebGL2RenderingContext;
        if (ctx) {
            this.isWebgl2 = true;
            this.renderer = new WebGLRenderer({canvas: this.canvas, context: ctx, alpha: true});
        } else {
            ctx = this.canvas.getContext('webgl') as WebGLRenderingContext;
            if (!ctx) {
                console.error('WebGL not supported in this browser.');
            }
            this.renderer = new WebGLRenderer({canvas: this.canvas, context: ctx});

        }
        this.renderer.sortObjects = false;
        this.renderer.setSize(this.canvas.width, this.canvas.height, false);
    }

    private initParticles() {
        this.positions = new Float32Array(this.MAX_PARTICLES * 3);
        this.colors = new Float32Array(this.MAX_PARTICLES * 3);
        this.age = new Float32Array(this.MAX_PARTICLES);
        this.alpha = new Float32Array(this.MAX_PARTICLES);
        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            this.positions[i * 3] = Math.random() * (this.settings.viewbox.x.min - this.settings.viewbox.x.max) + this.settings.viewbox.x.max;
            this.positions[i * 3 + 1] = Math.random() * (this.settings.viewbox.y.min - this.settings.viewbox.y.max) + this.settings.viewbox.y.max;
            this.positions[i * 3 + 2] = 0;
            this.age[i] = random(0, this.MAX_PARTICLE_AGE);
            this.alpha[i] = 1.0;
        }

        const geometry = new InstancedBufferGeometry();
        geometry.maxInstancedCount = this.MAX_PARTICLES;
        const arrow = this.makeArrow();
        // debugger;1
        geometry.addAttribute('vertPosition', new Float32BufferAttribute(arrow, 3));

        geometry.addAttribute('position', new InstancedBufferAttribute(this.positions, 3, false));
        geometry.addAttribute('color', new InstancedBufferAttribute(this.colors, 3, false));
        geometry.addAttribute('age', new InstancedBufferAttribute(this.age, 1, false));
        geometry.addAttribute('alpha', new InstancedBufferAttribute(this.alpha, 1, false));

        const uniforms = {
            size: 6.0,
        };

        const arrowMaterial = new RawShaderMaterial({
            vertexShader: arrowVert,
            fragmentShader: arrowFrag,
            transparent: true,
        });

        const pointsMaterial = new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: pointVert,
            fragmentShader: pointFrag,
            transparent: true,
        });

        // this.points = new Points(geometry, pointsMaterial);
        this.mesh = new Mesh(geometry, arrowMaterial);

        this.scene.add(this.mesh);
    }

    private drawGrid() {
        const gridMaterial = new LineBasicMaterial({
            color: 0x0000,
            transparent: true,
            opacity: 0.1,
        });
        const axesMaterial = new LineBasicMaterial({
            color: 0x000,
            linewidth: 1,
        });

        const axesGeometry = new Geometry();
        const gridGeometry = new Geometry();
        for (let i = this.settings.viewbox.x.min; i < this.settings.viewbox.x.max; i += 1) {
            if (i === 0) {
                axesGeometry.vertices.push(
                    new Vector3(i, this.settings.viewbox.y.min, 0),
                    new Vector3(i, this.settings.viewbox.y.max, 0),
                );
            } else {
                gridGeometry.vertices.push(
                    new Vector3(i, this.settings.viewbox.y.min, 0),
                    new Vector3(i, this.settings.viewbox.y.max, 0),
                );
            }
        }

        for (let i = this.settings.viewbox.y.min; i < this.settings.viewbox.y.max; i += 1) {
            if (i === 0) {
                axesGeometry.vertices.push(
                    new Vector3(this.settings.viewbox.x.min, i, 0),
                    new Vector3(this.settings.viewbox.x.max, i, 0),
                );
            } else {
                gridGeometry.vertices.push(
                    new Vector3(this.settings.viewbox.x.min, i, 0),
                    new Vector3(this.settings.viewbox.x.max, i, 0),
                );
            }
        }

        const grid = new LineSegments(gridGeometry, gridMaterial);
        const axes = new LineSegments(axesGeometry, axesMaterial);
        this.scene.add(grid);
        this.scene.add(axes);
    }

    private drawCachedFunction() {
        const image = this.cachedFunction.getImage();
        const backgroundTexture = new DataTexture(
            image,
            this.cachedFunction.getWidth(),
            this.cachedFunction.getHeight(),
            RGBAFormat,
        );
        backgroundTexture.minFilter = NearestFilter;
        backgroundTexture.magFilter = NearestFilter;
        backgroundTexture.wrapS = ClampToEdgeWrapping;
        backgroundTexture.wrapT = ClampToEdgeWrapping;
        backgroundTexture.needsUpdate = true;
        this.scene.background = backgroundTexture;
    }

    public animate() {
        const delta = this.clock.getDelta();
        if (this.isWebgl2) {
            this.processCPU(delta);
            // this.processTransformFeedback(delta);
        } else {
            this.processCPU(delta);
        }

        this.renderer.render(this.scene, this.camera);
        // requestAnimationFrame(() => this.animate());
        //2
    }

    private processCPU(delta: number) {
        const stepSize = this.settings.speed;
        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            const x = this.positions[3 * i];
            const y = this.positions[3 * i + 1];
            let dx, dy: number;
            let exist: boolean;

            if (this.settings.useCached) {
                [dx, dy, exist] =  this.cachedFunction.getdxdy(x, -y);
            } else {
                dx = this.settings.dxFunction(x, -y);
                dy = this.settings.dyFunction(x, -y);
                exist = !Number.isNaN(dx + dy);
            }

            if (!exist) {
                this.age[i] += this.MAX_PARTICLE_AGE;
                this.alpha[i] = 0;
                this.positions[3 * i] = -.5;
                this.positions[3 * i + 1] = -.5;
            } else {
                this.age[i] += 1;
                this.alpha[i] = 1;
                this.positions[3 * i] += dx * stepSize;
                this.positions[3 * i + 1] -= dy * stepSize;
            }

            if (
                    this.positions[3 * i] < this.settings.viewbox.x.min ||
                    this.positions[3 * i] > this.settings.viewbox.x.max ||
                    this.positions[3 * i + 1] < this.settings.viewbox.y.min ||
                    this.positions[3 * i + 1] > this.settings.viewbox.y.max ||
                    this.age[i] > this.MAX_PARTICLE_AGE
                ) {
                this.alpha[i] = 0;
                this.positions[3 * i] = Math.random() * (this.settings.viewbox.x.min - this.settings.viewbox.x.max)
                    + this.settings.viewbox.x.max;
                this.positions[3 * i + 1] = Math.random() * (this.settings.viewbox.y.min - this.settings.viewbox.y.max)
                    + this.settings.viewbox.y.max;
                this.age[i] = 0;
            }
        }

        // const attributes = (this.mesh.geometry as InstancedBufferGeometry).attributes;
        // (attributes.position as Float32BufferAttribute).needsUpdate = true;
        // (attributes.alpha as Float32BufferAttribute).needsUpdate = true;
        // (attributes.age as Float32BufferAttribute).needsUpdate = true;
    }

    private processTransformFeedback(delta: number) {
        return delta;
    }

    private makeArrow(size = 0.025) {
        return [
            size, 0, 0,
            -size, 0, 0,
            0, size, 0,
        ];
    }
}
