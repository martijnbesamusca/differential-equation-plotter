import ODEEstimator from "@/api/ODEEstimator";
import {
    ProgramInfo,
    createProgramInfo,
    drawBufferInfo,
    createBufferInfoFromArrays,
    setBuffersAndAttributes,
    setUniforms,
    m4,
    BufferInfo,
    primitives,
} from "twgl.js";
import {Settings} from "@/store/modules/settings";
// @ts-ignore
import arrowFrag from './shaders/webgl1/nullcline.frag';
// @ts-ignore
import arrowVert from './shaders/webgl1/nullcline.vert';

export default class NullclineRenderer {
    private gl: WebGLRenderingContext;
    private programInfo: ProgramInfo;
    private uniforms!: {[key: string]: any};
    private functionImage!: WebGLTexture;
    private resWidth: number = 0;
    private resHeight: number = 0;
    private ODEEstimator: ODEEstimator;
    private settings: Settings;
    private bufferInfo!: BufferInfo;

    constructor(gl: WebGLRenderingContext, width: number, height: number, settings: Settings, ODEEstimator: ODEEstimator) {
        this.gl = gl;
        this.programInfo = createProgramInfo(this.gl, [arrowVert, arrowFrag]);
        this.ODEEstimator = ODEEstimator;
        this.settings = settings;

        gl.getExtension('OES_texture_float');
        gl.getExtension('OES_texture_float_linear');

        this.setRenderSize(width, height);
        this.renderFunction();
        this.initUniformsAndBuffers();
    }

    updateSettings(settings: Settings) {
        this.settings = settings;
    }

    setRenderSize(width: number, height: number) {
        this.resWidth = width;
        this.resHeight = height;
    }

    renderFunction() {
        const width = this.settings.viewbox.x.max - this.settings.viewbox.x.min;
        const height = this.settings.viewbox.y.max - this.settings.viewbox.y.min;
        const image = Float32Array.from({length: this.resWidth * this.resHeight * 2}, (_, i) => {
                const dir = i % 2;
                i = (i / 2) >> 0;
                const x = this.settings.viewbox.x.min + i / this.resWidth % 1 * width;
                const y = this.settings.viewbox.y.min + ((i / this.resWidth) >> 0) / this.resHeight * height;
                return dir ? this.ODEEstimator.dxFunction(x, y) : this.ODEEstimator.dyFunction(x, y);
            }
        );

        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        // @ts-ignore
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.LUMINANCE_ALPHA,
            this.resWidth,
            this.resHeight,
            0,
            this.gl.LUMINANCE_ALPHA,
            this.gl.FLOAT,
            image
        );
        this.functionImage = texture!;
    }

    initUniformsAndBuffers() {
        this.uniforms = {
            u_texture: this.functionImage,
        };

        const arrays = {
            position: {
                numComponents: 2,
                data: [
                    -1, -1,
                    1, -1,
                    -1, 1,
                    -1, 1,
                    1, -1,
                    1, 1,
                ]
            },
        };

        this.bufferInfo = createBufferInfoFromArrays(this.gl, arrays);
    }

    render() {
        this.gl.useProgram(this.programInfo.program);
        this.gl.viewport(0,0, this.resWidth, this.resHeight);
        setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
        setUniforms(this.programInfo, this.uniforms);
        debugger
        drawBufferInfo(this.gl, this.bufferInfo);
    }
}
