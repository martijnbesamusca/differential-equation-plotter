import Settings, { IValKey } from "@/store/modules/settings";
import NullclineRenderer from "@/api/NullclineRenderer";
import store from "../store/";
import { cloneDeep } from "lodash";
import { m4 } from "twgl.js";
import ArrowCloud from "@/api/ArrowCloud";
import Grid from "@/api/Grid";
import ODEEstimator from "@/api/ODEEstimator";
import SolutionRenderer from "@/api/SolutionRenderer";

export default class PlotRenderer {
  canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext;
  // private cachedFunction: CachedFunction;

  private settings!: any;
  private readonly arrowCloud: ArrowCloud;
  private grid: Grid;
  private readonly uniforms!: { [key: string]: any };

  private readonly ODEEstimator: ODEEstimator;
  private solutions: SolutionRenderer;
  private nullclines: NullclineRenderer;

  constructor(canvas: HTMLCanvasElement, svg: SVGElement, settings: any) {
    store.dispatch("initPlot", this);
    this.canvas = canvas;
    this.settings = settings;
    this.grid = new Grid(svg, this.settings);
    this.ODEEstimator = new ODEEstimator();
    this.solutions = new SolutionRenderer(
      canvas,
      svg,
      this.settings,
      this.ODEEstimator
    );

    const gl = canvas.getContext("webgl");
    if (!gl) {
      alert("Need WebGL support");
    }
    this.gl = gl!;

    this.nullclines = new NullclineRenderer(
      this.gl,
      canvas.width,
      canvas.height,
      settings,
      this.ODEEstimator
    );

    this.uniforms = {};
    this.updateScreenSize();
    this.updateViewBox();

    this.arrowCloud = new ArrowCloud(
      this.gl,
      this.uniforms,
      this.settings,
      this.ODEEstimator
    );

    store.subscribe(
      (mutation: { type: string; payload: IValKey }, state: object) => {
        if (mutation.type !== "changeValue") return;
        // @ts-ignore
        this.settings = cloneDeep(state.settings);
        this.arrowCloud.updateSettings(this.settings);
        this.grid.updateSettings(this.settings);
        this.solutions.updateSettings(this.settings);
        this.nullclines.updateSettings(this.settings);

        const key = mutation.payload.key;

        if (key.startsWith("viewbox") || key === "keepAspectRatio") {
          this.updateViewBox();
          this.nullclines.renderFunction();
        } else if (key === "arrowMaxAge") {
          this.arrowCloud.initArrows();
        } else if (key === "arrowColor" || key === "arrowRandomColor") {
          this.arrowCloud.colorArrows();
        } else if (key === "arrowSize") {
          this.arrowCloud.resizeArrows();
        } else if (key === "ODEType") {
          this.arrowCloud.initArrows();
          this.solutions.clear();
          this.nullclines.updateFunction();
        } else if (key === "solutionStepSize") {
          this.solutions.stepSize = this.settings.solutionStepSize;
        } else if (key === "solutionLength") {
          this.solutions.length = this.settings.solutionLength;
        } else if (key === "solutionODEApproxMethod") {
          this.solutions.method = this.settings.solutionODEApproxMethod;
        } else if (key === "solutionColor") {
          this.solutions.setColor();
        } else if (key === "solutionWidth") {
          this.solutions.setWidth();
        } else if (key === "nullclineXColor" || key === "nullclineYColor") {
          this.nullclines.updateColor();
        } else if (key === "nullclineThreshold") {
          this.nullclines.updateThreshold();
        } else if (key === "nullclineXEnable" || key === "nullclineYEnable") {
          this.nullclines.updateEnabled();
        }
      }
    );
  }

  public updateScreenSize() {
    console.log(this.gl.canvas.width, this.gl.canvas.height);
    this.uniforms.u_screen = m4.ortho(
      -this.gl.canvas.width / 2,
      this.gl.canvas.width / 2,
      -this.gl.canvas.height / 2,
      this.gl.canvas.height / 2,
      -1,
      1
    );
    this.grid.render();
    this.solutions.render();

    this.nullclines.updateSize();
    this.nullclines.render();
    if (this.arrowCloud) this.arrowCloud.render();
  }

  public updateViewBox() {
    this.uniforms.u_camera = m4.ortho(
      this.settings.viewbox.x.min,
      this.settings.viewbox.x.max,
      this.settings.viewbox.y.min,
      this.settings.viewbox.y.max,
      -1,
      1
    );

    this.grid.render();
    this.solutions.render();

    this.nullclines.render();
    if (this.arrowCloud) this.arrowCloud.render();
  }

  public render() {
    if (store.state.plot.playing) {
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.disable(this.gl.DEPTH_TEST);

      this.nullclines.render();
      this.arrowCloud.render();
    }

    requestAnimationFrame(() => this.render());
  }
}
