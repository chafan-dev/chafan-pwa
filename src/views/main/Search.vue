<template>
  <v-container fluid>
    <v-row fluid justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }">
        <div class="mb-1">
          <div class="headline primary--text mb-3">搜索结果</div>
          <v-skeleton-loader type="paragraph" v-if="loading" />
          <SearchResults ref="searchResults" :card="true" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { readToken } from '@/store/main/getters';
import SearchResults from '@/components/SearchResults.vue';
@Component({
  components: { SearchResults },
})
export default class Search extends Vue {
  private loading = true;

  get token() {
    return readToken(this.$store);
  }

  private async mounted() {
    const q = this.q;
    if (q) {
      await (this.$refs.searchResults as SearchResults).doSearch(q);
    }
    this.loading = false;
  }

  get q() {
    return this.$route.query.q ? this.$route.query.q.toString() : null;
  }
}
</script>
