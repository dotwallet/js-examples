import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/Login.vue';
import Game from '../views/Game.vue';
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
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
  },
];

const router = new VueRouter({
  routes,
});

export default router;
