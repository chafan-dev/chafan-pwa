<template>
    <v-card flat >
        <div class="title" style="word-break: normal">
            <RouterLink class="text-decoration-none" :to="'/articles/' + articlePreview.uuid">
            {{ articlePreview.title }}
            </RouterLink>
        </div>
        <div class="d-flex">
            <span class="grey--text">
                {{ $t('发表于专栏：') }}
                <RouterLink class="text-decoration-none"
                   :to="`/article-columns/${articlePreview.article_column.uuid}`">
                   {{ articlePreview.article_column.name }}
                </RouterLink>
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
}
</script>
