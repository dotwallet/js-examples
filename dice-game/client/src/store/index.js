import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

const store = new Vuex.Store({
  state: {
    userInfo: undefined,
  },
  mutations: {
    USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
      console.log(state);
    },
  },
  actions: {},
  plugins: [vuexLocal.plugin],
});

export default store;
