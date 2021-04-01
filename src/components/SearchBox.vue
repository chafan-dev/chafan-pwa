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
    >
      <v-list>
        <template v-for="(item, index) in items">
          <v-divider v-if="index" :key="index" class="ma-1" />
          <v-list-item :key="item.type + item.id" :to="getItemLink(item)" link target="_blank">
            {{ getItemText(item) }}
            <v-spacer />
            <span class="grey--text pl-1">{{ $t(item.type) }}</span>
          </v-list-item>
        </template>
      </v-list>
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
import { apiSearch } from '@/api/search';
import SearchIcon from '@/components/icons/SearchIcon.vue';
import { Component, Vue } from 'vue-property-decorator';
import { readToken } from '@/store/main/getters';

@Component({
  components: { SearchIcon },
})
export default class SearchBox extends Vue {
  private loading = false;
  private items: any[] = [];
  private timerId: any = null;
  private searchInput: string | null = null;
  private showSearchResults = false;
  private menuX = 0;
  private menuY = 0;

  get token() {
    return readToken(this.$store);
  }

  private mounted() {
    for (const e of this.$el.getElementsByTagName('input')) {
      const inputElem = e as HTMLInputElement;
      inputElem.autocomplete = 'off';
    }
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

  private searchDebounced() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(this.search, 1000);
  }

  private async querySelections(v) {
    const items: any[] = [];
    this.loading = true;

    (await apiSearch.searchUsers(this.token, v)).data.forEach((user) => {
      items.push({
        id: user.uuid,
        type: 'user',
        data: user,
      });
    });

    (await apiSearch.searchQuestions(this.token, v)).data.forEach((question) => {
      items.push({
        id: question.uuid,
        type: 'question',
        data: question,
      });
    });

    (await apiSearch.searchSites(this.token, v)).data.forEach((site) => {
      items.push({
        id: site.uuid,
        type: 'site',
        data: site,
      });
    });

    (await apiSearch.searchSubmissions(this.token, v)).data.forEach((submission) => {
      items.push({
        id: submission.uuid,
        type: 'submission',
        data: submission,
      });
    });

    (await apiSearch.searchAnswers(this.token, v)).data.forEach((answer) => {
      items.push({
        id: answer.uuid,
        type: 'answer',
        data: answer,
      });
    });

    (await apiSearch.searchArticles(this.token, v)).data.forEach((article) => {
      items.push({
        id: article.uuid,
        type: 'article',
        data: article,
      });
    });

    this.loading = false;
    this.items = items;
    this.menuY = this.$el.getBoundingClientRect().bottom;
    this.menuX = this.$el.getBoundingClientRect().left;
    this.showSearchResults = true;
  }

  private getItemFullText(item) {
    if (item.type === 'user') {
      let name = `@${item.data.handle}`;
      if (item.data.full_name) {
        name = `${item.data.full_name} (@${item.data.handle})`;
      }
      return name;
    }
    if (item.type === 'question') {
      return item.data.title;
    }
    if (item.type === 'article') {
      return item.data.title;
    }
    if (item.type === 'site') {
      return item.data.name;
    }
    if (item.type === 'submission') {
      return item.data.title;
    }
    if (item.type === 'answer') {
      return item.data.body;
    }
  }

  private getItemText(item) {
    const fullText = this.getItemFullText(item);
    if (fullText.length > 20) {
      return fullText.substr(0, 40) + '...';
    } else {
      return fullText;
    }
  }

  private getItemLink(item) {
    if (item.type === 'user') {
      return `/users/${item.data.handle}`;
    }
    if (item.type === 'question') {
      return `/questions/${item.data.uuid}`;
    }
    if (item.type === 'article') {
      return `/articles/${item.data.uuid}`;
    }
    if (item.type === 'submission') {
      return `/submissions/${item.data.uuid}`;
    }
    if (item.type === 'site') {
      return `/sites/${item.data.subdomain}`;
    }
    if (item.type === 'answer') {
      return `/questions/${item.data.question.uuid}/answers/${item.data.uuid}`;
    }
  }
}
</script>
