<template>
  <nav class="flex items-center justify-between flex-wrap bg-primary px-5 py-2">
    <img class="h-6 w-6" src="../assets/dice-logo.png" alt="" />
    <a v-if="lang === 'en'" @click="LANG('zh')" class="nav-link cursor-pointer ml-3 mt-0">中文</a>
    <a v-if="lang === 'zh'" @click="LANG('en')" class="nav-link cursor-pointer ml-3 mt-0">ENG</a>
    <div class="block lg:hidden ml-auto">
      <button
        @click.prevent="showNav = !showNav"
        class="flex items-center px-3 py-2 border rounded  text-secondary border-none hover:text-white hover:border-white"
      >
        <svg class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <title>Menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </button>
    </div>

    <div class="block w-full lg:w-auto lg:flex lg:ml-auto">
      <div
        v-if="showNav || showNav2"
        @click.prevent="showNav = false"
        class="text-sm lg:flex lg:flex-grow"
      >
        <router-link class="nav-link" to="/game">{{ game[lang] }}</router-link>
        <!-- <router-link class="nav-link" to="/charity">{{ charity[lang] }}</router-link> -->
        <router-link class="nav-link" to="/fair">{{ fair[lang] }}</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import locales from '../assets/locales.json';
import { mapState, mapMutations } from 'vuex';
export default {
  computed: {
    ...mapState(['lang']),
  },
  methods: {
    ...mapMutations(['LANG']),
    onResize() {
      if (window.innerWidth > 1024) {
        this.showNav2 = true;
      } else this.showNav2 = false;
    },
  },

  created() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  },

  data() {
    return {
      ...locales.navbar,

      showNav: false,
      showNav2: false,
    };
  },
};
</script>

<style></style>
