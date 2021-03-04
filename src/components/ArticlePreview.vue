<template>
    <v-card :class="{'pa-3': $vuetify.breakpoint.mdAndUp, 'pa-2': $vuetify.breakpoint.smAndDown }">
        <div class="title" style="word-break: normal">
            <a class="text-decoration-none" :href="'/articles/' + articlePreview.uuid">
            {{ articlePreview.title }}
            </a>
        </div>
        <div class="d-flex">
            <span class="grey--text">
                {{ $t('发表于专栏：') }}
                <a class="text-decoration-none"
                   :href="`/article-columns/${articlePreview.article_column.uuid}`">
                   {{ articlePreview.article_column.name }}
                </a>
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
