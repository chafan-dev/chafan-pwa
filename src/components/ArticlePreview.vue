<template>
  <div class="pa-2">
    <v-chip v-if="!articlePreview.is_published" class="ml-2" small>初稿</v-chip>
    <div class="title" style="word-break: normal">
      <router-link :to="'/articles/' + articlePreview.uuid" class="text-decoration-none">
        {{ articlePreview.title }}
      </router-link>
    </div>
    <div
      v-if="articlePreview.body_text && articlePreview.body_text.trim()"
      class="grey--text subtitle-2"
    >
      {{ shortBodyText }}
    </div>
    <div class="d-flex" v-if="showColumnName">
      <span class="grey--text">
        发表于专栏：
        <router-link
          :to="`/article-columns/${articlePreview.article_column.uuid}`"
          class="text-decoration-none"
        >
          {{ articlePreview.article_column.name }}
        </router-link>
      </span>
    </div>
  </div>
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
  @Prop({ default: true }) public readonly showColumnName!: boolean;

  get shortBodyText() {
    const d = this.articlePreview.body_text!;
    if (d.length > 40) {
      return d.substring(0, 40) + '..';
    } else {
      return d;
    }
  }
}
</script>
