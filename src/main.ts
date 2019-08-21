import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import store from "./store";
Vue.config.productionTip = false;
Vue.config.performance = false;

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
