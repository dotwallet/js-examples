<template>
  <div class="game">
    <roll-result :win-msg="winMsg" :fail-msg="failMsg"></roll-result>
    <big-die
      :roll-result="rollResult"
      :can-roll="canRoll"
      @roll="roll"
      @reset="resetRoll"
    ></big-die>
    <die-select @select="dieSelect"></die-select>
    <bet-amount
      @bet-amount="updateBetAmount"
      @rate="updateRate"
      @currency="updateCurrency"
    ></bet-amount>
    <payout-chance
      :currency="this.currency"
      :rate="this.rate"
      :bet-amount="betAmount"
      :num-die-selected="selectedDie ? selectedDie.length : 0"
    >
    </payout-chance>
  </div>
</template>
<script>
import BigDie from '../components/BigDie';
import DieSelect from '../components/DieSelect';
import BetAmount from '../components/BetAmount';
import PayoutChance from '../components/PayoutChance';
import RollResult from '../components/RollResult';

import axios from 'axios';
import { SERVER_URL, CLIENT_URL, APP_ID } from '../config.js';
import { v4 as uuid } from 'uuid';
import store from '../store';
export default {
  components: {
    BigDie,
    DieSelect,
    BetAmount,
    PayoutChance,
    RollResult,
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
      rate: 200,
      rollResult: -1,
      selectedDie: undefined,
      winMsg: '',
      failMsg: '',
    };
  },
  methods: {
    async roll() {
      try {
        this.rollResult = -2; //-2 is spinning
        const res = await axios.post(SERVER_URL + '/bet', {
          orderData: {
            app_id: APP_ID,
            merchant_order_sn: uuid(),
            pre_amount: parseInt(this.betAmount / 0.00000001), // BSV to satoshi
            user_open_id: store.state.userInfo.user_open_id,
            item_name: 'bet--' + store.state.userInfo.user_open_id + '--' + new Date(),
          },
          userWallet: store.state.userInfo.user_address,
          betAmount: this.betAmount,
          guesses: this.selectedDie,
        });
        console.log('roll response', res.data);
        if (res.data.error) {
          this.rollResult = -1;
          if (res.data.error.includes('balance')) {
            window.location.href = `https://www.ddpurse.com/openapi/set_pay_config?app_id=${APP_ID}
      &redirect_uri=${CLIENT_URL}/game`;
            return;
          } else throw res.data.error;
        }
        this.rollResult = res.data.betRecord.roll;
        if (res.data.betRecord.correct) {
          this.winMsg = `Congratulations!\n
          You won ${res.data.betRecord.payoutResult.payoutAmount} BSV!!`;
        } else {
          this.failMsg = 'Sorry try again';
        }
      } catch (error) {
        this.rollResult = -1;
        console.log('roll request error', error);
        alert('Error processing request');
      }
    },
    resetRoll() {
      this.winMsg = '';
      this.failMsg = '';
      this.rollResult = -1;
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
    updateRate(rate) {
      this.rate = rate;
    },
  },
};
</script>

<style scoped>
.game {
  @apply flex-col flex items-center  h-full text-white min-w-full;
}
</style>
