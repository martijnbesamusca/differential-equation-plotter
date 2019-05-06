import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import SetttingsStore from './modules/settings';
import VuexPersistence from 'vuex-persist';

Vue.use(Vuex);
export const vuexLocal = new VuexPersistence({
    storage: window.localStorage,
});

export default new Vuex.Store({
    modules: {
        settings: SetttingsStore.ExtractVuexModule(SetttingsStore),
    },
    plugins: [vuexLocal.plugin],
});
