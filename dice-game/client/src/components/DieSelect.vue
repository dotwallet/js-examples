<template>
  <div class="mt-5">
    <h1 class="big-label">{{ chooseGuess[lang] }}</h1>
    <div class="flex ">
      <img
        @click="select('1')"
        :class="selected['1'] ? 'selected' : ''"
        class="small-die"
        src="../assets/dice/die-1.png"
        alt=""
      />
      <img
        @click="select('2')"
        :class="selected['2'] ? 'selected' : ''"
        class="small-die"
        src="../assets/dice/die-2.png"
        alt=""
      />
      <img
        @click="select('3')"
        :class="selected['3'] ? 'selected' : ''"
        class="small-die"
        src="../assets/dice/die-3.png"
        alt=""
      />
      <img
        @click="select('4')"
        :class="selected['4'] ? 'selected' : ''"
        class="small-die"
        src="../assets/dice/die-4.png"
        alt=""
      />
      <img
        @click="select('5')"
        :class="selected['5'] ? 'selected' : ''"
        class="small-die"
        src="../assets/dice/die-5.png"
        alt=""
      />
      <img
        @click="select('6')"
        :class="selected['6'] ? 'selected' : ''"
        class="small-die"
        src="../assets/dice/die-6.png"
        alt=""
      />
    </div>
  </div>
</template>

<script>
import locales from '../assets/locales.json';
import { mapState } from 'vuex';
export default {
  computed: { ...mapState(['lang']) },

  data() {
    return {
      ...locales.labels,
      selected: {
        '1': false,
        '2': false,
        '3': false,
        '4': false,
        '5': false,
        '6': false,
      },
    };
  },
  methods: {
    select(die) {
      let dieCount = 0;
      for (const die in this.selected) {
        if (this.selected[die]) dieCount++;
      }

      if (dieCount < 5 || (dieCount == 5 && this.selected[die])) {
        this.selected[die] = !this.selected[die];
        let selectedStr = '';
        for (const key in this.selected) {
          if (this.selected[key] === true) selectedStr += key;
        }
        this.$emit('select', selectedStr);
      }
    },
  },
};
</script>

<style>
.small-die {
  @apply h-10 w-10 m-1 opacity-50 cursor-pointer rounded-md;
}
.small-die:hover {
  @apply transform translate-y-2 shadow-light2;
}
.selected {
  @apply opacity-100;
}
</style>
