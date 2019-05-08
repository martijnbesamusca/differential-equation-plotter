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

interface IValKey{
    key: string;
    val: any;
}

function persist(target: {[key:string]: any}, key: string) {
    const _val = target[key];

    // property getter
    if (delete target[key]) {
        Object.defineProperty(target, key, {
            get() {
                return _val;
            },
            set(newVal: any) {
                console.log('LOGGED', newVal);
                target[key] = newVal;
            },
            enumerable: true,
            configurable: true
        });
    }
}

@Module({namespacedPath: 'settings/'})
export default class SettingsStore extends VuexModule {
    static loaded = false;
    constructor(){
        super();
        console.log(SettingsStore.loaded);
        SettingsStore.loaded = true;
    }

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

    @mutation public changeValue({key, val}: IValKey) {
        // @ts-ignore
        const type = typeof get(this, key);

        if(type === 'number') {
            this.changeNumber(key, val);
        } else {
            set(this, key, val);
        }

        console.log(key, val)
    }

    private changeNumber(key: string, val: any) {
        if (typeof val === 'string') {
            val = parseFloat(val);
            if (Number.isNaN(val)) {
                return;
            }
        }
        set(this, key, val);
    }
}
