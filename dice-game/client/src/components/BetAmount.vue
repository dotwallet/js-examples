<template>
  <div class="bet-amount min-w-1/2 lg:min-w-0 lg:w-1/4">
    <div class="relative">
      <div class="bg-tert-light p-3 w-100 rounded-lg">
        <input class="bg-tert-light w-100" v-model="value" />
      </div>
      <div class="bg-primary-light flex rounded-lg top-0 right-0 absolute">
        <div class="bsv"><p class="bsv-text">BSV</p></div>
        <div class="usd"><p class="usd-text">USD</p></div>
      </div>
    </div>
    <div>
      <vue-slider
        class="p-3 mt-3"
        style="height:2rem"
        :max="3"
        :min="0.00001"
        :interval="0.00001"
        v-model="value"
      >
        <template v-slot:dot> <div class="custom-dot"></div></template
      ></vue-slider>
    </div>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component';
import '../assets/style/slider.css';
export default {
  components: {
    VueSlider,
  },
  data() {
    return {
      value: 0,
    };
  },
};
</script>

<style>
.bet-amount {
  @apply p-3 m-5 rounded-lg bg-tert shadow-light;
}
.bsv,
.usd {
  @apply text-white p-2 rounded-lg;
}
.bsv {
  @apply bg-primary;
}
</style>
