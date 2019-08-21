import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import plot from "./modules/plot";
import settings from "./modules/settings";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    plot,
    settings
  }
});
