import {
    AxesHelper,
    BufferGeometry, ClampToEdgeWrapping,
    Clock, DataTexture,
    Float32BufferAttribute, Geometry, GridHelper, LinearFilter, LineBasicMaterial, LineSegments, NearestFilter,
    OrthographicCamera,
    Points,
    PointsMaterial, RGBAFormat, RGBFormat, Scene, Sprite, SpriteMaterial, Vector3,
    VertexColors,
    WebGLRenderer,
} from 'three';
// import * as THREE from 'three';
import Settings from '@/store/modules/settings';
import {random} from 'lodash';

export default class ParticleRenderer {
    private canvas: HTMLCanvasElement;
    private renderer!: WebGLRenderer;
    private scene: Scene;
    private camera: OrthographicCamera;

    private positions!: number[];
    private colors!: Float32Array;
    private age!: Float32Array;
    private points!: Points;
    private cachedFunction!: Float32Array;

    private isWebgl2 = false;
    private MAX_PARTICLES = 10000;
    private MAX_PARTICLE_AGE = 100;

    private clock: Clock;
    private settings!: Settings;

    constructor(canvas: HTMLCanvasElement, settings: Settings) {
        this.canvas = canvas;
        this.settings = settings;
        this.scene = new Scene();
        // window.scene = this.scene;
        // window.THREE = THREE;
        this.clock = new Clock();
        this.camera = new OrthographicCamera(
            this.settings.viewbox.x.min,
            this.settings.viewbox.x.max,
            this.settings.viewbox.y.min,
            this.settings.viewbox.y.max,
            0,
            100);

        this.camera.position.set(0, 0, 1);
        this.camera.lookAt(0, 0, 0);

        this.createRenderer();
        this.initChachedFunction();
        this.drawCachedFunction();
        this.drawGrid();
        this.initParticles();
    }

    updateScreenSize() {
        this.renderer.setSize(this.canvas.width, this.canvas.height);
    }

    private createRenderer() {
        let ctx: WebGLRenderingContext | WebGL2RenderingContext | null = this.canvas.getContext('webgl2') as WebGL2RenderingContext;
        if (ctx) {
            this.isWebgl2 = true;
            this.renderer = new WebGLRenderer({canvas: this.canvas, context: ctx});
        } else {
            ctx = this.canvas.getContext('webgl') as WebGLRenderingContext;
            if (!ctx) {
                console.error('WebGL not supported in this browser.');
            }
            this.renderer = new WebGLRenderer({canvas: this.canvas, context: ctx});

        }
        this.renderer.setSize(this.canvas.width, this.canvas.height);
    }

    private initParticles() {
        const geometry = new BufferGeometry();
        this.positions = [];
        this.colors = new Float32Array(this.MAX_PARTICLES * 3);
        this.age = new Float32Array(this.MAX_PARTICLES);
        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            const x = Math.random() * (this.settings.viewbox.x.min - this.settings.viewbox.x.max) + this.settings.viewbox.x.max;
            const y = Math.random() * (this.settings.viewbox.y.min - this.settings.viewbox.y.max) + this.settings.viewbox.y.max;
            const z = 0;
            this.positions.push(x, y, z);
            this.age[i] = random(0, this.MAX_PARTICLE_AGE);
        }

        geometry.addAttribute('position', new Float32BufferAttribute(this.positions, 3, false).setDynamic(true));
        geometry.addAttribute('color', new Float32BufferAttribute(this.colors, 3, false).setDynamic(true));
        geometry.addAttribute('age', new Float32BufferAttribute(this.age, 1, false).setDynamic(true));

        this.points = new Points(geometry, new PointsMaterial({
            size: 0.5,
            vertexColors: VertexColors,
        }));

        this.scene.add(this.points);
    }

    private initChachedFunction() {
        const res = this.settings.functionCacheResolution;
        const width = (this.settings.viewbox.x.max - this.settings.viewbox.x.min) * res;
        const height = (this.settings.viewbox.y.max - this.settings.viewbox.y.min) * res;
        // dx dy dz exist
        const image = new Float32Array(width * height * 4);

        for (let i = 0; i < width * height * 4; i += 4) {
            const x = this.settings.viewbox.x.min + (i / 4) % width / res;
            const y = this.settings.viewbox.y.min + Math.floor((i / 4) / width ) / res;
            const dx = this.settings.dxFunction(x, y);
            const dy = this.settings.dyFunction(x, y);
            if (Number.isNaN(dx + dy)) {
                image[i] = 0;
                image[i + 1] = 0;
                image[i + 2] = 0;
                image[i + 3] = 0;
            } else {
                image[i] = dx;
                image[i + 1] = dy;
                image[i + 2] = 0;
                image[i + 3] = 1;
            }
        }

        this.cachedFunction = image;
    }

    private drawGrid() {
        const gridMaterial = new LineBasicMaterial({
            color: 0x333333,
        });
        const axesMaterial = new LineBasicMaterial({
            color: 0x000,
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
        const res = this.settings.functionCacheResolution;
        const width = (this.settings.viewbox.x.max - this.settings.viewbox.x.min) * res;
        const height = (this.settings.viewbox.y.max - this.settings.viewbox.y.min) * res;
        const [dxMin, dxMax, dyMin, dyMax] = this.findMinMax();
        const normalized = Uint8Array.from(this.cachedFunction, (value, i) =>  {
            const id = i % 4;
            if (id === 0) {
                return  Math.floor((value - dxMin) / (dxMax - dxMin) * 255);
            } else if (id === 1) {
                return  Math.floor((value - dyMin) / (dyMax - dyMin) * 255);
            } else if (id === 2) {
                return 0;
            } else {
                return value * 255;
            }
        });

        const backgroundTexture = new DataTexture(normalized, width, height, RGBAFormat);
        backgroundTexture.minFilter = NearestFilter;
        backgroundTexture.magFilter = NearestFilter;
        backgroundTexture.wrapS = ClampToEdgeWrapping;
        backgroundTexture.wrapT = ClampToEdgeWrapping;
        backgroundTexture.needsUpdate = true;
        this.scene.background = backgroundTexture;
    }

    private findMinMax() {
        let dxMin = Number.POSITIVE_INFINITY;
        let dxMax = Number.NEGATIVE_INFINITY;
        let dyMin = Number.POSITIVE_INFINITY;
        let dyMax = Number.NEGATIVE_INFINITY;
        const res = this.settings.functionCacheResolution;
        const width = (this.settings.viewbox.x.max - this.settings.viewbox.x.min) * res;
        const height = (this.settings.viewbox.y.max - this.settings.viewbox.y.min) * res;

        for (let i = 0; i < width * height; i++) {
            const dx = this.cachedFunction[i * 4];
            const dy = this.cachedFunction[i * 4 + 1];
            if (dx < dxMin) {
                dxMin = dx;
            }
            if (dx > dxMax) {
                dxMax = dx;
            }
            if (dy < dyMin) {
                dyMin = dy;
            }
            if (dy > dyMax) {
                dyMax = dy;
            }
        }

        console.log(dxMin, dxMax, dyMin, dyMax)
        return [dxMin, dxMax, dyMin, dyMax];
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
        requestAnimationFrame(() => this.animate());
    }

    private processCPU(delta: number) {
        const positions = ((this.points.geometry as BufferGeometry)
            .attributes.position as Float32BufferAttribute);
        const posArray = positions.array as Float32Array;

        const colors = ((this.points.geometry as BufferGeometry)
            .attributes.color as Float32BufferAttribute);
        const colArray = colors.array as Float32Array;

        const age = ((this.points.geometry as BufferGeometry)
            .attributes.age as Float32BufferAttribute);
        const ageArray = age.array as Float32Array;

        const stepSize = this.settings.speed;
        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            const x = posArray[3 * i];
            const y = posArray[3 * i + 1];

            // [x, y] = [this.settings.dxFunction(x, y), this.settings.dyFunction(x, y)]
            // if (Number.isNaN(x + y)) {
            //     ageArray[i] += this.MAX_PARTICLE_AGE;
            // }
            // posArray[3 * i] += this.settings.dxFunction(x, -y) * stepSize;
            // posArray[3 * i + 1] -= this.settings.dyFunction(x, -y) * stepSize;
            // debugger;
            posArray[3 * i] += this.dxCached(x, -y) * stepSize;
            posArray[3 * i + 1] -= this.dyCached(x, -y) * stepSize;

            ageArray[i] += 1;

            if (posArray[3 * i] < this.settings.viewbox.x.min || posArray[3 * i] > this.settings.viewbox.x.max ||
                    posArray[3 * i + 1] < this.settings.viewbox.y.min || posArray[3 * i + 1] > this.settings.viewbox.y.max ||
                    ageArray[i] > this.MAX_PARTICLE_AGE) {
                posArray[3 * i] = Math.random() * (this.settings.viewbox.x.min - this.settings.viewbox.x.max) + this.settings.viewbox.x.max;
                posArray[3 * i + 1] = Math.random() * (this.settings.viewbox.y.min - this.settings.viewbox.y.max) + this.settings.viewbox.y.max;
                ageArray[i] = 0;
            }
        }

        positions.needsUpdate = true;
    }

    private dxCached(x: number, y: number): number {
        // debugger;
        const res = this.settings.functionCacheResolution;
        const width = (this.settings.viewbox.x.max - this.settings.viewbox.x.min)*res;
        const xNorm = Math.floor((x - this.settings.viewbox.x.min) * res);
        const yNorm = Math.floor((y - this.settings.viewbox.y.min) * res);
        const index = yNorm * width + xNorm;
        // debugger;
        return this.cachedFunction[index * 4];
    }

    private dyCached(x:number, y:number): number {
        const res = this.settings.functionCacheResolution;
        const width = (this.settings.viewbox.x.max - this.settings.viewbox.x.min)*res;
        const xNorm = Math.floor((x - this.settings.viewbox.x.min) * res);
        const yNorm = Math.floor((y - this.settings.viewbox.y.min) * res);
        const index = yNorm * width + xNorm;
        return this.cachedFunction[index * 4 + 1];
    }

    private processTransformFeedback(delta: number) {
        return delta;
    }

}
