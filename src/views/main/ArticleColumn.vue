<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <ArticleColumnCard v-if="articleColumn" :articleColumn="articleColumn" />
        <v-skeleton-loader v-else type="card" />

        <div class="ma-2">
          <div class="d-flex">
            <span class="title">{{ $t('文章列表') }}</span>
            <v-spacer />
            <v-btn
              v-if="articleColumn && userProfile && articleColumn.owner.uuid === userProfile.uuid"
              :to="`/article-editor?articleColumnId=${articleColumn.uuid}`"
              class="mt-2"
              color="primary"
              depressed
              small
            >
              {{ $t('写文章') }}
            </v-btn>
          </div>
          <ul v-if="articles">
            <li v-for="article in articles" :key="article.uuid">
              <router-link :to="`/articles/${article.uuid}`" class="text-decoration-none"
                >{{ article.title }}
              </router-link>
              <v-chip v-if="!article.is_published" class="ml-2" small>{{ $t('初稿') }}</v-chip>
            </li>
          </ul>
          <div v-if="!userProfile" class="text-center grey--text">
            <v-skeleton-loader type="paragraph" boilerplate />
            {{ $t('登录后查看更多') }}
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { apiArticle } from '@/api/article';
import { IArticleColumn, IArticlePreview } from '@/interfaces';
import ArticleColumnCard from '@/components/ArticleColumnCard.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { readUserProfile } from '@/store/main/getters';
import { Route, RouteRecord } from 'vue-router';
import { isEqual } from '@/common';

@Component({
  components: { ArticleColumnCard },
})
export default class ArticleColumn extends Vue {
  private articleColumn: IArticleColumn | null = null;
  private articles: IArticlePreview[] | null = null;

  get id() {
    return this.$route.params.id;
  }

  get userProfile() {
    return readUserProfile(this.$store);
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
