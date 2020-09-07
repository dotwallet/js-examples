<template>
  <div v-if="failMsg !== '' || winMsg !== ''" class="p-5 flex">
    <p class="text-4xl text-center text-white">{{ failMsg }}</p>
    <p class="text-4xl text-center text-white">{{ winMsg }}</p>
  </div>
</template>

<script>
export default {
  props: {
    winMsg: {
      type: String,
      default: '',
    },
    failMsg: {
      type: String,
      default: '',
    },
  },
  watch: {
    winMsg() {
      if (this.winMsg === '') this.$confetti.stop();
      else this.$confetti.start();
    },
  },
};
</script>

<style></style>
