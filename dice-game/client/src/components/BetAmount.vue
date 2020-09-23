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
        // this.usdMin = Math.round(this.min * this.rate);
        this.usdMax = Math.round(this.max * this.rate);
        this.usdValue = Math.round(this.value * this.rate);
      });
  },
  data() {
    return {
      value: 0.005,
      currency: 'BSV',
      rate: 200,
      max: 1,
      min: 0.00001,
      usdValue: 20,
      usdMin: 0.1,
      usdMax: 200,
    };
  },
};
</script>

<style>
.bet-amount {
  @apply p-3 m-5 rounded-lg bg-tert shadow-light;
}

/* component style */
.vue-slider-disabled .vue-slider-process {
  background-color: #a7a7a7;
}
.vue-slider-disabled .vue-slider-dot-handle {
  border-color: #a7a7a7;
}
.vue-slider-disabled .vue-slider-mark-step-active {
  box-shadow: 0 0 0 2px #a7a7a7;
}

/* rail style */
.vue-slider-rail {
  @apply bg-tert-light;
  height: 1.5rem;
  border-radius: 15px;
  transition: background-color 0.3s;
}

/* process style */
.vue-slider-process {
  @apply bg-primary;
  border-radius: 15px;
  transition: background-color 0.3s;
}

/* mark style */
.vue-slider-mark-step {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #e8e8e8;
  background-color: #fff;
}
.vue-slider-mark-step-active {
  box-shadow: 0 0 0 2px #9cd5ff;
}
.vue-slider:hover .vue-slider-mark-step-active {
  box-shadow: 0 0 0 2px #69c0ff;
}

.vue-slider-mark-label {
  font-size: 12px;
  white-space: nowrap;
}
/* dot style */
.vue-slider-dot-handle {
  cursor: pointer;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #9cd5ff;
  box-sizing: border-box;
  transition: box-shadow 0.3s, border-color 0.3s;
}
.vue-slider:hover .vue-slider-dot-handle {
  border-color: #69c0ff;
}

.vue-slider-dot-handle-focus {
  border-color: #36abff;
  box-shadow: 0 0 0 5px rgba(54, 171, 255, 0.2);
}
.vue-slider:hover .vue-slider-dot-handle-focus {
  border-color: #36abff;
}

.vue-slider-dot-handle:hover {
  border-color: #36abff;
}
.vue-slider:hover .vue-slider-dot-handle:hover {
  border-color: #36abff;
}

.vue-slider-dot-handle-disabled {
  cursor: not-allowed;
  border-color: #ddd !important;
}

.vue-slider-dot-tooltip {
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}
.vue-slider-dot-tooltip-inner {
  font-size: 14px;
  white-space: nowrap;
  padding: 6px 8px;
  color: #fff;
  border-radius: 5px;
  border-color: rgba(0, 0, 0, 0.75);
  background-color: rgba(0, 0, 0, 0.75);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: scale(0.9);
  transition: transform 0.3s;
}
.vue-slider-dot-tooltip-inner::after {
  content: '';
  position: absolute;
}
.vue-slider-dot-tooltip-inner-top::after {
  top: 100%;
  left: 50%;
  transform: translate(-50%, 0);
  height: 0;
  width: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px;
  border-top-color: inherit;
}
.vue-slider-dot-tooltip-inner-bottom::after {
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, 0);
  height: 0;
  width: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px;
  border-bottom-color: inherit;
}
.vue-slider-dot-tooltip-inner-left::after {
  left: 100%;
  top: 50%;
  transform: translate(0, -50%);
  height: 0;
  width: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px;
  border-left-color: inherit;
}
.vue-slider-dot-tooltip-inner-right::after {
  right: 100%;
  top: 50%;
  transform: translate(0, -50%);
  height: 0;
  width: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px;
  border-right-color: inherit;
}
.vue-slider-dot-tooltip-inner-top {
  transform-origin: 50% 100%;
}
.vue-slider-dot-tooltip-inner-bottom {
  transform-origin: 50% 0;
}
.vue-slider-dot-tooltip-inner-left {
  transform-origin: 100% 50%;
}
.vue-slider-dot-tooltip-inner-right {
  transform-origin: 0% 50%;
}

.vue-slider-dot:hover .vue-slider-dot-tooltip,
.vue-slider-dot-tooltip-show {
  opacity: 1;
  visibility: visible;
}
.vue-slider-dot:hover .vue-slider-dot-tooltip .vue-slider-dot-tooltip-inner,
.vue-slider-dot-tooltip-show .vue-slider-dot-tooltip-inner {
  transform: scale(1);
}

/*# sourceMappingURL=antd.css.map */
</style>
