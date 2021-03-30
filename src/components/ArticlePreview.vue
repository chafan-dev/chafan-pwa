<template>
  <v-card class="pa-2" :class="{ 'c-card': !embedded }" :flat="embedded">
    <div class="title" style="word-break: normal">
      <router-link class="text-decoration-none" :to="'/articles/' + articlePreview.uuid">
        {{ articlePreview.title }}
      </router-link>
    </div>
    <div class="d-flex">
      <span class="grey--text">
        {{ $t('发表于专栏：') }}
        <router-link
          class="text-decoration-none"
          :to="`/article-columns/${articlePreview.article_column.uuid}`"
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
  @Prop({ default: false }) private readonly embedded!: false;
  @Prop() public readonly articlePreview!: IArticlePreview;
}
</script>

<style scoped>
/* FIXME: code duplicate: Home.vue */
.c-card {
  box-shadow: 0 5px 10px -10px rgba(85, 85, 85, 0.08), 0 10px 20px 0 rgba(85, 85, 85, 0.06),
    0 15px 30px 0 rgba(85, 85, 85, 0.03) !important;
}
</style>
