import {VuexModule, mutation, action, getter, Module} from 'vuex-class-component';
import {get, set} from 'lodash';

export interface IViewbox {
    x: IViewboxRange;
    y: IViewboxRange;
}

interface IViewboxRange {
    min: number;
    max: number;
}

interface ISettings {
    viewbox: IViewbox;
    speed: number;
    drawFunctionBackground: boolean;
    useCached: boolean;
    dxFunction: (x: number, y: number) => number;
    dyFunction: (x: number, y: number) => number;
}

interface IViewBoxKey {
    axis: 'x' | 'y';
    side: 'min' | 'max';
}

interface IViewBoxValKey {
    key: IViewBoxKey;
    val: any;
}
interface IValKey{
    key: string;
    val: any;
}

@Module({namespacedPath: 'settings/'})
export default class SettingsStore extends VuexModule {
    @getter public viewbox: IViewbox = {
        x: {min: -6, max: 6},
        y: {min: -3, max: 3},
    };

    @getter public speed = 1.0;
    @getter public numArrows = 5000;
    @getter public arrowColor = '#00ff00';

    @getter public drawFunctionBackground = false;
    @getter public useCached = false;

    @getter public dxFunction = (x: number, y: number): number => -Math.sin(2* Math.PI * x);
    @getter public dyFunction = (x: number, y: number): number => y;

    @mutation public changeValue(valKey: IValKey) {
        // @ts-ignore
        this[valKey.key] = valKey.val;
    }

    @mutation public changeNumber(valKey: IValKey) {
        if (typeof valKey.val === 'string') {
            valKey.val = parseFloat(valKey.val);
            if (Number.isNaN(valKey.val)) {
                return;
            }
        }
        set(this, valKey.key, valKey.val);
    }

    @mutation public changeViewBox(valKey: IViewBoxValKey) {
        if (typeof valKey.val === 'string') {
            valKey.val = parseFloat(valKey.val);
            if (Number.isNaN(valKey.val)) {
                return;
            }
        }
        this.viewbox[valKey.key.axis][valKey.key.side] = valKey.val;
    }


}
