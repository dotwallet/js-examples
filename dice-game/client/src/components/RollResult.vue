<template>
  <div v-if="failMsg !== '' || winMsg !== ''" class="p-5 w-full flex text-white text-center">
    <p v-if="failMsg !== ''" class="text-4xl m-auto">{{ failMsg }}</p>
    <p v-if="winMsg !== ''" class="text-4xl  m-auto">{{ winMsg }}</p>
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
