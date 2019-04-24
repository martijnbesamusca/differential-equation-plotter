import {
    BufferInfo,
    createBufferInfoFromArrays,
    drawBufferInfo,
    m4,
    ProgramInfo,
    resizeCanvasToDisplaySize, setUniforms
} from 'twgl.js';
import settings from '@/store/modules/settings';
import {createProgramInfo, setBuffersAndAttributes} from 'twgl.js/dist/4.x/twgl';
import ortho = m4.ortho;


export default class ParticleTest {
    vertShader = `
    precision highp float;
    attribute vec2 a_position;

    uniform mat4 u_matrix;

    // varying vec4 v_color;

    void main() {
          // Multiply the position by the matrix.
          gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);

          // Convert from clipspace to colorspace.
          // Clipspace goes -1.0 to +1.0
          // Colorspace goes from 0.0 to 1.0
          // v_color = gl_Position * 0.5 + 0.5;
    }`;

    fragShader = `
    precision highp float;
    // varying vec4 v_color;
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }`;

    gl: WebGLRenderingContext;
    private arrowBuffer: BufferInfo;
    private programInfo: ProgramInfo;
    private ortho: m4.Mat4;

    constructor(canavs: HTMLCanvasElement, settings: settings) {
        const gl = canavs.getContext('webgl');

        if (!gl) {
            alert('Need WebGL support');
        }

        this.gl = gl!;
        this.programInfo = createProgramInfo(this.gl, [this.vertShader, this.fragShader]);

        const arrow = this.makeArrow(1);
        this.arrowBuffer = createBufferInfoFromArrays(
            this.gl,
            {position: {numComponents: 2, data: arrow}},
        );
        this.ortho = ortho(settings.viewbox.x.min, settings.viewbox.x.max, settings.viewbox.y.min, settings.viewbox.y.max, -1, 1);
        console.log(this.programInfo, this.arrowBuffer, this.ortho)
    }

    public render() {
        resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.useProgram(this.programInfo.program);
        setBuffersAndAttributes(this.gl, this.programInfo, this.arrowBuffer);
        setUniforms(this.programInfo, {
            u_matrix: this.ortho
        });
        drawBufferInfo(this.gl, this.arrowBuffer);
        requestAnimationFrame(()=>this.render);


    }

    private makeArrow(size = 0.25) {
        return [
            size, 0,
            -size, 0,
            0, size,
        ];
    }
}
