import {VuexModule, mutation, action, getter, Module} from 'vuex-class-component';
import get = Reflect.get;

interface IViewbox {
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
    dxFunction: (x: number, y: number) => number;
    dyFunction: (x: number, y: number) => number;

}

@Module({namespacedPath: 'settings/'})
export default class SettingsStore extends VuexModule {
    @getter public viewbox: IViewbox = {
        x: {min: -6, max: 6},
        y: {min: -3, max: 3},
    };
    @getter public speed = 0.01;
    @getter public functionCacheResolution = 5;
    @getter public drawFunctionBackground = true;
    @getter public useCached = true;
    @getter public dxFunction = (x: number, y: number): number => x;
    @getter public dyFunction = (x: number, y: number): number => x * y;

    @mutation public changeViewBox({x, y}: IViewbox) {
        this.viewbox.x.min = x.min;
        this.viewbox.x.max = x.max;
        this.viewbox.y.min = y.min;
        this.viewbox.y.max = y.max;
    }

    get object(): ISettings {
        return {
            viewbox: this.viewbox,
            speed: this.speed,
            dxFunction: this.dxFunction,
            dyFunction: this.dyFunction,
        };
    }

}
