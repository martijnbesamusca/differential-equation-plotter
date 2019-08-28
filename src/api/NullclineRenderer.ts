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
  createTexture,
  setTextureFromArray
} from "twgl.js";
import { Settings } from "@/store/modules/settings";
// @ts-ignore
import nullclineFrag from "./shaders/webgl1/nullcline.frag";
// @ts-ignore
import nullclineVert from "./shaders/webgl1/nullcline.vert";
import chroma from "chroma-js";

export default class NullclineRenderer {
  private readonly gl: WebGLRenderingContext;
  private readonly programInfo: ProgramInfo;
  private uniforms!: { [key: string]: any };
  private functionArray!: Float32Array;
  private functionImage!: WebGLTexture;
  // private resWidth: number = 0;
  // private resHeight: number = 0;
  private ODEEstimator: ODEEstimator;
  private settings: Settings;
  private bufferInfo!: BufferInfo;

  constructor(
    gl: WebGLRenderingContext,
    width: number,
    height: number,
    settings: Settings,
    ODEEstimator: ODEEstimator
  ) {
    this.gl = gl;
    this.programInfo = createProgramInfo(this.gl, [
      nullclineVert,
      nullclineFrag
    ]);
    this.ODEEstimator = ODEEstimator;
    this.settings = settings;
    this.functionArray = new Float32Array(width * height * 3);

    const ext_tex_fl = gl.getExtension("OES_texture_float");
    const ext_tex_fl_lin = gl.getExtension("OES_texture_float_linear");
    console.log(ext_tex_fl, ext_tex_fl_lin);

    this.renderFunction();
    this.initUniformsAndBuffers();
  }

  updateSettings(settings: Settings) {
    this.settings = settings;
  }

  updateColor() {
    this.uniforms.u_color_x = chroma(this.settings.nullclineXColor).gl();
    this.uniforms.u_color_y = chroma(this.settings.nullclineYColor).gl();
    this.uniforms.u_color_x.pop();
    this.uniforms.u_color_y.pop();
  }

  updateThreshold() {
    this.uniforms.u_threshold = this.settings.nullclineThreshold;
  }

  updateEnabled() {
    this.uniforms.u_enable_x = this.settings.nullclineXEnable;
    this.uniforms.u_enable_y = this.settings.nullclineYEnable;
  }

  updateSize() {
    const resWidth = this.gl.canvas.width;
    const resHeight = this.gl.canvas.height;
    this.functionArray = new Float32Array(resWidth * resHeight * 3);
    this.updateFunction();
  }

  updateFunction() {
    const resWidth = this.gl.canvas.width;
    const resHeight = this.gl.canvas.height;
    this.renderFunction();
    setTextureFromArray(this.gl, this.functionImage, this.functionArray, {
      target: this.gl.TEXTURE_2D,
      width: this.gl.canvas.width,
      height: this.gl.canvas.height,
      minMag: this.gl.LINEAR,
      internalFormat: this.gl.RGB,
      format: this.gl.RGB,
      type: this.gl.FLOAT
    });

    this.uniforms.u_texture_dim = [resWidth, resHeight];
  }

  renderFunction() {
    const resWidth = this.gl.canvas.width;
    const resHeight = this.gl.canvas.height;
    const width = this.settings.viewbox.x.max - this.settings.viewbox.x.min;
    const height = this.settings.viewbox.y.max - this.settings.viewbox.y.min;
    for (let i = 0; i < this.functionArray.length; i++) {
      const dir = i % 3;
      const index = (i / 3) >> 0;

      if (dir === 2) {
        this.functionArray[i] = 0;
        continue;
      }

      const x = this.settings.viewbox.x.min + ((index / resWidth) % 1) * width;
      const y =
        this.settings.viewbox.y.min +
        (((index / resWidth) >> 0) / resHeight) * height;
      this.functionArray[i] = dir
        ? this.ODEEstimator.dxFunction(x, y)
        : this.ODEEstimator.dyFunction(x, y);
    }
    // debugger
  }

  initUniformsAndBuffers() {
    this.functionImage = createTexture(this.gl, {
      target: this.gl.TEXTURE_2D,
      width: this.gl.canvas.width,
      height: this.gl.canvas.height,
      minMag: this.gl.LINEAR,
      internalFormat: this.gl.RGB,
      format: this.gl.RGB,
      type: this.gl.FLOAT,
      src: this.functionArray
    });

    this.uniforms = {
      u_texture: this.functionImage,
      u_texture_dim: [this.gl.canvas.width, this.gl.canvas.height],
      u_enable_x: this.settings.nullclineXEnable,
      u_enable_y: this.settings.nullclineYEnable,
      u_threshold: this.settings.nullclineThreshold
    };

    this.updateColor();

    const arrays = {
      position: {
        numComponents: 2,
        data: [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]
      }
    };

    this.bufferInfo = createBufferInfoFromArrays(this.gl, arrays);
  }

  render() {
    this.gl.useProgram(this.programInfo.program);
    // this.gl.viewport(0,0, this.resWidth, this.resHeight);
    setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
    setUniforms(this.programInfo, this.uniforms);
    drawBufferInfo(this.gl, this.bufferInfo);
  }
}
