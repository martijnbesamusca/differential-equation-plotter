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

function drawToCanvas(plot: HTMLCanvasElement, grid: SVGElement) {
  const gridCopy = grid.cloneNode(true) as SVGElement;
  inlineStyle(gridCopy, grid);

  const drawCanvas = document.createElement("canvas");

  const bbox = grid.getBoundingClientRect();
  drawCanvas.width = bbox.width;
  drawCanvas.height = bbox.height;

  const drawCTX = drawCanvas.getContext("2d")!;
  drawCTX.drawImage(plot, 0, 0);

  drawSVGToCanvas(drawCanvas, gridCopy);
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

function createVideoStream(plot: HTMLCanvasElement, grid: SVGElement, duration: number) {
  const gridCopy = grid.cloneNode(true) as SVGElement;
  inlineStyle(gridCopy, grid);

  const gridCanvas = document.createElement("canvas");
  const drawCanvas = document.createElement("canvas");

  const bbox = grid.getBoundingClientRect();
  gridCanvas.width = bbox.width;
  gridCanvas.height = bbox.height;
  drawCanvas.width = bbox.width;
  drawCanvas.height = bbox.height;

  const drawCTX = drawCanvas.getContext("2d")!;
  drawSVGToCanvas(gridCanvas, gridCopy);
  drawCTX.fillStyle = 'white';
  let stop = false;
  function draw() {
    if(stop) return;
    drawCTX.fillRect(0,0, bbox.width, bbox.height);
    drawCTX.drawImage(plot, 0, 0);
    drawCTX.drawImage(gridCanvas, 0, 0);
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
  setTimeout(() => stop = true, duration);

  return drawCanvas;
}

export async function downloadAsWebM(mimeType:string, duration: number, plot: HTMLCanvasElement, grid: SVGElement) {
  // const duration = 5000;
  const merge = createVideoStream(plot, grid, duration);
  const stream = merge.captureStream(24);
  const recorder = new MediaRecorder(stream, { 'mimeType' : mimeType });
  let ext = '';
  if(mimeType.startsWith('video/webm')) {
    ext = 'webm';
  } else if (mimeType.startsWith('video/x-matroska')) {
    ext = 'mkv';
  } else if (mimeType.startsWith('video/mp4')) {
    ext = 'mp4';
  }
  const chunks: BlobPart[] = [];
  setTimeout(() => recorder.stop(), duration);
  recorder.onstop = (e) => {
    const blob = new Blob(chunks, { 'type' : 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = 'plot_view.' + ext;
    a.click();
  };
  recorder.ondataavailable = function(e) {
    console.log('data');
    chunks.push(e.data);
  };
  recorder.start();
}
