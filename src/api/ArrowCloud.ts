import {
  addExtensionsToContext,
  BufferInfo,
  createBufferInfoFromArrays,
  createProgramInfo,
  createVertexArrayInfo,
  drawBufferInfo,
  ProgramInfo,
  setAttribInfoBufferFromArray,
  setBuffersAndAttributes,
  setUniforms,
  VertexArrayInfo
} from "twgl.js";
import chroma from "chroma-js";
// @ts-ignore
import arrowFrag from "./shaders/webgl1/arrow.frag";
// @ts-ignore
import arrowVert from "./shaders/webgl1/arrow.vert";
import ODEEstimator from "@/api/ODEEstimator";

export default class ArrowCloud {
  public static MAX_NUM_ARROWS = 10000;

  private readonly gl: WebGLRenderingContext;
  private readonly arrowVertexArray: VertexArrayInfo;
  private readonly programInfo: ProgramInfo;

  private readonly pos!: Float32Array;
  private readonly age!: Uint16Array;
  private readonly color!: Float32Array;
  private readonly alpha!: Float32Array;
  private readonly dx: Float32Array;
  private readonly dy: Float32Array;

  private settings: any;
  private readonly uniforms: { [key: string]: any };
  private readonly arrowInfoBuffer: BufferInfo;
  private readonly arrowArray: { [key: string]: any };
  private arrow: number[];

  private ODEEstimator: ODEEstimator;

  constructor(
    gl: WebGLRenderingContext,
    globUniforms: { [key: string]: any },
    settings: any,
    ODEEstimator: ODEEstimator
  ) {
    this.gl = gl;
    this.settings = settings;
    this.ODEEstimator = ODEEstimator;

    addExtensionsToContext(this.gl);
    this.programInfo = createProgramInfo(this.gl, [arrowVert, arrowFrag]);

    this.arrow = [];
    this.resizeArrows(false);

    this.pos = new Float32Array(ArrowCloud.MAX_NUM_ARROWS * 2);
    this.age = new Uint16Array(ArrowCloud.MAX_NUM_ARROWS);
    this.color = new Float32Array(ArrowCloud.MAX_NUM_ARROWS * 3);
    this.alpha = new Float32Array(ArrowCloud.MAX_NUM_ARROWS);
    this.dx = new Float32Array(ArrowCloud.MAX_NUM_ARROWS);
    this.dy = new Float32Array(ArrowCloud.MAX_NUM_ARROWS);
    this.initArrows();

    this.arrowArray = {
      a_vert_pos: {
        numComponents: 2,
        data: this.arrow
      },
      a_glob_pos: {
        numComponents: 2,
        data: this.pos,
        divisor: 1
      },
      a_color: {
        numComponents: 3,
        data: this.color,
        divisor: 1
      },
      a_alpha: {
        numComponents: 1,
        data: this.alpha,
        divisor: 1
      },
      a_dx: {
        numComponents: 1,
        data: this.dx,
        divisor: 1
      },
      a_dy: {
        numComponents: 1,
        data: this.dy,
        divisor: 1
      }
    };
    this.arrowInfoBuffer = createBufferInfoFromArrays(this.gl, this.arrowArray);
    this.arrowVertexArray = createVertexArrayInfo(
      this.gl,
      this.programInfo,
      this.arrowInfoBuffer
    );
    this.uniforms = globUniforms;
  }

  public render() {
    this.move();

    this.gl.useProgram(this.programInfo.program);

    setAttribInfoBufferFromArray(
      this.gl,
      this.arrowInfoBuffer.attribs!.a_glob_pos,
      this.arrowArray.a_glob_pos
    );
    setAttribInfoBufferFromArray(
      this.gl,
      this.arrowInfoBuffer.attribs!.a_color,
      this.arrowArray.a_color
    );
    setAttribInfoBufferFromArray(
      this.gl,
      this.arrowInfoBuffer.attribs!.a_alpha,
      this.arrowArray.a_alpha
    );
    setAttribInfoBufferFromArray(
      this.gl,
      this.arrowInfoBuffer.attribs!.a_dx,
      this.arrowArray.a_dx
    );
    setAttribInfoBufferFromArray(
      this.gl,
      this.arrowInfoBuffer.attribs!.a_dy,
      this.arrowArray.a_dy
    );

    setBuffersAndAttributes(this.gl, this.programInfo, this.arrowVertexArray);
    setUniforms(this.programInfo, this.uniforms);

    drawBufferInfo(
      this.gl,
      this.arrowVertexArray,
      this.gl.TRIANGLES,
      this.arrowVertexArray.numElements,
      0,
      this.settings.arrowAmount
    );
  }

  public updateSettings(settings: any) {
    this.settings = settings;
  }

  public resizeArrows(update = true) {
    const newArrow = this.makeArrow(1, 0.3, 1.5, this.settings.arrowSize);
    if (update) {
      for (let i = 0; i < newArrow.length; i++) {
        this.arrow[i] = newArrow[i];
      }
      setAttribInfoBufferFromArray(
        this.gl,
        this.arrowInfoBuffer.attribs!.a_vert_pos,
        this.arrowArray.a_vert_pos
      );
    } else {
      this.arrow = newArrow;
    }
  }

  public colorArrows() {
    const color = chroma(this.settings.arrowColor);
    if (this.settings.arrowRandomColor) {
      const [h, s, l] = color.hsl();
      const hueSpread = 20;
      const saturationSpread = 0.2;
      const lightnessSpread = 0.2;
      for (let i = 0; i < this.pos.length; i++) {
        const [r, g, b] = color
          .set("hsl.h", h + this.randomInt(-hueSpread, hueSpread))
          .set(
            "hsl.s",
            s + this.randomFloat(-saturationSpread, saturationSpread)
          )
          .set("hsl.l", l + this.randomFloat(-lightnessSpread, lightnessSpread))
          .gl();
        this.color[i * 3] = r;
        this.color[i * 3 + 1] = g;
        this.color[i * 3 + 2] = b;
      }
    } else {
      const [r, g, b] = color.gl();
      for (let i = 0; i < this.pos.length; i++) {
        this.color[i * 3] = r;
        this.color[i * 3 + 1] = g;
        this.color[i * 3 + 2] = b;
      }
    }
  }

  public initArrows() {
    for (let i = 0; i < this.pos.length; i++) {
      const x = this.randomFloat(
        this.settings.viewbox.x.min,
        this.settings.viewbox.x.max
      );
      const y = this.randomFloat(
        this.settings.viewbox.y.min,
        this.settings.viewbox.y.max
      );

      this.pos[i * 2] = x;
      this.pos[i * 2 + 1] = y;
      this.dx[i] = this.ODEEstimator.dxFunction(x, y);
      this.dy[i] = this.ODEEstimator.dyFunction(x, y);

      this.age[i] = this.randomInt(0, this.settings.arrowMaxAge);
      this.alpha[i] = 0.0;
    }

    this.colorArrows();
  }

  private move() {
    const speed = this.settings.speed / 100;
    const normalize = this.settings.normalizeSpeed;
    const method = this.settings.ODEAproxmethod;
    const estimation = { posX: 0, posY: 0, stepX: 0, stepY: 0, dx: 0, dy: 0 };

    for (let i = 0; i < this.settings.arrowAmount; i++) {
      estimation.posX = this.pos[i * 2];
      estimation.posY = this.pos[i * 2 + 1];

      estimation.dx = this.dx[i];
      estimation.dy = this.dy[i];

      this.ODEEstimator.stepFrom(estimation, speed, normalize, method);

      this.pos[i * 2] = estimation.posX;
      this.pos[i * 2 + 1] = estimation.posY;

      this.dx[i] = estimation.dx;
      this.dy[i] = estimation.dy;

      this.alpha[i] = 1.0;

      if (isNaN(estimation.dx) || isNaN(estimation.dy)) {
        this.alpha[i] = 0.0;
        this.age[i] = this.settings.arrowMaxAge;
      }

      this.age[i] += 1;
      if (
        this.age[i] >= this.settings.arrowMaxAge ||
        !this.isInBounds(estimation.posX, estimation.posY)
      ) {
        const x = this.randomFloat(
          this.settings.viewbox.x.min,
          this.settings.viewbox.x.max
        );
        const y = this.randomFloat(
          this.settings.viewbox.y.min,
          this.settings.viewbox.y.max
        );
        this.pos[i * 2] = x;
        this.pos[i * 2 + 1] = y;

        const dx = this.ODEEstimator.dxFunction(x, y);
        const dy = this.ODEEstimator.dyFunction(x, y);
        this.dx[i] = dx;
        this.dy[i] = dy;

        if (this.settings.arrowRandomizeMaxAge) {
          this.age[i] = Math.round(
            Math.random() * this.settings.arrowMaxAge * 0.1
          );
        } else {
          this.age[i] = 0;
        }

        this.alpha[i] = isNaN(this.dx[i]) || isNaN(this.dy[i]) ? 0.0 : 1.0;
      }
    }
  }

  private isInBounds(x: number, y: number) {
    return (
      this.settings.viewbox.x.min <= x &&
      this.settings.viewbox.x.max >= x &&
      this.settings.viewbox.y.min <= y &&
      this.settings.viewbox.y.max >= y
    );
  }

  private randomFloat(min: number, max: number) {
    return min + Math.random() * (max - min);
  }

  private randomInt(min: number, max: number) {
    return Math.floor(min + Math.random() * (max - min));
  }

  private makeArrow(
    sizeArrow: number,
    widthBase: number,
    heightBase: number,
    scale: number = 1
  ) {
    let arrow = [
      sizeArrow,
      0,
      -sizeArrow,
      0,
      0,
      sizeArrow,

      widthBase,
      0,
      -widthBase,
      0,
      -widthBase,
      -heightBase,

      widthBase,
      -heightBase,
      -widthBase,
      -heightBase,
      widthBase,
      0
    ];
    arrow = arrow.map(value => value * scale);
    return arrow;
  }
}
