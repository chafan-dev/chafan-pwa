<template>
  <div class="items">
    <button
      class="item"
      :class="{ 'is-selected': index === selectedIndex }"
      v-for="(item, index) in items"
      :key="index"
      @click="selectItem(index)"
    >
      {{ userLabel(item) }}
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component
export default class MentionList extends Vue {
  @Prop() public readonly items!: any[];
  @Prop() public readonly command!: any;
  @Prop() public readonly userLabel!: (userItem: any) => string;

  private selectedIndex = 0;

  @Watch('items')
  watchItems() {
    this.selectedIndex = 0;
  }

  onKeyDown({ event }: { event: KeyboardEvent }) {
    if (event.key === 'ArrowUp') {
      this.upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      this.downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      this.enterHandler();
      return true;
    }

    return false;
  }
  upHandler() {
    this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length;
  }
  downHandler() {
    this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
  }

  enterHandler() {
    this.selectItem(this.selectedIndex);
  }

  selectItem(index: number) {
    const item = this.items[index];

    if (item) {
      this.command({ id: item });
    }
  }
}
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
