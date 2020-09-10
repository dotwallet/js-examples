<template>
  <div class="die-select">
    <img
      @click="select('1')"
      :class="selected['1'] ? 'selected' : ''"
      class="small-die md:w-24 md:h-24 sm:w-12 sm:h-12 h-10 w-10 sm:m-3 m-1"
      src="../assets/dice/die-1.png"
      alt=""
    />
    <img
      @click="select('2')"
      :class="selected['2'] ? 'selected' : ''"
      class="small-die md:w-24 md:h-24 sm:w-12 sm:h-12 h-10 w-10 sm:m-3 m-1"
      src="../assets/dice/die-2.png"
      alt=""
    />
    <img
      @click="select('3')"
      :class="selected['3'] ? 'selected' : ''"
      class="small-die md:w-24 md:h-24 sm:w-12 sm:h-12 h-10 w-10 sm:m-3 m-1"
      src="../assets/dice/die-3.png"
      alt=""
    />
    <img
      @click="select('4')"
      :class="selected['4'] ? 'selected' : ''"
      class="small-die md:w-24 md:h-24 sm:w-12 sm:h-12 h-10 w-10 sm:m-3 m-1"
      src="../assets/dice/die-4.png"
      alt=""
    />
    <img
      @click="select('5')"
      :class="selected['5'] ? 'selected' : ''"
      class="small-die md:w-24 md:h-24 sm:w-12 sm:h-12 h-10 w-10 sm:m-3 m-1"
      src="../assets/dice/die-5.png"
      alt=""
    />
    <img
      @click="select('6')"
      :class="selected['6'] ? 'selected' : ''"
      class="small-die md:w-24 md:h-24 sm:w-12 sm:h-12 h-10 w-10 sm:m-3 m-1"
      src="../assets/dice/die-6.png"
      alt=""
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
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
      this.selected[die] = !this.selected[die];
      let selectedStr = '';
      for (const key in this.selected) {
        if (this.selected[key] === true) selectedStr += key;
      }
      this.$emit('select', selectedStr);
    },
  },
};
</script>

<style>
.die-select {
  @apply flex mt-5;
}
.small-die {
  @apply opacity-50 cursor-pointer rounded-md;
}
.small-die:hover {
  @apply transform translate-y-2 shadow-light2;
}
.selected {
  @apply opacity-100;
}
</style>
