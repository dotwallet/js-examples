<template>
  <div class="big-die-div">
    <img
      class="big-die"
      :class="spin ? 'animate-spin' : ''"
      src="../assets/tilted-die.png"
      alt=""
    />
    <button
      @click="roll()"
      class="mt-10 bg-tert shadow-light hover:shadow-light2 text-white font-bold py-2 px-4 rounded-full text-2xl"
    >
      ROLL
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      spin: false,
    };
  },
  methods: {
    roll() {
      this.spin = !this.spin;
    },
  },
};
</script>

<style>
.big-die-div {
  @apply mt-5 flex flex-col items-center;
}
</style>
