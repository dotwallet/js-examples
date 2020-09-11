<template>
  <div class="w-full bg-gray-900 min-h-screen mt-5">
    <div class="flex items-center justify-around p-2">
      <button
        class="text-sm border-b-2 py-2"
        :class="mineOrAll === 'mine' ? 'border-yellow-300' : 'border-gray-400'"
        @click.prevent="mine()"
      >
        MY BETS
      </button>
      <button
        class="text-sm border-b-2 py-2"
        :class="mineOrAll === 'all' ? 'border-yellow-300' : 'border-gray-400'"
        @click.prevent="all()"
      >
        ALL BETS
      </button>
    </div>
    <div>
      <div
        class="grid grid-cols-8 text-gray-500 text-center p-2"
        v-if="myHistory.length > 0 || allHistory.length > 0"
      >
        <div>Bet amount</div>
        <div>result</div>
        <div>guesses</div>
        <div>roll</div>
        <div>time</div>
        <div>bet tx</div>
        <div>payout</div>
        <div>payout tx</div>
      </div>
      <div v-if="mineOrAll === 'mine'">
        <div
          class="grid grid-cols-8 p-1 text-center mx-2"
          :class="index % 2 == 0 ? 'bg-gray-800 rounded-md ' : ''"
          v-for="(record, index) in myHistory"
          :key="record.txid"
        >
          <div>{{ record.betAmount }}</div>
          <div>{{ record.correct ? 'win' : 'lose' }}</div>
          <div>{{ record.guesses }}</div>
          <div>{{ record.roll }}</div>
          <div>{{ timeParse(record.timeStamp) }}</div>
          <a :href="`https://satoshi.io/tx/${record.txid}`">inspect</a>
          <div>{{ record.payoutResult.payoutAmount }}</div>
          <a :href="`https://satoshi.io/tx/${record.payoutResult.txid}`">inspect</a>
        </div>
      </div>
      <div v-if="mineOrAll === 'all'">
        <div
          class="grid grid-cols-8 p-1 text-center mx-2"
          :class="index % 2 == 0 ? 'bg-gray-800 rounded-md ' : ''"
          v-for="(record, index) in allHistory"
          :key="record.txid"
        >
          <div>{{ record.betAmount }}</div>
          <div>{{ record.correct ? 'win' : 'lose' }}</div>
          <div>{{ record.guesses }}</div>
          <div>{{ record.roll }}</div>
          <div>{{ timeParse(record.timeStamp) }}</div>
          <a :href="`https://satoshi.io/tx/${record.txid}`">inspect</a>
          <div>{{ record.payoutResult.payoutAmount }}</div>
          <a :href="`https://satoshi.io/tx/${record.payoutResult.txid}`">inspect</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { SERVER_URL } from '../config';
import store from '../store';
export default {
  mounted() {
    this.getRecords();
  },
  methods: {
    timeParse(time) {
      return time.split('T')[1].substring(0, 7);
    },
    mine() {
      this.mineOrAll = 'mine';
      this.getRecords();
    },
    all() {
      this.mineOrAll = 'all';
      this.getRecords();
    },
    async getRecords() {
      const postData = {
        rangeStart: this.rangeStart,
        rangeEnd: this.rangeEnd,
      };
      if (this.mineOrAll === 'mine') postData.userID = store.state.userInfo.user_open_id;
      const res = await axios.post(SERVER_URL + '/bet-history', postData);
      console.log(res.data);
      this.mineOrAll === 'mine'
        ? (this.myHistory = this.myHistory.concat(res.data))
        : (this.allHistory = this.allHistory.concat(res.data));
    },
  },
  data() {
    return {
      mineOrAll: 'all',
      myHistory: [],
      allHistory: [],
      rangeStart: 0,
      rangeEnd: 10,
    };
  },
};
</script>

<style></style>
