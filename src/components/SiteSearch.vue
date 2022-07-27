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

<script>
import { apiSearch } from '@/api/search';
import { readToken } from '@/store/main/getters';
import DebugSpan from '@/components/base/DebugSpan';

export default {
  components: { DebugSpan },
  props: {
    label: {
      type: String,
      default: '圈子',
    },
    onStart: {
      type: Function,
      default: undefined,
    },
    onComplete: {
      type: Function,
      default: undefined,
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
      if (this.onStart) {
        this.onStart();
      }
      this.loading = true;
      apiSearch.searchSites(this.token, v).then((response) => {
        this.sites = response.data;
        this.loading = false;
        if (this.onComplete) {
          this.onComplete();
        }
      });
    },
    getItemText(item) {
      return `${item.name} (${item.subdomain})`;
    },
  },
};
</script>
