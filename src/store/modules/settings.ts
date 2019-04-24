import {VuexModule, mutation, action, getter, Module} from 'vuex-class-component';

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
    @getter public drawFunctionBackground = false;
    @getter public useCached = false;
    @getter public dxFunction = (x: number, y: number): number => Math.sin(x + Math.cos(y));
    @getter public dyFunction = (x: number, y: number): number => Math.cos(x + Math.sin(y));

    @mutation public changeVal(valKey: IValKey) {
        // @ts-ignore
        this[valKey.key] = valKey.key;
    }

    @mutation public changeNumber(valKey: IValKey) {
        if (typeof valKey.val === 'string') {
            valKey.val = parseFloat(valKey.val);
            if (Number.isNaN(valKey.val)) {
                return;
            }
        }
        // @ts-ignore
        this[valKey.key] = valKey.val;
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
