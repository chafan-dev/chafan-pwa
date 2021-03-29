<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <ArticleColumnCard :articleColumn="articleColumn" v-if="articleColumn" />
        <v-skeleton-loader type="card" v-else />

        <div class="ma-2">
          <div class="d-flex">
            <span class="title">{{ $t('文章列表') }}</span>
            <v-spacer />
            <v-btn
              small
              depressed
              color="primary"
              v-if="articleColumn && articleColumn.owner.uuid === userProfile.uuid"
              :to="`/article-editor?articleColumnId=${articleColumn.uuid}`"
              class="mt-2"
            >
              {{ $t('写文章') }}
            </v-btn>
          </div>
          <ul v-if="articles">
            <li v-for="article in articles" :key="article.uuid">
              <a class="text-decoration-none" :href="`/articles/${article.uuid}`">{{
                article.title
              }}</a>
              <v-chip small class="ml-2" v-if="!article.is_published">{{ $t('初稿') }}</v-chip>
            </li>
            <div v-if="!userProfile" class="text-center grey--text">
              {{ $t('登录后查看更多') }}
            </div>
          </ul>
          <v-skeleton-loader type="paragraph" v-else />
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

@Component({
  components: { ArticleColumnCard },
})
export default class ArticleColumn extends Vue {
  private articleColumn: IArticleColumn | null = null;
  private articles: IArticlePreview[] | null = null;

  get id() {
    return this.$router.currentRoute.params.id;
  }

  get userProfile() {
    return readUserProfile(this.$store);
  }

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.articleColumn = (
        await apiArticle.getArticleColumn(this.$store.state.main.token, this.id)
      ).data;
      this.articles = (
        await apiArticle.getArticlesOfColumn(this.$store.state.main.token, this.id)
      ).data;
    });
  }
}
</script>
