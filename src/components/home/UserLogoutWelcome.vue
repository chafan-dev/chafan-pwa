<template>
  <v-sheet>
    <v-alert outlined type="info"> 登录后浏览更多个性化内容！</v-alert>

    <ExploreSitesGrid />
  </v-sheet>
</template>
<script setup lang="ts">
import ExploreSitesGrid from '@/components/ExploreSitesGrid.vue';
</script>
