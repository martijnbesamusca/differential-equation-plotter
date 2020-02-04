import settings from "./store/settings";
import {vert_line, vert_line_length} from "./geometry";
import twgl, {BufferInfo, ProgramInfo} from 'twgl.js';

// @ts-ignore
import gridVert from '../shaders/axis.vert'
// @ts-ignore
import gridFrag from '../shaders/axis.frag'

class GridDisplay {
    resX: number = 10;
    resY: number = 10;
    type: GridType = GridType.cartesian;
    version: Version;
    private bufferInfo: BufferInfo | undefined;
    private programInfo: ProgramInfo;

    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, version: Version) {
        this.version = version;
        this.programInfo = twgl.createProgramInfo(gl, [gridVert, gridFrag]);
    }

    update(gl: WebGLRenderingContext | WebGL2RenderingContext) {
        const vertices = new Float32Array(vert_line_length);
        vert_line(vertices, 0, 0, 3, 0);
        const arrays = {
            position: vertices
        };
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    }

    makeMatrix() {
        return [
            2 / state.c
        ]
    }

    draw(gl: WebGLRenderingContext | WebGL2RenderingContext) {
        if(!this.bufferInfo) return;
        gl.useProgram(this.programInfo.program);
        twgl.setUniforms(this.programInfo, uniforms);
        twgl.drawBufferInfo(gl, this.bufferInfo);

        if(this.version === Version.WebGL2) {
            this.draw_webgl(gl as WebGLRenderingContext);
        } else {
            this.draw_webgl2(gl as WebGL2RenderingContext);
        }
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
