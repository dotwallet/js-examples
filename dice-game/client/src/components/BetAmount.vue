<template>
  <div class="bet-amount min-w-1/2 lg:min-w-0 lg:w-1/4">
    <div class="relative">
      <div class="bg-tert-light mt-2 px-2 py-1 flex flex-col rounded-lg">
        <input v-if="currency === 'BSV'" class="bg-tert-light flex-grow" v-model.number="value" />
        <input v-else class="bg-tert-light flex-grow" v-model.number="usdValue" />
      </div>
      <div class="text-white bg-primary-light p-1 rounded-lg flex top-n3px right-0 absolute">
        <div
          @click="switchCurrency('BSV')"
          class="cursor-pointer px-2 py-1 rounded-xl"
          :class="currency === 'BSV' ? 'bg-primary' : ''"
        >
          <p class="text-sm">BSV</p>
        </div>
        <div
          @click="switchCurrency('USD')"
          class=" cursor-pointer px-2 py-1 rounded-xl"
          :class="currency !== 'BSV' ? 'bg-primary' : ''"
        >
          <p class="text-sm">USD</p>
        </div>
      </div>
    </div>
    <div class="my-5">
      <vue-slider
        v-if="currency === 'BSV'"
        :max="max"
        :min="min"
        :interval="0.00001"
        tooltip="none"
        v-model="value"
      >
        <template v-slot:dot> <div class="custom-dot"></div></template
      ></vue-slider>
      <vue-slider
        v-else
        :key="currency"
        :max="usdMax"
        :min="usdMin"
        :interval="0.1"
        v-model="usdValue"
        tooltip="none"
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
  watch: {
    usdValue() {
      this.$emit('bet-amount', this.roundToTenK(this.usdValue / this.rate));
    },
    value() {
      // if (this.min < this.value < this.max) this.value = parseInt(this.value);
      this.$emit('bet-amount', this.value);
    },
  },
  methods: {
    roundToTenK(num) {
      return Math.round((num + Number.EPSILON) * 10000) / 10000;
    },
    switchCurrency(curr) {
      if (curr === 'USD') Math.round((this.usdValue = this.value * this.rate));
      else this.value = this.roundToTenK(this.usdValue / this.rate);
      console.log(this.usdMin, this.usdMax, this.usdValue);
      this.currency = curr;
      this.$emit('currency', curr);
    },
  },
  mounted() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash-sv&vs_currencies=usd')
      .then(res => res.json())
      .then(data => {
        this.rate = data['bitcoin-cash-sv'].usd;
        this.$emit('rate', this.rate);
        this.usdMin = Math.round(this.min * this.rate) + 1;
        this.usdMax = Math.round(this.max * this.rate);
        this.usdValue = Math.round(this.value * this.rate);
      });
  },
  data() {
    return {
      value: 0.005,
      currency: 'BSV',
      rate: 200,
      max: 0.01,
      min: 0.00001,
      usdValue: 20,
      usdMin: 2,
      usdMax: 200,
    };
  },
};
</script>

<style>
.bet-amount {
  @apply p-3 m-5 rounded-lg bg-tert shadow-light;
}
</style>
