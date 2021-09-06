<template>
  <div>
    <div class="d-flex">
      <span class="font-weight-bold subtitle-1">{{ title }}</span>
      <v-spacer />
      <v-btn color="secondary" outlined small @click="rotate" v-if="items.length > 1">
        <span class="mr-1">换一个</span>
        <RefreshIcon />
      </v-btn>
    </div>
    <v-window v-model="currentItem" class="mt-1">
      <v-window-item v-for="(item, idx) in items" :key="idx">
        <v-sheet outlined class="pa-2">
          <slot :item="item"></slot>
        </v-sheet>
      </v-window-item>
    </v-window>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import RefreshIcon from '@/components/icons/RefreshIcon.vue';
import LeftIcon from '@/components/icons/LeftIcon.vue';
import RightIcon from '@/components/icons/RightIcon.vue';

@Component({
  components: { RightIcon, LeftIcon, RefreshIcon },
})
export default class RotationCard<T> extends Vue {
  @Prop() public readonly title!: string;
  @Prop() public readonly items!: T[];
  private currentItem = 0;

  rotate() {
    this.currentItem = (this.currentItem + 1) % this.items.length;
  }
}
</script>
