import {BufferInfo, createBufferInfoFromArrays, drawBufferInfo, m4, ProgramInfo} from 'twgl.js';
import settings from '@/store/modules/settings';
import {createProgramInfo, setBuffersAndAttributes} from 'twgl.js/dist/4.x/twgl';


export default class ParticleTest {
    vertShader = `
    precision highp float;
    attribute vec2 a_position;

    uniform mat3 u_matrix;

    varying vec4 v_color;

    void main() {
          // Multiply the position by the matrix.
          gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

          // Convert from clipspace to colorspace.
          // Clipspace goes -1.0 to +1.0
          // Colorspace goes from 0.0 to 1.0
          v_color = gl_Position * 0.5 + 0.5;
    }`;

    fragShader = `
    precision highp float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }`;

    gl: WebGLRenderingContext;
    private arrowBuffer: BufferInfo;
    private programInfo: ProgramInfo;

    constructor(canavs: HTMLCanvasElement, settings: settings) {

        const gl = canavs.getContext('webgl');

        if (!gl) {
            alert('Need WebGL support');
        }

        this.gl = gl!;
        this.programInfo = createProgramInfo(this.gl, [this.vertShader, this.fragShader]);

        const arrow = this.makeArrow();
        this.arrowBuffer = createBufferInfoFromArrays(
            this.gl,
            {position: arrow},
        );
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    }

    public render() {
        this.gl.useProgram(this.programInfo.program);
        setBuffersAndAttributes(this.gl, this.programInfo, this.arrowBuffer);
        // twgl.setUniforms(programInfo, uniforms);
        drawBufferInfo(this.gl, this.arrowBuffer);

    }

    private makeArrow(size = 0.25) {
        return [
            size, 0, 0,
            -size, 0, 0,
            0, size, 0,
        ];
    }
}
