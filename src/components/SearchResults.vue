<template>
  <v-tabs show-arrows>
    <template v-for="config in d">
      <v-tab v-if="config.items.length" :key="config.type">
        {{ configTypeText[config.type] }} ({{ config.items.length }})
      </v-tab>
    </template>

    <template v-for="config in d">
      <v-tab-item v-if="config.items.length" :key="config.type">
        <v-list>
          <template v-for="(item, index) in config.items">
            <v-divider v-if="index" :key="index" class="mx-1" />
            <v-list-item :key="item.type + item.id" :to="getItemLink(item)" link target="_blank">
              {{ getItemText(item) }}
            </v-list-item>
          </template>
        </v-list>
      </v-tab-item>
    </template>
  </v-tabs>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { apiSearch } from '@/api/search';
import { readToken } from '@/store/main/getters';
import store from '@/store';

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

const d = ref<{ type: string; api: any; items: any[] }[]>([
  { type: 'user', api: apiSearch.searchUsers, items: [] },
  { type: 'question', api: apiSearch.searchQuestions, items: [] },
  { type: 'site', api: apiSearch.searchSites, items: [] },
  { type: 'submission', api: apiSearch.searchSubmissions, items: [] },
  { type: 'answer', api: apiSearch.searchAnswers, items: [] },
  { type: 'article', api: apiSearch.searchArticles, items: [] },
]);

const token = computed(() => readToken(store));

async function doSearch(v: string) {
  for (const config of d.value) {
    config.items = [];
  }

  for (const config of d.value) {
    const results = (await config.api(token.value, v)).data;
    results.forEach((o: any) => {
      config.items.push({
        id: o.uuid,
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

function getItemFullText(item: any) {
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
    return `${item.data.name} (${item.data.subdomain})`;
  }
  if (item.type === 'submission') {
    return item.data.title;
  }
  if (item.type === 'answer') {
    return item.data.body;
  }
  return '';
}

function getItemText(item: any) {
  const fullText = getItemFullText(item);
  if (fullText.length > 20) {
    return fullText.substr(0, 40) + '...';
  } else {
    return fullText;
  }
}

function getItemLink(item: any) {
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
  return '';
}

defineExpose({
  doSearch,
});
</script>
