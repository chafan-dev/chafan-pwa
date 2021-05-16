<template>
  <v-tabs show-arrows>
    <template v-for="config in d">
      <v-tab v-if="config.items.length" :key="config.type">
        {{ $t(config.type) }} ({{ config.items.length }})
      </v-tab>
    </template>

    <template v-for="config in d">
      <v-tab-item :key="config.type" v-if="config.items.length">
        <v-list>
          <template v-for="(item, index) in config.items">
            <v-divider v-if="index && !card" :key="index" class="ma-1" />
            <v-list-item :key="item.type + item.id" :to="getItemLink(item)" link target="_blank">
              {{ getItemText(item) }}
            </v-list-item>
          </template>
        </v-list>
      </v-tab-item>
    </template>
  </v-tabs>
</template>

<script lang="ts">
import { apiSearch } from '@/api/search';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { readToken } from '@/store/main/getters';

@Component
export default class SearchResults extends Vue {
  @Prop({ default: false }) private readonly card!: boolean;

  private d: { type: string; api: any; items: any[] }[] = [
    {
      type: 'user',
      api: apiSearch.searchUsers,
      items: [],
    },
    {
      type: 'question',
      api: apiSearch.searchQuestions,
      items: [],
    },
    {
      type: 'site',
      api: apiSearch.searchSites,
      items: [],
    },
    {
      type: 'submission',
      api: apiSearch.searchSubmissions,
      items: [],
    },
    {
      type: 'answer',
      api: apiSearch.searchAnswers,
      items: [],
    },
    {
      type: 'article',
      api: apiSearch.searchArticles,
      items: [],
    },
  ];

  get token() {
    return readToken(this.$store);
  }

  public async doSearch(v: string) {
    for (const config of this.d) {
      config.items = [];
    }

    for (const config of this.d) {
      (await config.api(this.token, v)).data.forEach((o) => {
        config.items.push({
          id: o.uuid,
          type: config.type,
          data: o,
        });
      });
    }
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
