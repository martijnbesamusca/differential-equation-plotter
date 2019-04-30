import settings from "@/store/modules/settings";

export default class Grid {
    private svg: SVGElement;
    private numbersHorizantal: SVGTextElement[];
    private numbersVertical: SVGTextElement[];
    private linesHorizontal: SVGLineElement[];
    private linesVertical: SVGLineElement[];
    private settings: settings;

    private minGap = 20;
    private gridNumX: number;
    private gridNumY: number;

    constructor(svg: SVGElement, settings: settings){
        this.svg = svg;
        this.settings = settings;
        this.numbersHorizantal = [];
        this.numbersVertical = [];

        this.linesHorizontal = [];
        this.linesVertical = [];

        this.gridNumX = Math.floor(this.svg.clientWidth / this.minGap);
        this.gridNumY = Math.floor(this.svg.clientHeight / this.minGap);

        for(let i = 0; i < this.gridNumX; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg','line');
            line.classList.add('line_grid');
            line.classList.add('line_vertical');
            this.linesVertical.push(line);
            this.svg.appendChild(line);
        }

        for(let i = 0; i < this.gridNumX / 10; i++){
            const number = document.createElementNS('http://www.w3.org/2000/svg','text');
            number.classList.add('text_grid');
            number.classList.add('text_vertical');
            this.numbersVertical.push(number);
            this.svg.appendChild(number);
            number.setAttribute('y','50%');
            number.setAttribute('dy','1em');
        }

        for(let i = 0; i < this.gridNumY; i++){
            const line = document.createElementNS('http://www.w3.org/2000/svg','line');
            line.classList.add('line_grid');
            line.classList.add('line_horizontal');
            this.linesHorizontal.push(line);
            this.svg.appendChild(line);
        }

        this.render();
    }

    public render() {
        const width = this.settings.viewbox.x.max - this.settings.viewbox.x.min;
        const height = this.settings.viewbox.y.max - this.settings.viewbox.y.min;

        const resX = 10**(Math.ceil(Math.log10(width / this.gridNumX)));
        const resY = 10**(Math.ceil(Math.log10(height / this.gridNumY)));

        console.log(this.findOptimalRes(width, this.gridNumX));

        this.svg.setAttribute('viewBox', `0 0 ${this.svg.clientWidth} ${this.svg.clientHeight}`);

        const startX = Math.floor(this.settings.viewbox.x.min / resX) * resX;
        for(let i = 0; i < this.gridNumX; i++) {
            const line = this.linesVertical[i];

            const x = startX + i * resX;
            const xPer = (x - this.settings.viewbox.x.min) / width * 100;
            
            line.setAttribute('x1', `${xPer}%`);
            line.setAttribute('x2', `${xPer}%`);
            line.setAttribute('y1', `0`);
            line.setAttribute('y2', `${this.svg.clientHeight}`);

            this.setClass(line, 'line_axis', x === 0);
            line.setAttribute('data-x', `${x}`);
            line.classList.remove('line_extra');
        }

        const temp = Math.ceil(this.settings.viewbox.x.min / (resX * 10)) * 10 -  Math.floor(this.settings.viewbox.x.min / resX);
        for(let i = 0; i * 10 + temp < this.gridNumX; i++) {
            const line = this.linesVertical[temp + i * 10];
            const number = this.numbersVertical[i];
            // if(!number){ console.log('nah', i); return;}
            line.classList.add('line_extra');
            number.textContent =  line.getAttribute('data-x')!;
            number.setAttribute('x', line.getAttribute('x1')!);
        }

        for(let i = 0; i < this.gridNumX / 10; i++){
            const number = this.numbersHorizantal[i];
            const x = startX + i * resX * 10;
            // console.log(x.toFixed(Math.max(0, Math.ceil(Math.log10(width / this.gridNumX)) + 1)) , x.toFixed());
            const xPer = (x - this.settings.viewbox.x.min) / width * 100;
        }

        // Set vertical lines
        const startY = Math.floor(this.settings.viewbox.y.min / resY) * resY;
        for(let i = 0; i < this.gridNumY; i++) {
            const line = this.linesHorizontal[i];
            const y = startY + (i + 1) * resY;
            const yPer = (y - this.settings.viewbox.y.min) / height * 100;

            line.setAttribute('x1', `0`);
            line.setAttribute('x2', `${this.svg.clientWidth}`);
            line.setAttribute('y1', `${yPer}%`);
            line.setAttribute('y2', `${yPer}%`);

            this.setClass(line, 'line_axis', y === 0);
            this.setClass(line, 'line_extra', y % (resY * 10) === 0);
        }
    }

    setClass(elm: Element, className: string, enable: boolean) {
        if (enable) {
            elm.classList.add(className);
        } else {
            elm.classList.remove(className);
        }
    }

    findOptimalRes(length: number, maxLines: number): number {
        const options = [1, 2, 5];
        const res = 10 ** (Math.floor(Math.log10(length / maxLines)));
        for (let option of [1, 2, 5]){
            if (res * option * maxLines >= length ) {
                return res * option;
            }
        }
        return res * 10;
    }

    updateSettings(settings: settings) {
        this.settings = settings;
    }
}
