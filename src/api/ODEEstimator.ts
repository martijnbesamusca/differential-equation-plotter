import store from '../store/';
import {ODEAprox, ODETypes} from "@/store/modules/settings";
import {MastonToJSFunction} from "@/api/MastonConvert";
import mathlive from "mathlive";

export interface ODEEstimatorObject {
    posX: number,
    posY: number,
    stepX: number,
    stepY: number,
    dx: number,
    dy: number
}

export default class ODEEstimator {
    private dxFunction!: (x: number, y: number) => number;
    private dyFunction!: (x: number, y: number) => number;

    constructor () {
        this.updateODE();

        store.subscribe((mutation, state) => {
            if (mutation.type !== 'changeValue') return;

            const key = mutation.payload.key;
            if (key === 'ODEType') {
                this.updateODE()
            }
        })
    }

    public stepFrom(
        estimator: ODEEstimatorObject,
        speed: number,
        normalize: number,
        estimatorMethod: ODEAprox,
    ) {
        debugger
        switch (estimatorMethod) {
            case ODEAprox.RK2:
                this.stepFromRK2(estimator, speed);
                break;
            case ODEAprox.RK4:
            case ODEAprox.EULER:
                this.stepFromEuler(estimator, speed);
                break
        }

        if (normalize) {
            const mag = Math.sqrt(estimator.stepX ** 2 + estimator.stepY ** 2) / speed;
            estimator.stepX /= mag;
            estimator.stepY /= mag;
        }

        estimator.posX += estimator.stepX;
        estimator.posY += estimator.stepY;

        estimator.dx = this.dxFunction(estimator.posX, estimator.posY);
        estimator.dy = this.dyFunction(estimator.posX, estimator.posY);
    }

    private stepFromEuler (estimator: ODEEstimatorObject, speed: number) {
        estimator.stepX = estimator.dx * speed;
        estimator.stepY = estimator.dy * speed;
    }

    private stepFromRK2 (estimator: ODEEstimatorObject, speed: number) {
        const x = estimator.posX;
        const y = estimator.posY;

        const x_k1 = estimator.dx;
        const y_k1 = estimator.dy;

        const x_k2 = this.dxFunction(x + 0.5 * speed * x_k1, y + 0.5 * speed * y_k1);
        const y_k2 = this.dyFunction(x + 0.5 * speed * x_k1, y + 0.5 * speed * y_k1);

        estimator.stepX = speed * (x_k1 + x_k2) / 2;
        estimator.stepY = speed * (y_k1 + y_k2) / 2;
    }

    private stepFromRK4 (estimator: ODEEstimatorObject, speed: number) {
        const x = estimator.posX;
        const y = estimator.posY;

        const x_k1 = estimator.dx;
        const y_k1 = estimator.dy;

        const x_k2 = this.dxFunction(x + 0.5 * speed * x_k1, y + 0.5 * speed * y_k1);
        const y_k2 = this.dyFunction(x + 0.5 * speed * x_k1, y + 0.5 * speed * y_k1);

        const x_k3 = this.dxFunction(x + 0.5 * speed * x_k2, y + 0.5 * speed * y_k2);
        const y_k3 = this.dyFunction(x + 0.5 * speed * x_k2, y + 0.5 * speed * y_k2);

        const x_k4 = this.dxFunction(x + speed * x_k3, y + speed * y_k3);
        const y_k4 = this.dyFunction(x + speed * x_k3, y + speed * y_k3);

        estimator.stepX = speed * (x_k1 + 2 * x_k2  + 2 * x_k3 + x_k4) / 6;
        estimator.stepY = speed * (y_k1 + 2 * y_k2  + 2 * y_k3 + y_k4) / 6;
    }



    private updateODE() {
        // @ts-ignore
        switch(store.state.settings.ODEType) {
            case ODETypes.Polar:
                this.loadPolar();
                break;
            case ODETypes.Cartesian:
                this.loadCartesian();
                break;
            case ODETypes.Matrix:
                this.loadMatrix();
                break;
        }
    }

    private loadPolar() {
        // @ts-ignore
        const dr = MastonToJSFunction(mathlive.latexToAST(store.state.settings.drString), ['r', 't']);
        // @ts-ignore
        const dt = MastonToJSFunction(mathlive.latexToAST(store.state.settings.dtString), ['r', 't']);

        // x' = r' cos(t) - r sin(t) t'
        this.dxFunction = (x, y) => {
            const r = Math.sqrt(x ** 2 + y ** 2);
            const t = Math.atan2(y, x);
            return dr(r, t) * Math.cos(t) - dt(r, t) * r * Math.sin(t);
        };

        // y' = r' sin(t) + r cos(t) t'
        this.dyFunction = (x, y) => {
            const r = Math.sqrt(x ** 2 + y ** 2);
            const t = Math.atan2(y, x);
            return dr(r, t) * Math.sin(t) + dt(r, t) * r * Math.cos(t);
        };


        this.dxFunction(0, 0);

    }

    private loadCartesian() {
        try {
            // @ts-ignore
            const dx = MastonToJSFunction(mathlive.latexToAST(store.state.settings.dxString));
            // @ts-ignore
            const dy = MastonToJSFunction(mathlive.latexToAST(store.state.settings.dyString));
            // Test validity
            dx(0, 0);
            dy(0, 0);

            this.dxFunction = dx;
            this.dyFunction = dy;
        } catch (e) {
            console.log(e);
        }
    }

    private loadMatrix() {
        // @ts-ignore
        const mat = store.state.settings.AMatrix;
        this.dxFunction = (x, y) => mat[0] * x + mat[1] * y;
        this.dyFunction = (x, y) => mat[2] * x + mat[3] * y;
    }
}
