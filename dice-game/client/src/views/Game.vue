<template>
  <div class="about">
    <big-die></big-die>
    <die-select></die-select>
    <bet-amount></bet-amount>
    <payout-chance></payout-chance>
  </div>
</template>
<script>
import BigDie from '../components/BigDie';
import DieSelect from '../components/DieSelect';
import BetAmount from '../components/BetAmount';
import PayoutChance from '../components/PayoutChance';
export default {
  components: {
    BigDie,
    DieSelect,
    BetAmount,
    PayoutChance,
  },
};
</script>

<style scoped>
.about {
  @apply flex-col flex items-center  bg-primary-black h-full text-white;
}
</style>
