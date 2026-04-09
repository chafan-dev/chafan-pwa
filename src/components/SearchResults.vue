<template>
  <v-tabs v-model="searchTab" show-arrows>
    <template v-for="config in d" :key="config.type">
      <v-tab v-if="config.items.length" :value="config.type">
        {{ configTypeText[config.type] }} ({{ config.items.length }})
      </v-tab>
    </template>
  </v-tabs>
  <v-window v-model="searchTab">
    <template v-for="config in d" :key="'panel-' + config.type">
      <v-window-item v-if="config.items.length" :value="config.type">
        <v-list>
          <template v-for="(item, index) in config.items" :key="item.type + item.id">
            <v-divider v-if="index" class="mx-1" />
            <v-list-item :to="getItemLink(item)" link target="_blank">
              {{ getItemText(item) }}
            </v-list-item>
          </template>
        </v-list>
      </v-window-item>
    </template>
  </v-window>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { apiSearch } from '@/api/search';
import { AxiosResponse } from 'axios';
import { useMainStore } from '@/stores/main';
const store = useMainStore();

const props = defineProps<{
  query?: string;
  onReady?: () => void;
}>();

const configTypeText: Record<string, string> = {
  user: '用户',
  question: '问题',
  site: '圈子',
  submission: '分享',
  answer: '答案',
  article: '文章',
};

interface SearchResultItem {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

interface SearchConfig {
  type: string;
  api: (token: string, query: string) => Promise<AxiosResponse<Record<string, unknown>[]>>;
  items: SearchResultItem[];
}

const searchTab = ref('user');
const d = ref<SearchConfig[]>([
  { type: 'user', api: apiSearch.searchUsers as SearchConfig['api'], items: [] },
  { type: 'question', api: apiSearch.searchQuestions as SearchConfig['api'], items: [] },
  { type: 'site', api: apiSearch.searchSites as SearchConfig['api'], items: [] },
  { type: 'submission', api: apiSearch.searchSubmissions as SearchConfig['api'], items: [] },
  { type: 'answer', api: apiSearch.searchAnswers as SearchConfig['api'], items: [] },
  { type: 'article', api: apiSearch.searchArticles as SearchConfig['api'], items: [] },
]);

const token = computed(() => store.token);

async function doSearch(v: string) {
  for (const config of d.value) {
    config.items = [];
  }

  for (const config of d.value) {
    const results = (await config.api(token.value, v)).data;
    results.forEach((o: Record<string, unknown>) => {
      config.items.push({
        id: o.uuid as string,
        type: config.type,
        data: o,
      });
    });
  }
  if (props.onReady) {
    props.onReady();
  }
}

onMounted(async () => {
  if (props.query) {
    await doSearch(props.query);
  }
});

function getItemFullText(item: SearchResultItem) {
  if (item.type === 'user') {
    let name = `@${item.data.handle}`;
    if (item.data.full_name) {
      name = `${item.data.full_name} (@${item.data.handle})`;
    }
    return name;
  }
  if (item.type === 'question') {
    return item.data.title as string;
  }
  if (item.type === 'article') {
    return item.data.title as string;
  }
  if (item.type === 'site') {
    return `${item.data.name} (${item.data.subdomain})`;
  }
  if (item.type === 'submission') {
    return item.data.title as string;
  }
  if (item.type === 'answer') {
    return item.data.body as string;
  }
  return '';
}

function getItemText(item: SearchResultItem) {
  const fullText = getItemFullText(item);
  if (fullText.length > 20) {
    return fullText.substr(0, 40) + '...';
  } else {
    return fullText;
  }
}

function getItemLink(item: SearchResultItem) {
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
    const question = item.data.question as Record<string, unknown>;
    return `/questions/${question.uuid}/answers/${item.data.uuid}`;
  }
  return '';
}

defineExpose({
  doSearch,
});
</script>
