<template>
  <div class="min-w-1/2 lg:min-w-0 lg:w-1/4">
    <h1 class="big-label">{{ oddsAndPayment[lang] }}</h1>

    <div class="payout-chance mx-5 md:mx-0 ">
      <div class="relative">
        <div class="bg-tert-light text-black rounded-lg px-2 py-1 my-2 mr-3">
          <p>{{ payout[lang] }}</p>
        </div>
        <div class="absolute bg-primary text-white px-2 right-0 top-0 rounded-xl p-1">
          <p class="my-0 mx-auto">{{ payoutAmt }}</p>
        </div>
      </div>
      <div class="relative mt-5">
        <div class="bg-tert-light text-black rounded-lg px-2 py-1 my-2 mr-3">
          <p>{{ winChance[lang] }}</p>
        </div>
        <div class="absolute bg-primary text-white px-2 right-0 top-0 rounded-xl p-1">
          <p class="my-0 mx-auto">{{ winChancePercent }}%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import locales from '../assets/locales.json';
import { mapState } from 'vuex';
export default {
  computed: {
    ...mapState(['lang']),

    winChancePercent() {
      return Math.round((this.numDieSelected / 6) * 100);
    },
    payoutAmt() {
      if (this.numDieSelected === 0) return 0;
      else {
        const amt = this.currency === 'BSV' ? this.betAmount : this.betAmount * this.rate;
        const payout = (amt / (this.numDieSelected / 6)) * 0.9;
        const retunStr =
          this.currency === 'BSV'
            ? payout.toString().substring(0, 8)
            : payout.toString().split('.')[0] +
              '.' +
              payout
                .toString()
                .split('.')[1]
                .substring(0, 2);
        return retunStr;
      }
    },
  },
  data() {
    return {
      ...locales.payoutChance,
      ...locales.labels,
    };
  },
  props: {
    numDieSelected: {
      type: Number,
      default: 0,
    },
    betAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'BSV',
    },
    rate: {
      type: Number,
      default: 200,
    },
  },
};
</script>

<style>
.payout-chance {
  @apply p-3 rounded-lg bg-tert shadow-light;
}
</style>
