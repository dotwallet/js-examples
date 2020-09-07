<template>
  <div class="payout-chance min-w-1/2 lg:min-w-0 lg:w-1/4">
    <div class="relative">
      <div class="bg-tert-light text-black rounded-lg px-2 py-1 my-2 mr-3">
        <p>Payout</p>
      </div>
      <div class="absolute bg-primary text-white px-2 right-0 top-0 rounded-xl p-1">
        <p class="my-0 mx-auto">{{ payout }}</p>
      </div>
    </div>
    <div class="relative mt-5">
      <div class="bg-tert-light text-black rounded-lg px-2 py-1 my-2 mr-3">
        <p>Win Chance</p>
      </div>
      <div class="absolute bg-primary text-white px-2 right-0 top-0 rounded-xl p-1">
        <p class="my-0 mx-auto">{{ winChance }}%</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    winChance() {
      return Math.round((this.numDieSelected / 6) * 100);
    },
    payout() {
      if (this.numDieSelected === 0) return 0;
      else {
        const amt = this.currency === 'BSV' ? this.betAmount : this.betAmount * this.rate;
        const payout = (amt / (this.numDieSelected / 6)) * 0.9;
        const retunStr = payout.toString().substring(0, 7);
        return retunStr;
      }
    },
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
  @apply p-3 m-5 rounded-lg bg-tert shadow-light;
}
</style>
