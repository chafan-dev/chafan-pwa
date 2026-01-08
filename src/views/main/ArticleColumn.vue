<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': isDesktop }">
        <ArticleColumnCard v-if="articleColumn" :articleColumn="articleColumn" />
        <v-skeleton-loader v-else type="card" />
        <v-divider class="my-1 mx-2" />
        <div>
          <v-skeleton-loader type="list-item-three-line" v-if="loading" />
          <template v-else>
            <div v-if="articles.length">
              <ArticlePreview
                v-for="article in articles"
                :key="article.uuid"
                :article-preview="article"
                :show-column-name="false"
              />
            </div>
            <EmptyPlaceholder v-else />
          </template>
          <div v-if="!loggedIn" class="text-center grey--text">登录后查看更多</div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import store from '@/store';
import { useRoute } from '@/router';
import { apiArticle } from '@/api/article';
import { IArticleColumn, IArticlePreview } from '@/interfaces';
import ArticleColumnCard from '@/components/ArticleColumnCard.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import { useAuth, useResponsive } from '@/composables';

const route = useRoute();
const { token, loggedIn } = useAuth();
const { isDesktop } = useResponsive();

const articleColumn = ref<IArticleColumn | null>(null);
const articles = ref<IArticlePreview[] | null>(null);
const loading = ref(true);

const id = computed(() => route.params.id as string);

async function load() {
  await dispatchCaptureApiError(store, async () => {
    articleColumn.value = (await apiArticle.getArticleColumn(token.value, id.value)).data;
    articles.value = (await apiArticle.getArticlesOfColumn(token.value, id.value)).data;
    loading.value = false;
  });
}

// Watch for route param changes (replaces beforeRouteUpdate)
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId && route.name === 'article-column') {
    loading.value = true;
    load();
  }
});

onMounted(async () => {
  await load();
});
</script>
