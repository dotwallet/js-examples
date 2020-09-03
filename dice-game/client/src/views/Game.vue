<template>
  <div class="about">
    <big-die
      :roll-result="rollResult"
      :can-roll="canRoll"
      @roll="roll"
      @reset="resetRoll"
    ></big-die>
    <die-select @select="dieSelect"></die-select>
    <bet-amount @bet-amount="updateBetAmount" @currency="updateCurrency"></bet-amount>
    <payout-chance :bet-amount="betAmount" :num-die-selected="selectedDie ? selectedDie.length : 0">
    </payout-chance>
  </div>
</template>
<script>
import BigDie from '../components/BigDie';
import DieSelect from '../components/DieSelect';
import BetAmount from '../components/BetAmount';
import PayoutChance from '../components/PayoutChance';
import axios from 'axios';
import { SERVER_URL, APP_ID } from '../config.js';
import { v4 as uuid } from 'uuid';
import store from '../store';
export default {
  components: {
    BigDie,
    DieSelect,
    BetAmount,
    PayoutChance,
  },
  computed: {
    canRoll() {
      if (this.betAmount > 0 && !!this.selectedDie && this.selectedDie.length < 6) {
        return true;
      } else return false;
    },
  },
  data() {
    return {
      betAmount: 0,
      currency: 'BSV',
      rollResult: undefined,
      selectedDie: undefined,
    };
  },
  methods: {
    async roll() {
      const res = await axios.post(SERVER_URL + '/bet-pay', {
        orderData: {
          app_id: APP_ID,
          merchant_order_sn: uuid(),
          pre_amount: this.betAmount,
          user_open_id: store.state.userInfo.user_open_id,
          item_name: 'bet--' + store.state.userInfo.user_open_id + '--' + new Date(),
        },
        userWallet: store.state.userInfo.user_address,
        betAmount: this.betAmount,
      });
      console.log('roll response', res.data);
      this.rollResult = res.data.roll;
    },
    resetRoll() {
      this.rollResult = undefined;
    },
    dieSelect(selection) {
      this.selectedDie = selection;
    },
    updateBetAmount(val) {
      this.betAmount = val;
    },
    updateCurrency(curr) {
      this.currency = curr;
    },
  },
};
</script>

<style scoped>
.about {
  @apply flex-col flex items-center  bg-primary-black h-full text-white;
}
</style>
