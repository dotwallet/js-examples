<template>
  <div class="">
    <div class="fair max-w-lg bg-gray-800 text-white rounded-lg p-5 my-10 m-auto">
      <h1>{{ title[lang] }}</h1>
      <p>{{ p1[lang] }}</p>
      <p>{{ p2[lang] }}</p>
      <p>{{ p3[lang] }}</p>
    </div>

    <div class="overflow-x-scroll side-scroller px-3 mt-10 ">
      <div class="history w-max-content mx-auto">
        <div
          class="grid p-3 text-gray-500"
          :class="index % 2 == 0 ? 'bg-gray-900 rounded-md ' : ''"
          v-for="(record, index) in history"
          :key="record.txid"
        >
          <p>
            {{ date[lang] }}: {{ record.date == 'today' ? today[lang] : dateParse(record.date) }}
          </p>
          <p>
            {{ seed[lang] }}: {{ record.seed == 'unreleased' ? unreleased[lang] : record.seed }}
          </p>
          <p>{{ seedHash[lang] }}: {{ record.newSeedHash }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { SERVER_URL } from '../config';
import locales from '../assets/locales.json';
import { mapState } from 'vuex';
export default {
  name: 'Fair',
  mounted() {
    this.getRecords();
  },
  methods: {
    async getRecords() {
      this.loadingBets = true;
      const res = await axios.get(SERVER_URL + '/seed-history');
      console.log(res.data);
      this.history = res.data;
    },
    dateParse(time) {
      return time.split('T')[0];
    },
  },
  computed: {
    ...mapState(['lang']),
  },
  data() {
    return {
      history: [],
      ...locales.fair,
    };
  },
};
</script>

<style>
.fair p {
  @apply my-5;
  @apply leading-7;
}
.history p {
  @apply my-2;
}
</style>
