<template>
  <div>
    <debug-span>{{ selectedSite }}</debug-span>
    <v-autocomplete
      v-model="selectedSiteSubdomain"
      :item-text="getItemText"
      :items="sites"
      :label="label"
      :loading="loading"
      :search-input.sync="search"
      cache-items
      hide-details
      hide-no-data
      placeholder="搜索..."
      item-value="subdomain"
      @input="$emit('input', selectedSite)"
    ></v-autocomplete>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { apiSearch } from '@/api/search';
import DebugSpan from '@/components/base/DebugSpan.vue';
import { ISite } from '@/interfaces';
import { useAuth } from '@/composables';

const props = withDefaults(
  defineProps<{
    label?: string;
    onStart?: () => void;
    onComplete?: () => void;
  }>(),
  {
    label: '圈子',
  }
);

const emit = defineEmits<{
  (e: 'input', value: ISite | undefined): void;
}>();

const { token } = useAuth();

const loading = ref(false);
const sites = ref<ISite[]>([]);
const search = ref<string | null>(null);
const selectedSiteSubdomain = ref<string | null>(null);

const selectedSite = computed(() => {
  return sites.value.find((site) => site.subdomain === selectedSiteSubdomain.value);
});

watch(search, (val) => {
  if (val) {
    querySelections(val);
  }
});

async function querySelections(v: string) {
  if (props.onStart) {
    props.onStart();
  }
  loading.value = true;
  const response = await apiSearch.searchSites(token.value, v);
  sites.value = response.data;
  loading.value = false;
  if (props.onComplete) {
    props.onComplete();
  }
}

function getItemText(item: ISite) {
  return `${item.name} (${item.subdomain})`;
}
</script>
