<template>
  <div class="die-select">
    <img
      @click="select('one')"
      :class="selected.one ? 'selected' : ''"
      class="small-die"
      src="../assets/die-1.png"
      alt=""
    />
    <img
      @click="select('two')"
      :class="selected.two ? 'selected' : ''"
      class="small-die"
      src="../assets/die-2.png"
      alt=""
    />
    <img
      @click="select('three')"
      :class="selected.three ? 'selected' : ''"
      class="small-die"
      src="../assets/die-3.png"
      alt=""
    />
    <img
      @click="select('four')"
      :class="selected.four ? 'selected' : ''"
      class="small-die"
      src="../assets/die-4.png"
      alt=""
    />
    <img
      @click="select('five')"
      :class="selected.five ? 'selected' : ''"
      class="small-die"
      src="../assets/die-5.png"
      alt=""
    />
    <img
      @click="select('six')"
      :class="selected.six ? 'selected' : ''"
      class="small-die"
      src="../assets/die-6.png"
      alt=""
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      selected: {
        one: false,
        two: false,
        three: false,
        four: false,
        five: false,
        six: false,
      },
    };
  },
  methods: {
    select(die) {
      this.selected[die] = !this.selected[die];
    },
  },
};
</script>

<style>
.die-select {
  @apply flex mt-5;
}
.small-die {
  @apply m-3 opacity-50 cursor-pointer rounded-md;
}
.small-die:hover {
  @apply transform translate-y-2 shadow-light2;
}
.selected {
  @apply opacity-100;
}
</style>
