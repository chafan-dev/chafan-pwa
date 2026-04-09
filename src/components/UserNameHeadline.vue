<script setup lang="ts">
import { IUserPreview } from '@/interfaces';

defineProps<{
  userPreview: IUserPreview;
}>();
</script>

<template>
  <div class="pt-6">
    <router-link :to="'/users/' + userPreview.handle" class="text-decoration-none text-h5">
      <span v-if="userPreview.full_name">
        {{ userPreview.full_name }}
      </span>
      <span v-else> @{{ userPreview.handle }} </span>
    </router-link>

    <span v-if="userPreview.full_name" class="text-grey text-h5">
      (@{{ userPreview.handle }})
    </span>

    <div v-if="userPreview.personal_introduction" class="text-secondary text-body-1">
      {{ userPreview.personal_introduction }}
    </div>
  </div>
</template>
