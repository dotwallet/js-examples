<template>
  <nav class="flex items-center justify-between flex-wrap bg-primary p-5">
    <img class="h-6 w-6" src="../assets/dice-logo.png" alt="" />

    <div class="block lg:hidden ml-auto">
      <button
        @click.prevent="showNav = !showNav"
        class="flex items-center px-3 py-2 border rounded  text-secondary border-none hover:text-white hover:border-white"
      >
        <svg
          class="fill-current h-3 w-3"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </button>
    </div>
    <div class="block w-full lg:w-auto lg:flex lg:ml-auto">
      <div v-if="showNav || showNav2" class="text-sm lg:flex lg:flex-grow">
        <router-link class="nav-link" to="/game">Game</router-link>
        <router-link class="nav-link" to="/about">About</router-link>
        <router-link class="nav-link" to="/fair">Fair</router-link>
        <router-link class="nav-link" to="/#">中文</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  methods: {
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
      showNav: false,
      showNav2: false,
    };
  },
};
</script>

<style></style>
