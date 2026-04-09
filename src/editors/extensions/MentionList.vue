<template>
  <div class="items">
    <button
      v-for="(item, index) in items"
      :key="item.handle"
      class="item"
      :class="{ 'is-selected': index === selectedIndex }"
      @click="selectItem(index)"
    >
      {{ userLabel(item) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IUserPreview } from '@/interfaces';

const props = defineProps<{
  items: IUserPreview[];
  command: (payload: { id: IUserPreview }) => void;
  userLabel: (userItem: IUserPreview) => string;
}>();

const selectedIndex = ref(0);

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0;
  }
);

function onKeyDown({ event }: { event: KeyboardEvent }) {
  if (event.key === 'ArrowUp') {
    upHandler();
    return true;
  }
  if (event.key === 'ArrowDown') {
    downHandler();
    return true;
  }
  if (event.key === 'Enter') {
    enterHandler();
    return true;
  }
  return false;
}

function upHandler() {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length;
}

function downHandler() {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length;
}

function enterHandler() {
  selectItem(selectedIndex.value);
}

function selectItem(index: number) {
  const item = props.items[index];
  if (item) {
    props.command({ id: item });
  }
}

defineExpose({ onKeyDown });
</script>

<style lang="scss" scoped>
$body-font-family: 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'PingFang SC',
  sans-serif, 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans CJK SC', 'WenQuanYi Micro Hei';

.items {
  position: relative;
  border-radius: 0.25rem;
  overflow: hidden;
  font-size: 0.9rem;
}

.item {
  font-family: $body-font-family;
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 0.2rem 0.5rem;
  color: white;

  &.is-selected,
  &:hover {
    background: grey;
  }
}
</style>
