import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import './assets/style/index.css';
import './assets/style/slider.css';

import VueConfetti from 'vue-confetti';

Vue.use(VueConfetti);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
