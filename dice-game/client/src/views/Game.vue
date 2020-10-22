<template>
  <div class="game scroller">
    <roll-result :win-msg="winMsg" :fail-msg="failMsg"></roll-result>
    <big-die
      :roll-result="rollResult"
      :can-roll="canRoll"
      @roll="roll"
      @reset="resetRoll"
    ></big-die>
    <div
      class="px-3 sm:px-20 md:px-40 flex flex-col lg:flex-row w-full content-center justify-center"
    >
      <die-select class="lg:order-2 self-center lg:m-auto" @select="dieSelect"></die-select>
      <bet-amount
        class="lg:order-1 "
        @bet-amount="updateBetAmount"
        @rate="updateRate"
        @currency="updateCurrency"
      ></bet-amount>
      <payout-chance
        class="lg:order-3"
        :currency="this.currency"
        :rate="this.rate"
        :bet-amount="betAmount"
        :num-die-selected="selectedDie ? selectedDie.length : 0"
      >
      </payout-chance>
    </div>
    <bet-history></bet-history>
  </div>
</template>
<script>
import BigDie from '../components/BigDie';
import DieSelect from '../components/DieSelect';
import BetAmount from '../components/BetAmount';
import PayoutChance from '../components/PayoutChance';
import RollResult from '../components/RollResult';
import BetHistory from '../components/BetHistory';

import locales from '../assets/locales.json';
import axios from 'axios';
import { SERVER_URL, CLIENT_URL, APP_ID } from '../config.js';
import { v4 as uuid } from 'uuid';
import { mapState } from 'vuex';
export default {
  components: {
    BigDie,
    DieSelect,
    BetAmount,
    PayoutChance,
    RollResult,
    BetHistory,
  },
  computed: {
    canRoll() {
      if (this.betAmount > 0 && !!this.selectedDie && this.selectedDie.length < 6) {
        return true;
      } else return false;
    },
    ...mapState(['lang', 'userInfo', 'firstTime']),
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
      ...locales.rollResult,
    };
  },
  methods: {
    async getPrizePool() {
      console.log('get prize pool');

      const result = await axios.get(SERVER_URL + '/check-prize-pool');
      console.log('get prize pool', result.data);
    },
    async roll() {
      try {
        const preAmount = this.userInfo.pre_amount * 0.00000001;
        if (this.betAmount > preAmount) {
          this.authorizeAutopay();
          return;
        }
        this.rollResult = -2; //-2 is spinning
        const res = await axios.post(SERVER_URL + '/bet', {
          orderData: {
            app_id: APP_ID,
            merchant_order_sn: uuid(),
            pre_amount: parseInt(this.betAmount / 0.00000001), // BSV to satoshi
            user_open_id: this.userInfo.user_open_id,
            item_name: 'bet--' + this.userInfo.user_open_id + '--' + new Date(),
          },
          userWallet: this.userInfo.user_address,
          betAmount: this.betAmount,
          guesses: this.selectedDie,
        });
        console.log('roll response', res.data);
        if (res.data.error) {
          this.rollResult = -1;
          if (res.data.error.includes('pre_amount')) {
            this.$emit('limit-alert');
            return;
          } else if (
            res.data.error.includes('balance') || // show alert to add to balance
            res.data.error.includes('authorized') // directly redirect
          ) {
            this.authorizeAutopay();
            return;
          } else throw res.data.error;
        }
        this.rollResult = res.data.betRecord.roll;
        if (res.data.betRecord.correct) {
          this.winMsg = `${this.congrats[this.lang]} ${
            res.data.betRecord.payoutResult.payoutAmount
          } BSV!!`;
        } else {
          this.failMsg = this.sorry[this.lang];
        }
      } catch (error) {
        this.rollResult = -1;
        console.log('roll request error', error);
        alert('Error processing request');
      }
    },
    authorizeAutopay() {
      window.location.href = `https://www.ddpurse.com/openapi/set_pay_config?app_id=${APP_ID}
      &redirect_uri=${CLIENT_URL}/game`;
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
  mounted() {
    // if first time, show explanation.
    console.log('firstTime,', this.firstTime);
    if (this.firstTime) {
      this.$emit('tutorial-alert');
      // this.$emit('limit-alert');
    }
    this.getPrizePool();
  },
};
</script>

<style scoped>
.game {
  @apply items-center h-full text-white min-w-full;
}
</style>
