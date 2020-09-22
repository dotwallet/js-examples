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
    lang: 'en',
  },
  mutations: {
    USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
    },
    LANG(state, lang) {
      state.lang = lang;
    },
  },
  actions: {},
  plugins: [vuexLocal.plugin],
});

export default store;
