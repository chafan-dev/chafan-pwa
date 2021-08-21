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
