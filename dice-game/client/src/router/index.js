import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/Login.vue';
import Game from '../views/Game.vue';
import Fair from '../views/Fair.vue';
import store from '../store/index.js';
Vue.use(VueRouter);

const getLoginQueries = function(to, from, next) {
  if (to.query.user_name) {
    const userInfo = { ...to.query };
    store.commit('USER_INFO', userInfo);
    next({ name: 'Game' });
  } else next();
};
const checkLogin = function(to, from, next) {
  // console.log(store.state.userInfo);
  if (!store.state.userInfo) {
    next({ name: 'Login' });
  } else next();
};
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    beforeEnter: getLoginQueries,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: getLoginQueries,
  },
  {
    path: '/game',
    name: 'Game',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () =>
    //   import(/* webpackChunkName: "about" */ '../views/About.vue'),
    component: Game,
    beforeEnter: checkLogin,
  },
  {
    path: '/fair',
    name: 'Fair',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () =>
    //   import(/* webpackChunkName: "about" */ '../views/About.vue'),
    component: Fair,
    beforeEnter: checkLogin,
  },
];

const router = new VueRouter({
  routes,
  mode: 'history',
});

export default router;
