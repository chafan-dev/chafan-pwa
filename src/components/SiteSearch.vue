<template>
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
    label: {
      type: String,
      default: '圈子',
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
      if (val) {
        this.querySelections(val);
      }
    },
  },
  computed: {
    token() {
      return readToken(this.$store);
    },
    selectedSite() {
      return this.sites.find((site) => site.subdomain === this.selectedSiteSubdomain);
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
