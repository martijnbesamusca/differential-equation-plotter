import {CTX} from './controller';
import * as twgl from 'twgl.js';

interface glyphInfo {
    width: number;
    x: number;
}

export default class TextureAtlas {
    private properties: {[key:string]: glyphInfo} = {};

    private chars: string[];
    private font: string;
    private size: number;

    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;

    constructor(chars: string[]|string, font: string, size: number) {
        if (typeof chars === 'string') {
            chars = chars.split('');
        }
        this.chars = chars;
        this.font = font;
        this.size = size;

        this.initCanvas();
        this.buildProperties();

        for (const char of chars) {
            const {width, x} = this.properties[char];
            this.ctx.fillText(char, x, 0);
        }
        document.body.append(this.canvas);
    }

    private initCanvas() {
        const canvas = document.createElement('canvas');
        canvas.height = this.size;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw Error('No 2d canvas');
        this.canvas = canvas;
        this.ctx = ctx;
    }

    private setStyle() {
        this.ctx.font = `${this.size}px ${this.font}`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.direction = 'ltr';
        this.ctx.fillStyle = '#000';
    }

    private buildProperties() {
        let pos = 0;
        this.setStyle();
        for (const char of this.chars) {
            const info = this.ctx.measureText(char);
            this.properties[char] = {
                width: info.width,
                x: pos
            };
            pos += info.width;
        }
        this.canvas.width = pos;
        this.setStyle();
    }

    getCharProp(chr: string) {
        return this.properties[chr];
    }

    createTexture(gl: CTX) {
        const options: twgl.TextureOptions = {
            target: gl.TEXTURE_2D,
            src: this.canvas
        };

        return new Promise(resolve => {
            twgl.createTexture(gl, options, resolve);
        })
    }

    createCoords(text: string) {
        const len = text.length;
        const position = new Float32Array(len * 2);
        const texcoords = new Float32Array(len * 2);

        const texWidth =  this.canvas.width;
        const texHeight =  this.canvas.height;

        let cursor = 0;
        for (let i = 0; i < len; i ++) {
            const char = text[i];
            const info = this.properties[char];

            const texleft = info.x / texWidth;
            const texRight = texleft + info.width / texWidth;
            const texTop = 0;
            const texBottom =  this.size / texHeight;

            const vertLeft = cursor;
            const vertRight = cursor + info.width;
            const vertTop = 0;
            const vertBottom = this.size;

            const offset = i * 12;

            // Top left
            position[offset] = vertLeft;
            position[offset + 1] = vertTop;
            texcoords[offset] = texleft;
            texcoords[offset + 1] = texTop;
            // Bottom right
            position[offset + 2] = vertRight;
            position[offset + 3] = vertBottom;
            texcoords[offset + 2] = texRight;
            texcoords[offset + 3] = texBottom;
            // bottom left
            position[offset + 4] = vertLeft;
            position[offset + 5] = vertBottom;
            texcoords[offset + 4] = texleft;
            texcoords[offset + 5] = texBottom;

            // Top left
            position[offset + 6] = vertLeft;
            position[offset + 7] = vertTop;
            texcoords[offset + 6] = texleft;
            texcoords[offset + 7] = texTop;
            // Bottom right
            position[offset + 8] = vertRight;
            position[offset + 9] = vertBottom;
            texcoords[offset + 8] = texRight;
            texcoords[offset + 9] = texBottom;
            // top right
            position[offset + 10] = vertRight;
            position[offset + 11] = vertTop;
            texcoords[offset + 10] = texRight;
            texcoords[offset + 11] = texTop;
        }
        return {
            arrays: {
                position,
                texcoords
            },
            numVertices: len*2
        }
    }

    static async build() {

    }
}
