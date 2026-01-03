<template>
  <v-autocomplete
    v-model="selectedTopicId"
    :item-text="getItemText"
    :items="topics"
    label="话题名"
    :loading="loading"
    :search-input.sync="search"
    cache-items
    hide-details
    hide-no-data
    item-value="uuid"
    @input="$emit('input', selectedTopicId)"
  ></v-autocomplete>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { apiSearch } from '@/api/search';
import { ITopic } from '@/interfaces';

const props = defineProps<{
  token: string;
}>();

const emit = defineEmits<{
  (e: 'input', value: string | null): void;
}>();

const loading = ref(false);
const topics = ref<ITopic[]>([]);
const search = ref<string | null>(null);
const selectedTopicId = ref<string | null>(null);

watch(search, (val) => {
  if (val && val !== selectedTopicId.value) {
    querySelections(val);
  }
});

async function querySelections(v: string) {
  loading.value = true;
  const response = await apiSearch.searchTopics(props.token, v);
  topics.value = response.data;
  loading.value = false;
}

function getItemText(item: ITopic) {
  return item.name;
}
</script>
