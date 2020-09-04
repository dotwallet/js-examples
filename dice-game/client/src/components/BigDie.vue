<template>
  <div class="big-die-div">
    <div v-if="spin">
      <img
        v-show="dieNumber === 1"
        class="big-die animate-spin"
        src="../assets/dice/tilted-die-1.png"
        alt="DIE"
      />
      <img
        v-show="dieNumber === 2"
        class="big-die animate-spin"
        src="../assets/dice/tilted-die-2.png"
        alt="DIE"
      />
      <img
        v-show="dieNumber === 3"
        class="big-die animate-spin"
        src="../assets/dice/tilted-die-3.png"
        alt="DIE"
      />
      <img
        v-show="dieNumber === 4"
        class="big-die animate-spin"
        src="../assets/dice/tilted-die-4.png"
        alt="DIE"
      />
      <img
        v-show="dieNumber === 5"
        class="big-die animate-spin"
        src="../assets/dice/tilted-die-5.png"
        alt="DIE"
      />
      <img
        v-show="dieNumber === 6"
        class="big-die animate-spin"
        src="../assets/dice/tilted-die-6.png"
        alt="DIE"
      />
    </div>
    <div v-else-if="rollResult > -1">
      <img
        v-show="rollResult === 1"
        class="big-die"
        src="../assets/dice/tilted-die-1.png"
        alt="DIE"
      />
      <img
        v-show="rollResult === 2"
        class="big-die"
        src="../assets/dice/tilted-die-2.png"
        alt="DIE"
      />
      <img
        v-show="rollResult === 3"
        class="big-die"
        src="../assets/dice/tilted-die-3.png"
        alt="DIE"
      />
      <img
        v-show="rollResult === 4"
        class="big-die"
        src="../assets/dice/tilted-die-4.png"
        alt="DIE"
      />
      <img
        v-show="rollResult === 5"
        class="big-die"
        src="../assets/dice/tilted-die-5.png"
        alt="DIE"
      />
      <img
        v-show="rollResult === 6"
        class="big-die"
        src="../assets/dice/tilted-die-6.png"
        alt="DIE"
      />
    </div>

    <img v-else class="big-die" src="../assets/dice/tilted-die-6.png" alt="" />
    <button
      v-if="rollResult > -1"
      @click="reset()"
      class="mt-10 bg-tert shadow-light hover:shadow-light2 text-white font-bold py-2 px-4 rounded-full text-2xl"
    >
      RESET
    </button>
    <button
      v-else
      @click="roll()"
      class="mt-10 bg-tert shadow-light hover:shadow-light2 text-white font-bold py-2 px-4 rounded-full text-2xl"
      :class="canRoll ? '' : 'cursor-not-allowed opacity-75'"
    >
      ROLL
    </button>
  </div>
</template>

<script>
export default {
  props: {
    rollResult: {
      type: Number,
      default: -1,
    },
    canRoll: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      spin: false,
      dieNumber: 1,
    };
  },
  watch: {
    rollResult() {
      console.log('roll result', this.rollResult);
      if (this.rollResult !== -2) this.spin = false;
    },
  },
  mounted() {},
  methods: {
    reset() {
      this.$emit('reset');
    },
    spinNumber() {
      if (this.spin)
        setTimeout(() => {
          if (this.dieNumber <= 5) this.dieNumber++;
          else this.dieNumber = 1;
          this.spinNumber();
        }, 200);
    },
    roll() {
      if (this.canRoll) {
        this.spin = !this.spin;
        this.spinNumber();
        this.$emit('roll');
      }
    },
  },
};
</script>

<style>
.big-die-div {
  @apply mt-5 flex flex-col items-center;
}
</style>
