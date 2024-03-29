]
<template>
  <div>
    <v-menu
      v-model="showSearchResults"
      :close-on-content-click="false"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      allow-overflow
      max-height="600"
      offset-y
    >
      <div style="min-width: 220px">
        <SearchResults ref="searchResults" :onReady="onReady" :query="currentQuery" />
        <div style="background: white">
          <v-divider class="mx-1 mb-1" />
          <div class="d-flex pb-1 pr-1">
            <v-spacer />
            <v-btn color="secondary" depressed outlined small @click="openInNew">
              新页面打开
            </v-btn>
          </div>
        </div>
      </div>
    </v-menu>
    <v-text-field
      v-model="searchInput"
      dense
      filled
      hide-details
      outlined
      placeholder="搜索"
      @input="searchDebounced"
      @keydown.enter="search"
    >
      <template v-slot:append>
        <v-progress-circular v-if="loading" indeterminate size="25" width="2" />
        <SearchIcon v-else @click="search" />
      </template>
    </v-text-field>
  </div>
</template>

<script lang="ts">
import SearchIcon from '@/components/icons/SearchIcon.vue';
import { Component, Vue } from 'vue-property-decorator';
import SearchResults from '@/components/SearchResults.vue';

@Component({
  components: { SearchResults, SearchIcon },
})
export default class SearchBox extends Vue {
  public loading: boolean = false;
  private timerId: any = null;
  private searchInput: string | null = null;
  private showSearchResults = false;
  private menuX = 0;
  private menuY = 0;
  private currentQuery: string | null = null;

  private mounted() {
    for (const e of this.$el.getElementsByTagName('input')) {
      const inputElem = e as HTMLInputElement;
      inputElem.autocomplete = 'off';
    }
  }

  private searchDebounced() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(this.search, 1000);
  }

  private search() {
    if (this.searchInput === this.currentQuery) {
      return;
    }
    let val = this.searchInput;
    if (val && val.startsWith('@')) {
      val = val.substring(1);
    }
    if (val) {
      this.querySelections(val);
    }
  }

  private onReady() {
    this.loading = false;
  }

  private async querySelections(v: string) {
    this.loading = true;
    if (this.showSearchResults) {
      await (this.$refs.searchResults as SearchResults)?.doSearch(v);
    } else {
      this.currentQuery = v;
    }
    this.menuY = this.$el.getBoundingClientRect().bottom;
    this.menuX = this.$el.getBoundingClientRect().left;
    this.showSearchResults = true;
  }

  private openInNew() {
    this.showSearchResults = false;
    this.$router.push({ path: '/search', query: { q: this.currentQuery } });
  }
}
</script>
