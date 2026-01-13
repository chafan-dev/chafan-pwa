<template>
  <button
    v-on="$listeners"
    class="tw-p-1"
    :class="{
      'tw-bg-tippydark tw-text-white tw-rounded':
        (active && color === 'light') || (!active && color === 'dark'),
      'tw-bg-white tw-text-black tw-rounded':
        (active && color === 'dark') || (!active && color === 'light'),
    }"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import '@/styles/main.css';

@Component
export default class Btn extends Vue {
  @Prop() public readonly active!: boolean;
  @Prop({ default: 'light' }) public readonly color!: 'light' | 'dark';
}
</script>

<style scoped>
button {
  font-family: inherit; /* 1 */
  font-size: 100%; /* 1 */
  line-height: 1.15; /* 1 */
  margin: 0; /* 2 */
}

button {
  border: none;
}

button:focus {
  outline: 1px dotted;
}
</style>
