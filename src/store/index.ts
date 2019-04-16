import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import SetttingsStore from './modules/settings';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        settings: SetttingsStore.ExtractVuexModule(SetttingsStore),
    },
});
