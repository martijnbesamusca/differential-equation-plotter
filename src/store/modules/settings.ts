// import {VuexModule, mutation, action, getter, Module} from 'vuex-class-component';
import {get, set, cloneDeep} from 'lodash';

export interface IViewbox {
    x: IViewboxRange;
    y: IViewboxRange;
}

interface IViewboxRange {
    min: number;
    max: number;
}

interface IValKey {
    key: string;
    val: any;
}

export interface Settings {
    [key: string]: any;
}

const prefixPersist = 'settings:';

const defaults: Settings = {
    viewbox: {
        x: {min: -6, max: 6},
        y: {min: -3, max: 3},
    },

    speed: 1.0,
    arrowAmount: 5000,
    arrowMaxAge: 1000,
    arrowSize: 5,
    arrowColor: '#00ff00',

    drawFunctionBackground: false,
    useCached: false,

    dxFunction: (x: number, y: number): number => -Math.sin(2 * Math.PI * x),
    dyFunction: (x: number, y: number): number => y,
};

function loadState() {
    const state = cloneDeep(defaults);
    for (let i = 0; i < localStorage.length; i++) {
        // debugger;
        let key = localStorage.key(i);
        if (!key || !key.startsWith(prefixPersist)) { continue; }
        const val = JSON.parse(localStorage.getItem(key)!);
        key = key.replace(prefixPersist, '');
        set(state, key, val);
    }
    return state;
}

const mutations = {
    changeValue(state: any, {key, val}: IValKey) {
        // @ts-ignore
        const type = typeof get(state, key);

        if (type === 'number') {
            if (typeof val === 'string') {
                if (val === '') {
                    return;
                }
                val = parseFloat(val);
                if (Number.isNaN(val)) {
                    return;
                }
            }

            set(state, key, val);
        } else {
            set(state, key, val);
        }

        localStorage.setItem(prefixPersist + key, JSON.stringify(val));
    },
};

const actions = {
    resetValue(context: any, key: string) {
        const defaultVal = get(defaults, key);
        context.commit('changeValue', {key, val: defaultVal});
    },
};

export default {
    state: loadState(),
    mutations,
    actions,
    getters: {},
};
