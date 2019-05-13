import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import store from './store';
import "vue-material-design-icons/styles.css"
// import Fragment from 'vue-fragment'
Vue.config.productionTip = false;
// Vue.use(Fragment.Plugin);
Vue.config.performance = true;

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app');
