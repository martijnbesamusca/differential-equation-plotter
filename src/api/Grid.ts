import {Settings} from '@/store/modules/settings';
import NumberFormat from '@/api/NumberFormat';

export default class Grid {
    private svg: SVGElement;
    private numbersHorizantal: SVGTextElement[];
    private numbersVertical: SVGTextElement[];
    private linesHorizontal: SVGLineElement[];
    private linesVertical: SVGLineElement[];
    private settings: Settings;

    private minGap = 10;
    private gridNumX: number;
    private gridNumY: number;
    private format: NumberFormat;

    constructor(svg: SVGElement, settings: Settings) {
        this.svg = svg;
        this.settings = settings;
        this.format = new NumberFormat(5);
        this.numbersHorizantal = [];
        this.numbersVertical = [];

        this.linesHorizontal = [];
        this.linesVertical = [];

        this.gridNumX = Math.floor(this.svg.clientWidth / this.minGap);
        this.gridNumY = Math.floor(this.svg.clientHeight / this.minGap);

        for (let i = 0; i < this.gridNumX; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.classList.add('line_grid');
            line.classList.add('line_vertical');
            this.linesVertical.push(line);
            this.svg.appendChild(line);
        }

        for (let i = 0; i < this.gridNumY; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.classList.add('line_grid');
            line.classList.add('line_horizontal');
            this.linesHorizontal.push(line);
            this.svg.appendChild(line);
        }

        for (let i = 0; i < this.gridNumX / 10; i++) {
            const number = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            number.classList.add('text_grid');
            number.classList.add('text_vertical');
            this.numbersVertical.push(number);
            this.svg.appendChild(number);
            number.setAttribute('y', '50%');
            number.setAttribute('dx', '-0.2em');
            number.setAttribute('dy', '1.2em');
        }

        for (let i = 0; i < this.gridNumY / 10; i++) {
            const number = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            number.classList.add('text_grid');
            number.classList.add('text_horizontal');
            this.numbersHorizantal.push(number);
            this.svg.appendChild(number);
            number.setAttribute('x', '50%');
            number.setAttribute('dy', '0.4em');
        }


        this.render();
    }

    public render() {
        const width = this.settings.viewbox.x.max - this.settings.viewbox.x.min;
        const height = this.settings.viewbox.y.max - this.settings.viewbox.y.min;

        const resX = this.findOptimalRes(width, this.gridNumX);
        const resY = this.findOptimalRes(height, this.gridNumY);

        const startX = Math.floor(this.settings.viewbox.x.min / resX) * resX;
        const startY = Math.floor(this.settings.viewbox.y.min / resY) * resY;

        const startMainX = Math.ceil(this.settings.viewbox.x.min / (resX * 10)) * 10 -  Math.floor(this.settings.viewbox.x.min / resX);
        const startMainY = Math.ceil(this.settings.viewbox.y.min / (resY * 10)) * 10 -  Math.floor(this.settings.viewbox.y.min / resY);

        this.svg.setAttribute('viewBox', `0 0 ${this.svg.clientWidth} ${this.svg.clientHeight}`);


        for (let i = 0; i < this.gridNumX; i++) {
            const line = this.linesVertical[i];

            const x = startX + i * resX;
            const xPer = (x - this.settings.viewbox.x.min) / width * 100;

            line.setAttribute('x1', `${xPer}%`);
            line.setAttribute('x2', `${xPer}%`);
            line.setAttribute('y1', `0`);
            line.setAttribute('y2', `${this.svg.clientHeight}`);

            this.setClass(line, 'line_axis', x === 0);
            line.setAttribute('data-x', `${this.format.format(x)}`);
            line.classList.remove('line_extra');
        }

        for (let i = 0; i * 10 + startMainX < this.gridNumX; i++) {
            const line = this.linesVertical[startMainX + i * 10];
            line.classList.add('line_extra');

            const number = this.numbersVertical[i];
            number.textContent =  line.getAttribute('data-x')!;
            const numberY = this.svg.clientHeight * (-this.settings.viewbox.y.min / height);
            number.setAttribute('x', line.getAttribute('x1')!);
            number.setAttribute('y', numberY.toString());
            number.setAttribute('dy', '1.2em');

            const bbox = number.getBBox();
            if (bbox.y + bbox.height > this.svg.clientHeight) {
                number.setAttribute('y', this.svg.clientHeight.toString());
                number.setAttribute('dy', '-0.1em');
            }

            this.setClass(number, 'text_zero', number.textContent === '0');
        }

        // Set vertical lines
        for (let i = 0; i < this.gridNumY; i++) {
            const line = this.linesHorizontal[i];

            const y = startY + i * resY;
            const yPer = (y - this.settings.viewbox.y.min) / height * 100;

            line.setAttribute('x1', `0`);
            line.setAttribute('x2', `${this.svg.clientWidth}`);
            line.setAttribute('y1', `${yPer}%`);
            line.setAttribute('y2', `${yPer}%`);

            this.setClass(line, 'line_axis', y === 0);
            line.setAttribute('data-y', `${this.format.format(y)}`);
            line.classList.remove('line_extra');
        }

        for (let i = 0; i * 10 + startMainY < this.gridNumY; i++) {
            const line = this.linesHorizontal[startMainY + i * 10];
            line.classList.add('line_extra');

            const number = this.numbersHorizantal[i];
            number.textContent =  line.getAttribute('data-y')!;
            const numberX = this.svg.clientWidth * (-this.settings.viewbox.x.min / width);
            number.setAttribute('x', numberX.toString());
            number.setAttribute('y', line.getAttribute('y1')!);
            number.setAttribute('dx', '-0.3em');

            const bbox = number.getBBox();
            if (bbox.x < 0) {
                number.setAttribute('x', '0');
                number.setAttribute('dx', '0.2em');
            }

            this.setClass(number, 'text_border', bbox.x < 0);
            this.setClass(number, 'text_zero', number.textContent === '0');
        }
    }

    public setClass(elm: Element, className: string, enable: boolean) {
        if (enable) {
            elm.classList.add(className);
        } else {
            elm.classList.remove(className);
        }
    }

    public findOptimalRes(length: number, maxLines: number): number {
        const options = [1, 2, 5];
        const res = 10 ** (Math.floor(Math.log10(length / maxLines)));
        let multiple = 1;
        for (const option of [1, 2, 5, 10]) {
            if (res * option * maxLines >= length ) {
                multiple = option;
                break;
            }
        }
        return res * multiple;
    }

    public updateSettings(settings: Settings) {
        this.settings = settings;
    }
}
