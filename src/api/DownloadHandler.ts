import store from "@/store";
import "@/api/lib/gif.js/gif.worker";
import "@/api/lib/gif.js/gif";

interface GIFOptions {
  repeat?: number;
  quality?: number;
  workers?: number;
  workerScript?: string;
  background?: string;
  width?: number;
  height?: number;
  transparent?: string;
  dither?:
    | false
    | "FloydSteinberg"
    | "FalseFloydSteinberg"
    | "Stucki"
    | "Atkinson";
  debug?: boolean;
}

interface AddFrameOptions {
  delay?: number;
  copy?: boolean;
  dispose?: number;
}

declare class GIF {
  constructor(options: GIFOptions);
  addFrame(
    imageElement:
      | HTMLImageElement
      | HTMLCanvasElement
      | CanvasRenderingContext2D,
    options: AddFrameOptions
  ): void;

  on(event: string, callback: (blob: Blob) => void): void;
  render(): void;
}

function inlineStyle(destination: SVGElement, source: SVGElement) {
  for (let i = 0; i < destination.childNodes.length; i++) {
    const child = destination.childNodes[i] as SVGElement;
    if (child.tagName === "svg" || child.tagName === "g") {
      inlineStyle(child, source.childNodes[i] as SVGElement);
    } else {
      const style = getComputedStyle(source.childNodes[i] as Element);
      if (!style) continue;
      for (const rule of style) {
        child.style.setProperty(rule, style.getPropertyValue(rule));
      }
    }
  }
}

function drawBackground(destination: HTMLCanvasElement) {
  const ctx = destination.getContext("2d")!;
  const imgData = ctx.getImageData(0, 0, destination.width, destination.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    const mixColor = 255 * (1 - alpha);
    data[i] = data[i] * alpha + mixColor;
    data[i + 1] = data[i + 1] * alpha + mixColor;
    data[i + 2] = data[i + 2] * alpha + mixColor;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
}

async function drawSVGToCanvas(
  destination: HTMLCanvasElement,
  source: SVGElement
) {
  const data = source.outerHTML;
  const ctx = destination.getContext("2d")!;
  const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  return new Promise(resolve => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.src = url;
  });
}

function executeDownloadAsPNG(source: HTMLCanvasElement) {
  const a = document.createElement("a");
  const url = source.toDataURL("image/png");
  a.download = "plot.png";
  a.href = url;
  a.click();
}

function executeDownloadAsJPG(source: HTMLCanvasElement) {
  const a = document.createElement("a");
  const url = source.toDataURL("image/jpeg");
  a.download = "plot.jpg";
  a.href = url;
  a.click();
  a.remove();
}

async function drawToCanvas(plot: HTMLCanvasElement, grid: SVGElement) {
  const gridCopy = grid.cloneNode(true) as SVGElement;
  inlineStyle(gridCopy, grid);

  const drawCanvas = document.createElement("canvas");

  const bbox = grid.getBoundingClientRect();
  drawCanvas.width = bbox.width;
  drawCanvas.height = bbox.height;

  const drawCTX = drawCanvas.getContext("2d")!;
  drawCTX.drawImage(plot, 0, 0);

  await drawSVGToCanvas(drawCanvas, gridCopy);
  return drawCanvas;
}

export async function downloadAsPNG(plot: HTMLCanvasElement, grid: SVGElement) {
  const drawCanvas = await drawToCanvas(plot, grid);
  executeDownloadAsPNG(drawCanvas);
  drawCanvas.remove();
}

export async function downloadAsJPG(plot: HTMLCanvasElement, grid: SVGElement) {
  const drawCanvas = await drawToCanvas(plot, grid);
  drawBackground(drawCanvas);
  executeDownloadAsJPG(drawCanvas);
  drawCanvas.remove();
}

export async function downloadAsGIF() {
  let frameI = 0;
  let frameMod = 0;
  const frameSkip = 2;
  const length = 5;
  const fps = 20;
  const plot = store.state.plot.plot;
  const gif = new GIF({
    workers: 1,
    quality: 10,
    workerScript: "lib/gif.js/gif.worker.js"
  });
  gif.on("finished", finishGIF);
  function finishGIF(blob: Blob) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.download = "plot.gif";
    a.href = url;
    a.click();
    a.remove();
  }

  async function renderGIF(event: Event) {
    frameMod++;
    if (frameMod == frameSkip) {
      frameMod = 0;
    } else {
      return;
    }

    store.commit("setPlaying", false);
    if (frameI >= length * fps) {
      plot.removeEventListener("render", renderGIF);
      store.commit("setPlaying", true);
      return;
    }
    frameI++;
    const drawCanvas = await drawToCanvas(plot.canvas, plot.svg);
    drawBackground(drawCanvas);
    gif.addFrame(drawCanvas, {
      delay: 1.0 / fps
    });
    drawCanvas.remove();

    store.commit("setPlaying", true);
    console.log("Render: " + frameI);
    if (frameI == length * fps - 1) {
      gif.render();
    }
  }
  store.commit("setPlaying", true);
  plot.addEventListener("render", renderGIF);
}
