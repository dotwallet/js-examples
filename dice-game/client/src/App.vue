<template>
  <div class="app scroller">
    <the-navbar v-if="!loggedIn" id="nav"> </the-navbar>

    <router-view @limit-alert="limitAlert" @tutorial-alert="tutorialAlert"> </router-view>
    <the-modal
      v-if="modalShow"
      :msg="modalMsg"
      :button-text="modalButtonText"
      @close="modalShow = false"
      @modal-button="modalBtnCall"
    />
  </div>
</template>
<script>
import TheNavbar from './components/TheNavbar';
import TheModal from './components/TheModal';
import locales from './assets/locales.json';
import { mapState, mapMutations } from 'vuex';
import { CLIENT_URL, APP_ID } from './config.js';

export default {
  components: { TheNavbar, TheModal },
  computed: {
    ...mapState(['lang']),
  },
  data() {
    return {
      ...locales.modals,
      loggedIn: false,
      modalMsg: '',
      modalButtonText: '',
      modalShow: false,
    };
  },
  mounted() {
    let userAgentString = navigator.userAgent;
    let chromeAgent = userAgentString.indexOf('Chrome') > -1;
    let firefoxAgent = userAgentString.indexOf('Firefox') > -1;

    if (!chromeAgent && !firefoxAgent) {
      this.browserAlert();
    }
  },
  methods: {
    ...mapMutations(['FIRST_TIME']),
    modalClose() {
      this.modalShow = false;
    },
    copyUrl() {
      if (!window.getSelection) {
        alert('Please copy the URL from the location bar.');
        return;
      }
      const dummy = document.createElement('p');
      dummy.textContent = window.location.href;
      document.body.appendChild(dummy);

      const range = document.createRange();
      range.setStartBefore(dummy);
      range.setEndAfter(dummy);

      const selection = window.getSelection();
      // First clear, in case the user already selected some other text
      selection.removeAllRanges();
      selection.addRange(range);

      document.execCommand('copy');
      document.body.removeChild(dummy);
    },
    modalBtnCall() {
      switch (this.modalType) {
        case 'browser':
          this.copyUrl();
          this.modalShow = false;
          break;
        case 'limit':
          this.modalShow = false;
          this.authorizeAutopay();
          break;
        case 'tutorial':
          this.FIRST_TIME(false);
          this.modalShow = false;
          break;
        default:
          this.modalShow = false;
          break;
      }
    },
    authorizeAutopay() {
      window.location.href = `https://www.ddpurse.com/openapi/set_pay_config?app_id=${APP_ID}
      &redirect_uri=${CLIENT_URL}/game`;
    },
    browserAlert() {
      this.modalShow = true;
      this.modalType = 'browser';
      this.modalMsg = this.browser[this.lang];
      this.modalButtonText = this.browserBtn[this.lang];
    },
    limitAlert() {
      this.modalShow = true;
      this.modalType = 'limit';
      this.modalMsg = this.limit[this.lang];
      this.modalButtonText = this.limitBtn[this.lang];
    },
    tutorialAlert() {
      this.modalShow = true;
      this.modalType = 'tutorial';
      this.modalMsg = this.tutorial[this.lang];
      this.modalButtonText = this.tutorialBtn[this.lang];
    },
  },
};
</script>
