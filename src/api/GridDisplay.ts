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
        vert_line(vertices, 0, 0, 3, 0);
        console.log(vertices);
        const arrays = {
            position: {numComponents:2, data: vertices}
        };
        this.bufferInfo = createBufferInfoFromArrays(this.gl, arrays);
    }

    updateUniform() {

        this.uniforms.u_screen = m4.ortho(
            -this.gl.canvas.width / 2,
            this.gl.canvas.width / 2,
            -this.gl.canvas.height / 2,
            this.gl.canvas.height / 2,
            -1,
            1
        );
        this.uniforms.u_camera = m4.ortho(
            settings.window.get('min_x') as number,
            settings.window.get('max_x') as number,
            settings.window.get('min_y') as number,
            settings.window.get('max_y') as number,
            -1,
            1
        );

    }

    draw() {
        if(!this.bufferInfo) return;
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

enum Version {
    WebGL,
    WebGL2
}

enum GridType {
    cartesian,
    polar
}
