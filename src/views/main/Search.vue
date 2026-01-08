<template>
  <v-container fluid>
    <v-row fluid justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }">
        <div class="mb-1">
          <div class="headline primary--text mb-3">
            搜索结果：{{ q }}
            <v-progress-circular v-if="loading" class="mb-1" indeterminate size="20" />
          </div>
          <SearchResults ref="searchResults" :card="true" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router/composables';
import SearchResults from '@/components/SearchResults.vue';

const route = useRoute();

const loading = ref(true);
const searchResults = ref<InstanceType<typeof SearchResults> | null>(null);

const q = computed(() => {
  return route.query.q ? route.query.q.toString() : null;
});

onMounted(async () => {
  if (q.value && searchResults.value) {
    await (searchResults.value as any).doSearch(q.value);
  }
  loading.value = false;
});
</script>
