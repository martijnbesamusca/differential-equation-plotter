import {CTX} from './controller';
import * as twgl from 'twgl.js';
import settings from "../../api/store/settings";
import TextureAtlas from './textureAtlas';

// @ts-ignore
import vs from '../../shaders/axis.vert'
// @ts-ignore
import fs from '../../shaders/axis.frag'
import {square} from './geometry';

let gl: CTX;
let programInfo: twgl.ProgramInfo;
let bufferInfo: twgl.BufferInfo;

const minGap = 10;
let num_x;

/*
 0-3: x, 4-7 : y
 + 0: axis
 + 1: major
 + 2: minor
 */
const type_buffer = new Uint8Array(100); // TODO: Better max
const arrays = {
    position: {data: square, numComponents: 2},
    type: {data: type_buffer, numComponents: 1, divisor: 1}
};

const uniforms = {
    resolution: new Float32Array([0, 0]),
    window: new Float32Array([0, 0, 0, 0]),
    num_x: 0,
    num_y: 0,
    tick_lim: new Float32Array([0, 0, 0, 0])
};

export function init(glIn: CTX) {
    const atlas = new TextureAtlas('0123456789e.,', 'serif', 16);
    console.log(atlas);
    gl = glIn;
    tickerX();
    settings.window.subscribe('min_x', (val) => {
        uniforms.window[0] = val;
        tickerX();
    });
    settings.window.subscribe('max_x', (val) => {
        uniforms.window[1] = val;
        tickerX();
    });
    console.log(uniforms);
    programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    //init uniforms
    // twgl.setUniforms(programInfo, uniforms);
    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    console.log(bufferInfo, gl.UNSIGNED_INT);
}

export function draw(time: number) {
    uniforms.resolution[0] = gl.canvas.width;
    uniforms.resolution[1] = gl.canvas.height;
    uniforms.window[0] = settings.window.get('min_x') as number;
    uniforms.window[1] = settings.window.get('max_x') as number;
    uniforms.window[2] = settings.window.get('min_y') as number;
    uniforms.window[3] = settings.window.get('max_y') as number;

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, bufferInfo.numElements, 0,  uniforms.num_x + uniforms.num_y);
}

export function destroy() {

}

function tickerX() {
    const tx = ticker(settings.window.get('min_x') as number, settings.window.get('max_x') as number);
    const ty = ticker(settings.window.get('min_y') as number, settings.window.get('max_y') as number);
    type_buffer.fill(1, 0, tx.num_tick);
    type_buffer.fill(5, tx.num_tick, tx.num_tick+ty.num_tick);

    if(tx.zero_tick) type_buffer[tx.zero_tick] = 0;
    if(ty.zero_tick) type_buffer[tx.num_tick + ty.zero_tick] = 4;
    console.log(type_buffer);
    if (bufferInfo != undefined) {
        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    }
    uniforms.num_x = tx.num_tick;
    uniforms.num_y = ty.num_tick;

    uniforms.tick_lim[0] = tx.min_tick + tx.offset;
    uniforms.tick_lim[1] = tx.max_tick + tx.offset;
    uniforms.tick_lim[2] = ty.min_tick + ty.offset;
    uniforms.tick_lim[3] = ty.max_tick + ty.offset;

}

// inspired from matplotlib MaxNLocator
function ticker(val_min: number, val_max: number) {
    // const desiredSteps = 10;
    const min_ticks = 9;
    const width = val_max - val_min;
    const mean = (val_max + val_min) / 2;
    const scale = 10 ** (Math.floor(Math.log10(width)));
    const offset = Math.sign(mean) * 10 ** (Math.floor(Math.log10(Math.abs(mean))));
    val_min -= offset;
    val_max -= offset;
    // const raw_step = (val_max - val_min) / desiredSteps;
    const steps = [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1];
    for (const step of steps) {
        const min_tick = Math.ceil(val_min / step) * step;
        const max_tick = Math.floor(val_max / step) * step;
        const num_tick = (max_tick - min_tick) / step;

        if (num_tick >= min_ticks) {
            // type_buffer.fill(1);
            // console.log(type_buffer);
            let zero_tick = -1;
            if (min_tick <= 0 && max_tick >= 0) {
                zero_tick = -Math.round(min_tick / step);
            }

            return {min_tick, max_tick, zero_tick, num_tick, step, offset};
        }
    }
    return {min_tick: 0, max_tick:0, zero_tick:0, num_tick: 0, step:0, offset:0};
}
