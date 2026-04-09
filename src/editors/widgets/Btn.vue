<template>
  <button

    class="editor-p-1"
    :class="{
      'editor-bg-tippydark editor-text-white editor-rounded':
        (active && color === 'light') || (!active && color === 'dark'),
      'editor-bg-white editor-text-black editor-rounded':
        (active && color === 'dark') || (!active && color === 'light'),
    }"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import '../styles/main.css';

withDefaults(
  defineProps<{
    active: boolean;
    color?: 'light' | 'dark';
  }>(),
  {
    color: 'light',
  }
);
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
