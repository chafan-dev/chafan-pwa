<template>
  <v-card :class="{ 'c-card': !embedded }" :flat="embedded" class="pa-2">
    <div class="title" style="word-break: normal">
      <router-link :to="'/articles/' + articlePreview.uuid" class="text-decoration-none">
        {{ articlePreview.title }}
      </router-link>
    </div>
    <div class="d-flex">
      <span class="grey--text">
        {{ $t('发表于专栏：') }}
        <router-link
          :to="`/article-columns/${articlePreview.article_column.uuid}`"
          class="text-decoration-none"
        >
          {{ articlePreview.article_column.name }}
        </router-link>
      </span>
    </div>
  </v-card>
</template>

<script lang="ts">
import { IArticlePreview } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ArticlePreview extends Vue {
  @Prop() public readonly articlePreview!: IArticlePreview;
  @Prop({ default: false }) private readonly embedded!: false;
}
</script>

<style scoped>
/* FIXME: code duplicate: Home.vue */
.c-card {
  box-shadow: 0 5px 10px -10px rgba(85, 85, 85, 0.08), 0 10px 20px 0 rgba(85, 85, 85, 0.06),
    0 15px 30px 0 rgba(85, 85, 85, 0.03) !important;
}
</style>
