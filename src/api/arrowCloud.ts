import {
    createBufferInfoFromArrays,
    drawBufferInfo,
    m4,
    ProgramInfo,
    resizeCanvasToDisplaySize,
    setUniforms,
    VertexArrayInfo,
    addExtensionsToContext,
    createProgramInfo,
    createVertexArrayInfo,
    setBuffersAndAttributes, setAttribInfoBufferFromArray, BufferInfo,
} from 'twgl.js';
import settings from '@/store/modules/settings';
import {random} from 'lodash';
// @ts-ignore
import arrowFrag from './shaders/webgl1/arrow.frag';
// @ts-ignore
import arrowVert from './shaders/webgl1/arrow.vert';

export default class ArrowCloud {
    private gl: WebGLRenderingContext;
    private arrowVertexArray: VertexArrayInfo;
    private programInfo: ProgramInfo;

    private pos!: Float32Array;
    private age!: Uint16Array;
    private color!: Float32Array;
    private alpha!: Float32Array;
    private dx: Float32Array;
    private dy: Float32Array;

    private MAX_NUM_ARROWS = 10000;
    private MAX_AGE = 500;
    private numArrowsDrawn = 3000;
    private settings: settings;
    private uniforms: {[key: string]: any};
    private arrowInfoBuffer: BufferInfo;
    private arrowArray: {[key: string]: any};

    constructor(gl: WebGLRenderingContext, globUniforms: {[key: string]: any}, settings: settings) {
        this.gl = gl;
        this.settings = settings;


        addExtensionsToContext(this.gl);
        this.programInfo = createProgramInfo(this.gl, [arrowVert, arrowFrag]);

        const arrow = this.makeArrow(1, 0.3, 1.5, 5);
        this.pos = new Float32Array(this.MAX_NUM_ARROWS * 2);
        this.age = new Uint16Array(this.MAX_NUM_ARROWS);
        this.color = new Float32Array(this.MAX_NUM_ARROWS * 3);
        this.alpha = new Float32Array(this.MAX_NUM_ARROWS);
        this.dx = new Float32Array(this.MAX_NUM_ARROWS);
        this.dy = new Float32Array(this.MAX_NUM_ARROWS);
        this.initArrows();


        this.arrowArray = {
            a_vert_pos: {
                numComponents: 2,
                data: arrow,
            },
            a_glob_pos: {
                numComponents: 2,
                data: this.pos,
                divisor: 1,
            },
            a_color: {
                numComponents: 3,
                data: this.color,
                divisor: 1,
            },
            a_alpha: {
                numComponents: 1,
                data: this.alpha,
                divisor: 1,
            },
            a_dx: {
                numComponents: 1,
                data: this.dx,
                divisor: 1,
            },
            a_dy: {
                numComponents: 1,
                data: this.dy,
                divisor: 1,
            },
        };
        this.arrowInfoBuffer = createBufferInfoFromArrays(this.gl, this.arrowArray);
        this.arrowVertexArray = createVertexArrayInfo(this.gl, this.programInfo, this.arrowInfoBuffer);
        this.uniforms = globUniforms;
    }

    public render() {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.move();

        this.gl.useProgram(this.programInfo.program);

        setAttribInfoBufferFromArray(this.gl, this.arrowInfoBuffer.attribs!.a_glob_pos, this.arrowArray.a_glob_pos);
        // setAttribInfoBufferFromArray(this.gl, this.arrowInfoBuffer.attribs!.a_color, this.arrowArray.a_color);
        setAttribInfoBufferFromArray(this.gl, this.arrowInfoBuffer.attribs!.a_alpha, this.arrowArray.a_alpha);
        setAttribInfoBufferFromArray(this.gl, this.arrowInfoBuffer.attribs!.a_dx, this.arrowArray.a_dx);
        setAttribInfoBufferFromArray(this.gl, this.arrowInfoBuffer.attribs!.a_dy, this.arrowArray.a_dy);

        setBuffersAndAttributes(this.gl, this.programInfo, this.arrowVertexArray);
        setUniforms(this.programInfo, this.uniforms);

        drawBufferInfo(
            this.gl,
            this.arrowVertexArray,
            this.gl.TRIANGLES,
            this.arrowVertexArray.numElements,
            0,
            this.numArrowsDrawn,
        );
    }

    public updateSettings(settings: settings) {
        this.settings = settings;
    }

    private move() {
        for (let i = 0; i < this.numArrowsDrawn; i++) {
            this.pos[i * 2] += this.dx[i] * this.settings.speed;
            this.pos[i * 2 + 1] += this.dy[i] * this.settings.speed;

            const x = this.pos[i * 2];
            const y = this.pos[i * 2 + 1];

            const dx = this.settings.dxFunction(x, y);
            const dy = this.settings.dyFunction(x, y);

            this.dx[i] = dx;
            this.dy[i] = dy;

            this.alpha[i] = 1.0;

            if (isNaN(dx) || isNaN(dy)) {
                this.alpha[i] = 0.0;
                this.age[i] = this.MAX_AGE;
            }

            this.age[i] += 1;
            if (this.age[i] >= this.MAX_AGE || !this.isInBounds(x, y)) {
                const x = this.randomFloat(this.settings.viewbox.x.min, this.settings.viewbox.x.max);
                const y = this.randomFloat(this.settings.viewbox.y.min, this.settings.viewbox.y.max);
                this.pos[i * 2] = x;
                this.pos[i * 2 + 1] = y;
                this.dx[i] = this.settings.dxFunction(x, y);
                this.dy[i] = this.settings.dyFunction(x, y);
                this.age[i] = 0;
                this.alpha[i] = isNaN(this.dx[i]) || isNaN(this.dy[i]) ? 0.0 : 1.0;
            }
        }
    }

    private isInBounds(x: number ,y: number ){
        return this.settings.viewbox.x.min <= x && this.settings.viewbox.x.max >= x &&
            this.settings.viewbox.y.min <= y && this.settings.viewbox.y.max >= y
    }

    private initArrows() {
        for (let i = 0; i < this.pos.length; i++) {
            this.pos[i * 2] = this.randomFloat(this.settings.viewbox.x.min, this.settings.viewbox.x.max);
            this.pos[i * 2 + 1] = this.randomFloat(this.settings.viewbox.y.min, this.settings.viewbox.y.max);
            this.age[i] = this.randomInt(0, this.MAX_AGE);
            this.alpha[i] = 0.0;

            const [r, g, b] = this.randomColor(120, 50, 1.0, 0.2, 0.5, 0.2);
            this.color[i * 3] = r;
            this.color[i * 3 + 1] = g;
            this.color[i * 3 + 2] = b;
        }
    }

    private randomColor(h: number, hSpread: number, s: number, sSpread: number, l: number, lSpread: number) {
        return this.randomColorRange(
            h - hSpread, h + hSpread,
            Math.max(0, s - sSpread), Math.min(1, s + sSpread),
            Math.max(0, l - lSpread), Math.min(1, l + lSpread),
        );
    }
    private randomColorRange(minH: number, maxH: number, minS: number, maxS: number, minL: number, maxL: number) {
        let h;

        if (minH <= maxH) {
            h = this.randomFloat(minH, maxH);
        } else {
            // for ranges as (350, 360] U [0, 10)
            if (maxH <= this.randomFloat(0, maxH + 360 - minH)) {
                h = this.randomFloat(0, maxH);
            } else {
                h = this.randomFloat(minH, 360);
            }
        }

        // covert to rgb

        h /= 360;
        const s = this.randomFloat(minS, maxS);
        const l = this.randomFloat(minL, maxL);


        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const r = this.hue2rgb(p, q, h + 1/3);
        const g = this.hue2rgb(p, q, h);
        const b = this.hue2rgb(p, q, h - 1/3);
        return [r, g, b];
    }

    private hue2rgb(p: number, q: number, t: number){
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    private randomFloat(min:number, max:number) {
        return min + Math.random() * (max - min);
    }

    private randomInt(min:number, max:number) {
        return Math.floor(min + Math.random() * (max - min));
    }

    private makeArrow(sizeArrow: number, widthBase: number, heightBase: number, scale: number = 1) {
        let arrow =  [
            sizeArrow, 0,
            -sizeArrow, 0,
            0, sizeArrow,

            widthBase, 0,
            -widthBase, 0,
            -widthBase, -heightBase,

            widthBase, -heightBase,
            -widthBase, -heightBase,
            widthBase, 0,
        ];
        arrow = arrow.map(((value) => value * scale));
        return arrow;
    }
}
