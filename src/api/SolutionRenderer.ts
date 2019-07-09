import {ODEAprox, Settings} from "@/store/modules/settings";
import ODEEstimator, {ODEEstimatorObject} from "@/api/ODEEstimator";

export interface Solution {
    start: [number, number];
    dForwards: [number, number][];
    dBackwards: [number, number][];
}

export default class SolutionRenderer {
    private solutions: Solution[] = [];
    private preview = [];
    private paths = [];
    private settings: Settings;
    private svg: SVGElement;
    private canvas: HTMLCanvasElement;
    private ODEEstimator: ODEEstimator;

    constructor(canvas: HTMLCanvasElement, svg: SVGElement, settings: Settings, ODEEstimator: ODEEstimator) {
        this.settings = settings;
        this.svg = svg;
        this.canvas = canvas;
        this.ODEEstimator = ODEEstimator;

        canvas.addEventListener('click',  (e: MouseEvent) => {
            const x = this.settings.viewbox.x.min + e.offsetX / canvas.width * (this.settings.viewbox.x.max - this.settings.viewbox.x.min);
            const y = this.settings.viewbox.y.max - e.offsetY / canvas.height * (this.settings.viewbox.y.max - this.settings.viewbox.y.min);
            this.addSolution(x, y);
        })
    }

    addSolution(x: number, y: number) {
        const stepSize = .01;
        const length = 10 / stepSize;
        const method = ODEAprox.RK4;
        const solution: Solution = {
            start: [x, y],
            dForwards: [],
            dBackwards: []
        };

        // Calculate forwards
        const estimation = {
            posX: x, posY: y,
            stepX: 0, stepY: 0,
            dx: this.ODEEstimator.dxFunction(x, y),
            dy: this.ODEEstimator.dyFunction(x, y)
        };

        for (let i = 0; i < length; i++) {
            this.ODEEstimator.stepFrom(estimation, stepSize, false, method);
            solution.dForwards.push([estimation.posX, estimation.posY]);
            if (!this.isInBounds(estimation.posX, estimation.posY)) break;
        }

        // Calculate backwards
        estimation.posX = x;
        estimation.posY = y;
        estimation.dx = this.ODEEstimator.dxFunction(x, y);
        estimation.dy = this.ODEEstimator.dyFunction(x, y);

        for (let i = 0; i < length; i++) {
            this.ODEEstimator.stepFrom(estimation, stepSize, false, method);
            estimation.posX -= estimation.stepX * 2;
            estimation.posY -= estimation.stepY * 2;
            estimation.dx = this.ODEEstimator.dxFunction(estimation.posX, estimation.posY);
            estimation.dy = this.ODEEstimator.dyFunction(estimation.posX, estimation.posY);
            solution.dBackwards.push([estimation.posX, estimation.posY]);
            if (!this.isInBounds(estimation.posX, estimation.posY)) break;
        }

        this.solutions.push(solution);
        this.renderSolution(solution);
    }

    private isInBounds(x: number , y: number ) {
        return this.settings.viewbox.x.min <= x && this.settings.viewbox.x.max >= x &&
            this.settings.viewbox.y.min <= y && this.settings.viewbox.y.max >= y;
    }

    renderSolution(solution: Solution) {
        const startCoord = this.formatCoordinates(solution.start);
        const pathForward = solution.dForwards.map(d => 'L '+ this.formatCoordinates(d)).join(' ');
        const pathBackward = solution.dBackwards.map(d => 'L '+ this.formatCoordinates(d)).join(' ');
        const pathString = `M ${startCoord} ${pathForward} M ${startCoord} ${pathBackward}`;

        const path = <SVGPathElement> document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathString);
        path.classList.add('solution');
        this.svg.appendChild(path);
    }

    private  formatCoordinates([x, y]: [number, number]) {
        const xPer = (x - this.settings.viewbox.x.min) / (this.settings.viewbox.x.max - this.settings.viewbox.x.min);
        const yPer = (y - this.settings.viewbox.y.min) / (this.settings.viewbox.y.max - this.settings.viewbox.y.min);
        const xWindow= xPer * this.canvas.width;
        const yWindow= (1 - yPer) * this.canvas.height;
        return `${xWindow} ${yWindow}`
    }

    render() {
        while (this.paths) {
            this.svg.removeChild(this.paths.pop()!)
        }

        for (const solution of this.solutions) {
            this.renderSolution(solution)
        }
    }
}
