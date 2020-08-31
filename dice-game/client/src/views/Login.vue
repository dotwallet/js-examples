<template>
  <div class="scroller flex flex-col items-center">
    <img class="max-w-md" alt="App Logo" src="../assets/logo-screen.png" />
    <dotwallet-login
      :app-id="APP_ID"
      :redirect-url="'http://' + SERVER_URL + '/auth'"
      :log="true"
    ></dotwallet-login>
  </div>
</template>

<script>
import { DotwalletLogin } from 'dotwallet-vue';
import { SERVER_URL, APP_ID } from '../config.js';
export default {
  name: 'Login',
  components: {
    DotwalletLogin,
  },
  mounted() {
    console.log(this.SERVER_URL, this.APP_ID);
  },
  data() {
    return {
      SERVER_URL: SERVER_URL,
      APP_ID: APP_ID,
    };
  },
};
</script>
