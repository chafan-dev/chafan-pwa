<script setup lang="ts">
import { computed } from 'vue';
import { IUserPreview } from '@/interfaces';
import { isDev, isProdDev } from '@/utils';

const DEFAULT_URL = '/img/default-avatar.png';

const props = withDefaults(defineProps<{
  userPreview?: IUserPreview;
  avatarUrl?: string;
  size?: number;
  color?: 'primary';
}>(), {
  size: 30,
});

const url = computed(() => {
  if (isDev && !isProdDev) {
    return 'https://cdn.jsdelivr.net/npm/programming-languages-logos/src/c/c.png';
  } else if (props.userPreview) {
    return props.userPreview.avatar_url ? props.userPreview.avatar_url : DEFAULT_URL;
  } else if (props.avatarUrl) {
    return props.avatarUrl;
  } else {
    return DEFAULT_URL;
  }
});
</script>

<template>
  <v-avatar class="avatar-div" :size="size" :color="color" rounded>
    <v-img :src="url" alt="Avatar" />
  </v-avatar>
</template>
