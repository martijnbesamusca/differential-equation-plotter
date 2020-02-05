import settings from "./store/settings";
import {vert_line, vert_line_length} from "./geometry";
import {
    BufferInfo,
    createBufferInfoFromArrays, createProgramInfo, drawBufferInfo,
    m4,
    ProgramInfo,
    setBuffersAndAttributes,
    setUniforms
} from 'twgl.js';


// @ts-ignore
import gridVert from '../shaders/axis.vert'
// @ts-ignore
import gridFrag from '../shaders/axis.frag'

export default class GridDisplay {
    resX: number = 10;
    resY: number = 10;
    type: GridType = GridType.cartesian;
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    private bufferInfo: BufferInfo | undefined;
    private programInfo: ProgramInfo;
    private uniforms!: {u_screen: m4.Mat4, u_camera: m4.Mat4};

    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
        this.gl = gl;
        this.programInfo = createProgramInfo(gl, [gridVert, gridFrag]);
        // @ts-ignore
        this.uniforms = {u_screen: null, u_camera: null};
        this.updateVertices();
        this.updateUniform();
    }

    updateVertices() {
        const vertices = new Float32Array(vert_line_length);
        vert_line(vertices, 0, 0, 1, 0);
        console.log(vertices);
        const arrays = {
            position: {numComponents:2, data: vertices}
        };
        this.bufferInfo = createBufferInfoFromArrays(this.gl, arrays);
        console.log(this.bufferInfo)
    }

    updateUniform() {
        console.log(this.gl.canvas.width, this.gl.canvas.height);
        debugger
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.uniforms.u_screen = m4.ortho(
            -this.gl.canvas.width / 2,
            this.gl.canvas.width / 2,
            -this.gl.canvas.height / 2,
            this.gl.canvas.height / 2,
            -1,
            1
        );
        // this.uniforms.u_screen = m4.ortho(
        //     0,
        //     this.gl.canvas.width,
        //     0,
        //     this.gl.canvas.height,
        //     -1,
        //     1
        // );
        this.uniforms.u_camera = m4.ortho(
            settings.window.get('min_x') as number,
            settings.window.get('max_x') as number,
            settings.window.get('min_y') as number,
            settings.window.get('max_y') as number,
            -1,
            1
        );
        this.draw()
    }
    drawRect(x:number, y:number, width:number, height:number, color:[number, number, number, number]) {
        this.gl.scissor(x, y, width, height);
        this.gl.clearColor(...color);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
    draw() {
        if(!this.bufferInfo) return;
        this.gl.clearColor(1,1,1,1);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.disable(this.gl.DEPTH_TEST);

        this.gl.enable(this.gl.SCISSOR_TEST);
        this.gl.useProgram(this.programInfo.program);
        setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
        setUniforms(this.programInfo, this.uniforms);
        drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLES);
    }

    private draw_webgl(ctx: WebGLRenderingContext) {

    }

    private draw_webgl2(ctx: WebGL2RenderingContext) {
    }
}

function rand(min:number, max?:number):number {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return Math.random() * (max - min) + min;
}

enum Version {
    WebGL,
    WebGL2
}

enum GridType {
    cartesian,
    polar
}
