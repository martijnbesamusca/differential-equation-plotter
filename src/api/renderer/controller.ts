export type CTX = WebGLRenderingContext | WebGL2RenderingContext;
import * as twgl from 'twgl.js';

export interface IRenderer {
    init(gl: CTX): void;
    draw(time?: number): void;
    destroy(): void;
}

const renderers: (IRenderer | null)[] = [];
let gl: CTX;

export function init(canvas: HTMLCanvasElement) {
    let gl_n: CTX | null = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
    if (!gl_n) {
        console.warn('WebGL2 not supported: trying webgl v1');
        gl_n = canvas.getContext('webgl');
    }
    if (!gl_n) {
        console.error('Webgl is not supported');
        return;
    }
    gl = gl_n;
    gl.clearColor(1, 1, 1, 1);
    twgl.setAttributePrefix("a_");

    for(const renderer of renderers) {
        if (renderer === null) continue;
        renderer.init(gl);
    }

    requestAnimationFrame(draw);
}

export function draw(time: number) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for(const renderer of renderers) {
        if (renderer === null) continue;
        renderer.draw(time);
    }
    requestAnimationFrame(draw);
}

export function addRenderer(renderer: IRenderer): number {
    if(gl === null) {
        console.error('RenderingContext not initialized: run init() first.');
        return -1;
    }
    renderer.init(gl);
    return renderers.push(renderer) - 1;
}

export function removeRenderer(index: number) {
    const renderer = renderers[index];
    if(renderer === null) {
        console.warn('Attempt to remove an already removed renderer.');
        return;
    }
    renderer.destroy();
    delete renderers[index];
}
