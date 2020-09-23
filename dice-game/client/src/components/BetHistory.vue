<template>
  <div class="w-full min-h-full bg-gray-900 mt-5 ">
    <div class="flex items-center justify-center py-2 px-10 ">
      <button
        class="text-sm border-b-2 py-2 mx-10 uppercase"
        :class="mineOrAll === 'mine' ? 'border-yellow-300' : 'border-gray-400'"
        @click.prevent="mine()"
      >
        {{ myGames[lang] }}
      </button>
      <button
        class="text-sm border-b-2 py-2 mx-10 uppercase"
        :class="mineOrAll === 'all' ? 'border-yellow-300' : 'border-gray-400'"
        @click.prevent="all()"
      >
        {{ allGames[lang] }}
      </button>
    </div>
    <div class="overflow-x-scroll side-scroller px-3 ">
      <div class="mx-auto w-max-content">
        <div class="grid grid-cols-8 py-1 text-center mx-auto p-2 text-gray-700">
          <div class="grid-label">{{ betAmount[lang] }}</div>
          <div class="grid-label">{{ result[lang] }}</div>
          <div class="grid-label">{{ guesses[lang] }}</div>
          <div class="grid-label">{{ roll[lang] }}</div>
          <div class="grid-label">{{ time[lang] }}</div>
          <div class="grid-label">{{ betTx[lang] }}</div>
          <div class="grid-label">{{ result[lang] }}</div>
          <div class="grid-label">{{ payoutTx[lang] }}</div>
        </div>
      </div>

      <!-- skeleton -->
      <div v-if="myHistory.length === 0 && allHistory.length === 0" class="w-max-content mx-auto">
        <div
          class="grid grid-cols-8 py-1 text-center mx-auto px-2 w-full"
          :class="
            index % 2 == 0 ? 'bg-gray-800 rounded-md text-gray-800 animate-pulse' : 'text-gray-900'
          "
          v-for="(record, index) in dummyHistory"
          :key="record.txid"
        >
          <div>{{ record.betAmount }}</div>
          <div>{{ record.correct ? 'win' : 'lose' }}</div>
          <div>{{ record.guesses }}</div>
          <div>{{ record.roll }}</div>
          <div>{{ timeParse(record.timeStamp) }}</div>
          <a>inspect</a>
          <div>{{ record.payoutResult.payoutAmount }}</div>
          <a>inspect</a>
        </div>
      </div>
      <div v-else-if="mineOrAll === 'mine'" class="w-max-content mx-auto">
        <div
          class="grid grid-cols-8 py-2 text-center mx-auto px-2 text-gray-500 "
          :class="index % 2 == 0 ? 'bg-gray-800 rounded-md ' : ''"
          v-for="(record, index) in myHistory"
          :key="record.txid"
        >
          <div class="flex">
            <img src="@/assets/bitcoin-logo.png" alt="BSV" class="mr-2 h-5" />{{ record.betAmount }}
          </div>
          <div :class="record.correct ? 'text-green-400' : 'text-red-400'">
            {{ record.correct ? 'win' : 'lose' }}
          </div>
          <div>{{ guessesParse(record.guesses) }}</div>
          <div>{{ record.roll }}</div>
          <div>{{ timeParse(record.timeStamp) }}</div>
          <a class="inspect" :href="`https://satoshi.io/tx/${record.txid}`">{{ inspect[lang] }}</a>
          <div class="flex" :class="record.correct ? 'text-green-400' : 'text-red-400'">
            <img src="@/assets/bitcoin-logo.png" alt="BSV" class="mr-2 h-5" />{{
              record.correct ? record.payoutResult.payoutAmount : record.betAmount
            }}
          </div>
          <a class="inspect" :href="`https://satoshi.io/tx/${record.payoutResult.txid}`">{{
            record.correct ? 'inspect' : ''
          }}</a>
        </div>
      </div>
      <div v-else-if="mineOrAll === 'all'" class="w-max-content mx-auto pb-5">
        <div
          class="grid grid-cols-8 py-2 text-center mx-auto px-2 text-gray-500 "
          :class="index % 2 == 0 ? 'bg-gray-800 rounded-md ' : ''"
          v-for="(record, index) in allHistory"
          :key="record.txid"
        >
          <div class="flex">
            <img src="@/assets/bitcoin-logo.png" alt="BSV" class="mr-2 h-5" />{{ record.betAmount }}
          </div>
          <div :class="record.correct ? 'text-green-400' : 'text-red-400'">
            {{ record.correct ? 'win' : 'lose' }}
          </div>
          <div>{{ guessesParse(record.guesses) }}</div>
          <div>{{ record.roll }}</div>
          <div>{{ timeParse(record.timeStamp) }}</div>
          <a class="inspect" :href="`https://satoshi.io/tx/${record.txid}`">{{ inspect[lang] }}</a>
          <div class="flex" :class="record.correct ? 'text-green-400' : 'text-red-400'">
            <img src="@/assets/bitcoin-logo.png" alt="BSV" class="mr-2 h-5" />{{
              record.correct ? record.payoutResult.payoutAmount : record.betAmount
            }}
          </div>
          <a class="inspect" :href="`https://satoshi.io/tx/${record.payoutResult.txid}`">{{
            record.correct ? inspect[lang] : ''
          }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { SERVER_URL } from '../config';
import dummyHistory from '../assets/dummyHistory.json';
import locales from '../assets/locales.json';
import { mapState } from 'vuex';
export default {
  mounted() {
    this.getRecords();
  },
  computed: {
    ...mapState(['lang', 'userInfo']),
  },
  methods: {
    guessesParse(guessStr) {
      const split = guessStr.split('');
      let returnStr = '';
      for (const letter of split) {
        returnStr += letter + ', ';
      }
      return returnStr.substring(0, returnStr.length - 2);
    },
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
      this.loadingBets = true;
      if (
        (this.mineOrAll === 'mine' && this.myHistory.length > 0) ||
        (this.mineOrAll === 'all' && this.allHistory.length > 0)
      )
        return;
      const postData = {
        rangeStart: this.rangeStart,
        rangeEnd: this.rangeEnd,
      };
      if (this.mineOrAll === 'mine') postData.userID = this.userInfo.user_open_id;
      const res = await axios.post(SERVER_URL + '/bet-history', postData);
      console.log(res.data);
      this.mineOrAll === 'mine'
        ? (this.myHistory = this.myHistory.concat(res.data))
        : (this.allHistory = this.allHistory.concat(res.data));
    },
  },
  data() {
    return {
      ...locales.betHistory,
      mineOrAll: 'all',
      myHistory: [],
      allHistory: [],
      rangeStart: 0,
      rangeEnd: 10,
      dummyHistory: dummyHistory,
    };
  },
};
</script>

<style>
.grid-label {
  @apply mx-3;
}
.inspect {
  @apply underline text-gray-600;
}
</style>
