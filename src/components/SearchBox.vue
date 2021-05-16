]
<template>
  <div>
    <v-menu
      v-model="showSearchResults"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      allow-overflow
      max-height="600"
      offset-y
      :close-on-content-click="false"
    >
      <div>
        <SearchResults ref="searchResults" mode="menu" />
        <div class="d-flex pb-1 pr-1" v-if="!loading" style="width: 400px; background: white">
          <v-spacer />
          <v-btn depressed outlined @click="openInNew" small color="secondary"> 新页面打开 </v-btn>
        </div>
      </div>
    </v-menu>
    <v-text-field
      v-model="searchInput"
      :placeholder="$t('Search')"
      dense
      filled
      hide-details
      outlined
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
  private timerId: any = null;
  private searchInput: string | null = null;
  private showSearchResults = false;
  private menuX = 0;
  private menuY = 0;
  public loading: boolean = false;
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
    let val = this.searchInput;
    if (val && val.startsWith('@')) {
      val = val.substring(1);
    }
    if (val) {
      this.querySelections(val);
    }
  }

  private async querySelections(v: string) {
    this.loading = true;
    this.currentQuery = v;
    await (this.$refs.searchResults as SearchResults)?.doSearch(v);

    this.menuY = this.$el.getBoundingClientRect().bottom;
    this.menuX = this.$el.getBoundingClientRect().left;
    this.showSearchResults = true;
    this.loading = false;
  }

  private openInNew() {
    this.$router.push({ path: 'search/', query: { q: this.currentQuery } });
  }
}
</script>
