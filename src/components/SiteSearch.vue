<template>
  <v-autocomplete
    v-model="selectedSiteSubdomain"
    :item-text="getItemText"
    :items="sites"
    label="圈子"
    :loading="loading"
    :search-input.sync="search"
    cache-items
    hide-details
    hide-no-data
    placeholder="搜索..."
    item-value="subdomain"
    @input="$emit('input', selectedSiteSubdomain)"
  ></v-autocomplete>
</template>

<script>
import { apiSearch } from '@/api/search';
import { readToken } from '@/store/main/getters';

export default {
  props: {
    returnSelf: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      loading: false,
      sites: [],
      search: null,
      selectedSiteSubdomain: null,
    };
  },
  watch: {
    search(val) {
      if (val && val !== this.selectedSiteSubdomain) {
        this.querySelections(val);
      }
    },
  },
  computed: {
    token() {
      return readToken(this.$store);
    },
  },
  methods: {
    querySelections(v) {
      this.loading = true;
      apiSearch.searchSites(this.token, v).then((response) => {
        this.sites = response.data;
        this.loading = false;
      });
    },
    getItemText(item) {
      return `${item.name} (${item.subdomain})`;
    },
  },
};
</script>
