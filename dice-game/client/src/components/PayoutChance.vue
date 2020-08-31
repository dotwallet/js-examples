<template>
  <div class="payout-chance min-w-1/2 lg:min-w-0 lg:w-1/4">
    <div class="relative">
      <div class="bg-tert-light text-black rounded-lg px-2 py-1 my-2 mr-3">
        <p>Payout</p>
      </div>
      <div
        class="absolute bg-primary text-white px-2 right-0 top-0 rounded-xl p-1"
      >
        <p class="my-0 mx-auto">0.2</p>
      </div>
    </div>
    <div class="relative mt-5">
      <div class="bg-tert-light text-black rounded-lg px-2 py-1 my-2 mr-3">
        <p>Payout</p>
      </div>
      <div
        class="absolute bg-primary text-white px-2 right-0 top-0 rounded-xl p-1"
      >
        <p class="my-0 mx-auto">0.2</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style>
.payout-chance {
  @apply p-3 m-5 rounded-lg bg-tert shadow-light;
}
</style>
