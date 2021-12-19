<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': isDesktop }" fluid>
        <ArticleColumnCard v-if="articleColumn" :articleColumn="articleColumn" />
        <v-skeleton-loader v-else type="card" />
        <v-divider class="my-1 mx-2" />
        <div>
          <template v-if="articles !== null">
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

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { apiArticle } from '@/api/article';
import { IArticleColumn, IArticlePreview } from '@/interfaces';
import ArticleColumnCard from '@/components/ArticleColumnCard.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { Route, RouteRecord } from 'vue-router';
import { CVue, isEqual } from '@/common';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';

@Component({
  components: { ArticlePreview, EmptyPlaceholder, ArticleColumnCard },
})
export default class ArticleColumn extends CVue {
  private articleColumn: IArticleColumn | null = null;
  private articles: IArticlePreview[] | null = null;

  get id() {
    return this.$route.params.id;
  }

  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'article-column');
    if (matched && !isEqual(to.params, from.params)) {
      this.load();
    }
  }

  private async load() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.articleColumn = (
        await apiArticle.getArticleColumn(this.$store.state.main.token, this.id)
      ).data;
      this.articles = (
        await apiArticle.getArticlesOfColumn(this.$store.state.main.token, this.id)
      ).data;
    });
  }

  private async mounted() {
    await this.load();
  }
}
</script>
