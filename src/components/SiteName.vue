<template>
  <span>
    <v-progress-circular v-if="site === null" indeterminate size="20" />
    <span v-else>
      {{ site.name }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ISite } from '@/interfaces';
import { apiSite } from '@/api/site';

const props = defineProps<{
  subdomain: string;
}>();

const site = ref<ISite | null>(null);

onMounted(async () => {
  site.value = (await apiSite.getSite(props.subdomain)).data;
});
</script>
