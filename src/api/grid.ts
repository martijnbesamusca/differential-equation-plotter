import settings from './store/settings';
import state from "./store/state";

function rescale(v: number, minOrg: number, maxOrg: number, minDest: number, maxDest:number): number {
    const norm = (v - minOrg) / (maxOrg - minOrg);
    return minDest + (maxDest - minDest) * norm;
}

export enum Axis {
    x,
    y
}

export function screenToGrid(v: number, axis: Axis): number {
    const minGrid = (axis === Axis.x ? settings.window.get('min_x') : settings.window.get('max_y')) as number;
    const maxGrid = (axis === Axis.x ? settings.window.get('max_x') : settings.window.get('min_y')) as number;
    const maxScreen = (axis === Axis.x ? state.get('canvas_width') : state.get('canvas_height')) as number;
    return rescale(v, 0, maxScreen, minGrid, maxGrid);
}

