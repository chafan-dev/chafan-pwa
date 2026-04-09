<template>
  <div>
    <div class="d-flex">
      <span class="font-weight-bold text-subtitle-1">{{ title }}</span>
      <v-spacer />
      <v-btn color="secondary" variant="outlined" size="small" @click="rotate" v-if="items.length > 1">
        <span class="mr-1">换一个</span>
        <AppIcon name="Refresh"  />
      </v-btn>
    </div>
    <v-window v-model="currentItem" class="mt-1">
      <!-- Items are display-only in rotation, index key is acceptable -->
      <v-window-item v-for="(item, idx) in items" :key="idx">
        <v-sheet variant="outlined" class="pa-2">
          <slot :item="item"></slot>
        </v-sheet>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '@/components/icons/AppIcon.vue';

const props = defineProps<{
  title: string;
  items: unknown[];
}>();

const currentItem = ref(0);

function rotate() {
  currentItem.value = (currentItem.value + 1) % props.items.length;
}
</script>
