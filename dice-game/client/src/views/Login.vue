<template>
  <div class="scroller flex flex-col items-center min-w-full bg-primary">
    <img class="max-w-xs sm:max-w-md" alt="App Logo" src="../assets/logo-screen.png" />
    <dotwallet-login
      :app-id="APP_ID"
      :redirect-url="SERVER_URL + '/auth'"
      :log="true"
      :lang="lang"
    ></dotwallet-login>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { DotwalletLogin } from 'dotwallet-vue';
import { SERVER_URL, APP_ID } from '../config.js';
export default {
  name: 'Login',
  components: {
    DotwalletLogin,
  },
  computed: {
    ...mapState(['lang']),
  },
  mounted() {
    console.log(this.SERVER_URL, this.APP_ID, this.lang);
  },
  data() {
    return {
      SERVER_URL: SERVER_URL,
      APP_ID: APP_ID,
    };
  },
};
</script>
