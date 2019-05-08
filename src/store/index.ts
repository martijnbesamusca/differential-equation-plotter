import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import SetttingsStore from './modules/settings';
import VuexPersistence from 'vuex-persist';

Vue.use(Vuex);
export const vuexLocal = new VuexPersistence({
    restoreState(key, storage) {
        const item = localStorage.getItem(key);
        console.log(key,item)
        if(item){
            return JSON.parse(item);
        }
        return null;
    },
    saveState(key, state, storage){
        console.log(key, state)
        localStorage.setItem(key, JSON.stringify(state))
    },
});

export default new Vuex.Store({
    modules: {
        settings: SetttingsStore.ExtractVuexModule(SetttingsStore),
    },
    // plugins: [vuexLocal.plugin],
});
