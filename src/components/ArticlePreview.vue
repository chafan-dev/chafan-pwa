<template>
  <base-card :embedded="embedded">
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
  </base-card>
</template>

<script lang="ts">
import { IArticlePreview } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';
import BaseCard from '@/components/base/BaseCard.vue';

@Component({
  components: { BaseCard },
})
export default class ArticlePreview extends Vue {
  @Prop() public readonly articlePreview!: IArticlePreview;
  @Prop({ default: false }) private readonly embedded!: false;
}
</script>
