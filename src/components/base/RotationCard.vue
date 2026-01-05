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

<script setup lang="ts">
import { ref } from 'vue';
import RefreshIcon from '@/components/icons/RefreshIcon.vue';

const props = defineProps<{
  title: string;
  items: any[];
}>();

const currentItem = ref(0);

function rotate() {
  currentItem.value = (currentItem.value + 1) % props.items.length;
}
</script>
