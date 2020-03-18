import {CTX} from './controller';
import TextureAtlas from './textureAtlas';
import settings from '../store/settings';
import * as twgl from 'twgl.js';
import {square} from './geometry';

// @ts-ignore
import vs from '../../shaders/axis.vert'
// @ts-ignore
import fs from '../../shaders/axis.frag'

let gl: CTX;
let programInfo: twgl.ProgramInfo;
let bufferInfo: twgl.BufferInfo;

const NEEDED_CHARS = '0123456789e.,';
const MAX_CHARS = 1000;
let atlas: TextureAtlas;
let texture: WebGLTexture;

const offset = new Float32Array(MAX_CHARS * 2);
const letter = new Int8Array(MAX_CHARS);
const width = new Float32Array(MAX_CHARS);
let freeIndex = 0;

const arrays = {
    positions: {data: square, numComponents: 2},
    offset: {data: offset, numComponents: 2, divisor: 1},
    letter: {data: letter, numComponents: 1, divisor: 1},
    width: {data: width, numComponents: 1, divisor: 1}
};

const uniforms = {
    resolution: new Float32Array([0, 0]),
    atlas: undefined as unknown as WebGLTexture,
    height: 16,
};

interface TextBox {
    length: number,
    index: number,
    x: number,
    y: number
}

export function init(gl_in: CTX): void {
    gl = gl_in;
    atlas = new TextureAtlas(NEEDED_CHARS, 'Arial', uniforms.height);
    texture = atlas.createTexture(gl);
    uniforms.atlas = texture;

    programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

export function addTextBox(length: number, str='', x=0, y=0): TextBox {
    const index = freeIndex;
    freeIndex += length;
    const textBox = {
        length,
        index,
        x,
        y
    };
    setText(str, textBox);
    return textBox;
}

export function setText(text: string, textBox: TextBox) {
    if (text.length > textBox.length) {
        throw Error('Text is to long');
    }

    let cursor = textBox.x;
    for(let i = 0; i < text.length; i++) {
        const chr = text[i];
        const prop = atlas.getCharProp(chr);
        offset[i*2] = cursor;
        offset[i*2 + 1] = textBox.y;
        letter[i] = prop.x;
        width[i] = prop.width;

        cursor += prop.width;
    }
    twgl.createBufferInfoFromArrays(gl, arrays, bufferInfo);
}

export function draw(time?: number): void {
    uniforms.resolution[0] = gl.canvas.width;
    uniforms.resolution[1] = gl.canvas.height;
    console.log(bufferInfo)

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, bufferInfo.numElements, 0,  freeIndex);
//
}

export function destroy(): void {

}
