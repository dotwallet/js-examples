<template>
  <div class="app scroller">
    <the-navbar v-if="!loggedIn" id="nav"> </the-navbar>
    <router-view />
  </div>
</template>
<script>
import TheNavbar from './components/TheNavbar';
export default {
  components: { TheNavbar },
  data() {
    return {
      loggedIn: false,
    };
  },
};
</script>
