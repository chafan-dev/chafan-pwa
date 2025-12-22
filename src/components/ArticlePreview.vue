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
      class="grey--text text-body-2 mb-1"
    >
      {{ shortBodyText }}
    </div>
    <div v-if="showColumnName" class="d-flex">
      <span class="grey--text text-caption">
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

<script setup lang="ts">
import { computed } from 'vue';
import { IArticlePreview } from '@/interfaces';

const props = withDefaults(
  defineProps<{
    articlePreview: IArticlePreview;
    showColumnName?: boolean;
  }>(),
  {
    showColumnName: true,
  }
);

const shortBodyText = computed(() => {
  const d = props.articlePreview.body_text!;
  if (d.length > 40) {
    return d.substring(0, 40) + '..';
  } else {
    return d;
  }
});
</script>
