// import {VuexModule, mutation, action, getter, Module} from 'vuex-class-component';
import { get, set, cloneDeep } from "lodash";
import ODEEstimator from "@/api/ODEEstimator";

export interface IViewbox {
  x: IViewboxRange;
  y: IViewboxRange;
}

interface IViewboxRange {
  min: number;
  max: number;
}

export interface IValKey {
  key: string;
  val: any;
}

export const enum ODETypes {
  Cartesian,
  Polar,
  Matrix
}

export const enum ODEAprox {
  EULER,
  RK2,
  RK4
}

export interface Settings {
  [key: string]: any;
}

const prefixPersist = "settings:";

export const defaults: Settings = {
  viewbox: {
    x: { min: -6, max: 6 },
    y: { min: -3, max: 3 }
  },
  keepAspectRatio: true,

  speed: 1.0,
  normalizeSpeed: false,
  ODEAproxmethod: ODEAprox.RK2,
  arrowAmount: 5000,
  arrowMaxAge: 200,
  arrowRandomizeMaxAge: false,
  arrowSize: 5,
  arrowColor: "#3f95eb",
  arrowRandomColor: true,

  solutionStepSize: 0.01,
  solutionLength: 10,
  solutionWidth: 4,
  solutionSubSteps: 10,
  solutionColor: "#9EFD38",
  solutionODEApproxMethod: ODEAprox.RK4,

  nullclineXEnable: true,
  nullclineXColor: "#c711ff",
  nullclineYEnable: true,
  nullclineYColor: "#ffbc03",
  nullclineThreshold: 0.001,

  drawFunctionBackground: false,
  useCached: false,

  dxString: String.raw`\sin (x \cdot y)`,
  dyString: String.raw`\sin(x + y)`,
  drString: String.raw`r \cdot (r-1) \cdot (r-2)`,
  dtString: String.raw`1`,
  AMatrix: [2, 1, -1, 2],

  ODEType: ODETypes.Polar
};

function loadState() {
  const state = cloneDeep(defaults);
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    if (!key || !key.startsWith(prefixPersist)) {
      continue;
    }
    const val = JSON.parse(localStorage.getItem(key)!);
    key = key.replace(prefixPersist, "");
    set(state, key, val);
  }

  return state;
}

const mutations = {
  changeValue(state: any, { key, val }: IValKey) {
    // @ts-ignore
    const type = typeof get(state, key);

    if (type === "number") {
      if (typeof val === "string") {
        if (val === "") {
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

    if (
      (key.startsWith("viewbox") && state.keepAspectRatio) ||
      (key === "keepAspectRatio" && val)
    ) {
      const precision = 100;
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      const widthView = state.viewbox.x.max - state.viewbox.x.min;
      const heightView = state.viewbox.y.max - state.viewbox.y.min;
      if (key.startsWith("viewbox.x")) {
        const newHeight = (widthView * canvas.height) / canvas.width;
        state.viewbox.y.min += (heightView - newHeight) / 2;
        state.viewbox.y.max -= (heightView - newHeight) / 2;

        // round
        state.viewbox.y.min =
          Math.round(state.viewbox.y.min * precision) / precision;
        state.viewbox.y.max =
          Math.round(state.viewbox.y.max * precision) / precision;

        // save
        localStorage.setItem(
          prefixPersist + "viewbox.y.min",
          state.viewbox.y.min
        );
        localStorage.setItem(
          prefixPersist + "viewbox.y.max",
          state.viewbox.y.max
        );
      } else {
        const newWidth = (heightView * canvas.width) / canvas.height;
        state.viewbox.x.min += (widthView - newWidth) / 2;
        state.viewbox.x.max -= (widthView - newWidth) / 2;
        // round
        state.viewbox.x.min =
          Math.round(state.viewbox.x.min * precision) / precision;
        state.viewbox.x.max =
          Math.round(state.viewbox.x.max * precision) / precision;
        // save
        localStorage.setItem(
          prefixPersist + "viewbox.x.min",
          state.viewbox.x.min
        );
        localStorage.setItem(
          prefixPersist + "viewbox.x.max",
          state.viewbox.x.max
        );
      }
    }

    localStorage.setItem(prefixPersist + key, JSON.stringify(val));
  }
};

const actions = {
  resetValue(context: any, key: string) {
    const defaultVal = get(defaults, key);
    context.commit("changeValue", { key, val: defaultVal });
  }
};

const getters = {};

const Settings = {
  state: loadState(),
  mutations,
  actions,
  getters
};
export default Settings;
