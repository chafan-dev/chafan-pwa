<template>
  <v-autocomplete
    v-model="selectedTopicId"
    :loading="loading"
    :items="topics"
    :item-text="getItemText"
    item-value="uuid"
    :search-input.sync="search"
    cache-items
    hide-no-data
    hide-details
    :label="$t('Topic name')"
    @input="$emit('input', selectedTopicId)"
  ></v-autocomplete>
</template>

<script>
import { apiSearch } from '@/api/search';

export default {
  props: ['token'],
  data() {
    return {
      loading: false,
      topics: [],
      search: null,
      selectedTopicId: null,
      states: [],
    };
  },
  watch: {
    search(val) {
      if (val && val !== this.selectedTopicId) {
        this.querySelections(val);
      }
    },
  },
  methods: {
    querySelections(v) {
      this.loading = true;
      apiSearch.searchTopics(this.token, v).then((response) => {
        this.topics = response.data;
        this.loading = false;
      });
    },
    getItemText(item) {
      return item.name;
    },
  },
};
</script>
