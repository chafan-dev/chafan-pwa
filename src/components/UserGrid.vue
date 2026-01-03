<template>
  <div>
    <v-lazy v-for="user in users" :key="user.uuid" class="my-2">
      <UserCard :compactMode="true" :userPreview="user" />
    </v-lazy>
  </div>
</template>

<script setup lang="ts">
import UserCard from '@/components/UserCard.vue';
import { IUserPreview } from '@/interfaces';

defineProps<{
  users: IUserPreview[];
}>();
</script>
