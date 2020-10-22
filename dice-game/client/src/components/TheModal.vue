<template>
  <div class="fixed pin z-50 overflow-auto bg-smoke-light flex w-full h-full">
    <div class="relative p-8 bg-white w-full max-w-md m-auto flex-col flex">
      <span class="absolute top-0 right-0">
        <svg
          @click="close"
          class="h-12 w-12 fill-current text-gray-700 hover:text-gray-800"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path
            d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
          />
        </svg>
      </span>
      <p class="py-5">{{ msg }}</p>
      <button
        @click="modalButton"
        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log('modal called');
  },
  props: {
    msg: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default: 'Got it!',
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    modalButton() {
      this.$emit('modal-button');
    },
  },
};
</script>

<style></style>
