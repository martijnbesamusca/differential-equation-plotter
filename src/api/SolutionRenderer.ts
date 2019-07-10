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
    private paths: SVGPathElement[] = [];
    private settings: Settings;
    private svg: SVGElement;
    private canvas: HTMLCanvasElement;
    private ODEEstimator: ODEEstimator;

    public stepSize: number;
    public length: number;
    public method: ODEAprox;
    private subSteps: number;

    constructor(canvas: HTMLCanvasElement, svg: SVGElement, settings: Settings, ODEEstimator: ODEEstimator) {
        this.settings = settings;
        this.svg = svg;
        this.canvas = canvas;
        this.ODEEstimator = ODEEstimator;

        this.stepSize = settings.solutionStepSize;
        this.subSteps = settings.solutionSubSteps;
        this.length = settings.solutionLength;
        this.method = settings.solutionODEApproxMethod;

        this.setColor();
        this.setWidth();

        canvas.addEventListener('click',  (e: MouseEvent) => {
            const {width, height} = canvas.getBoundingClientRect();
            const x = this.settings.viewbox.x.min + e.offsetX / width * (this.settings.viewbox.x.max - this.settings.viewbox.x.min);
            const y = this.settings.viewbox.y.max - e.offsetY / height * (this.settings.viewbox.y.max - this.settings.viewbox.y.min);
            this.addSolution(x, y);
        })
    }

    setColor() {
        this.svg.style.setProperty('--solution-color', this.settings.solutionColor);
    }

    setWidth() {
        this.svg.style.setProperty('--solution-width', this.settings.solutionWidth.toString());
    }

    addSolution(x: number, y: number) {
        const stepSize = this.stepSize;
        const length = this.length / this.stepSize;

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
            for (let j = 0; j <= this.subSteps; j++) {
                this.ODEEstimator.stepFrom(estimation, stepSize / (this.subSteps + 1), false, this.method);
                if (!this.isInBounds(estimation.posX, estimation.posY)) break;
            }
            solution.dForwards.push([estimation.posX, estimation.posY]);
            if (!this.isInBounds(estimation.posX, estimation.posY)) break;
        }

        // Calculate backwards
        estimation.posX = x;
        estimation.posY = y;
        estimation.dx = this.ODEEstimator.dxFunction(x, y);
        estimation.dy = this.ODEEstimator.dyFunction(x, y);

        for (let i = 0; i < length; i++) {
            for (let j = 0; j <= this.subSteps; j++) {
                this.ODEEstimator.stepFrom(estimation, -stepSize / (this.subSteps + 1), false, this.method);
                if (!this.isInBounds(estimation.posX, estimation.posY)) break;
            }
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
        this.paths.push(path)
    }

    private  formatCoordinates([x, y]: [number, number]) {
        const xPer = (x - this.settings.viewbox.x.min) / (this.settings.viewbox.x.max - this.settings.viewbox.x.min);
        const yPer = (y - this.settings.viewbox.y.min) / (this.settings.viewbox.y.max - this.settings.viewbox.y.min);
        const xWindow= xPer * this.canvas.width;
        const yWindow= (1 - yPer) * this.canvas.height;
        return `${xWindow} ${yWindow}`
    }

    clear() {
        while (this.paths.length > 0) {
            const path = this.paths.pop()!;
            this.svg.removeChild(path)
        }
        this.solutions = []
    }

    render() {
        while (this.paths.length > 0) {
            const path = this.paths.pop()!;
            this.svg.removeChild(path)
        }
        for (const solution of this.solutions) {
            this.renderSolution(solution)
        }
    }

    public updateSettings(settings: Settings) {
        this.settings = settings;
    }
}
