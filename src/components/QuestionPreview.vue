<template>
    <!-- TODO: c-card -->
    <v-card class="pa-2">
        <div class="title" style="word-break: normal">
            <RouterLink class="text-decoration-none" :to="'/questions/' + questionPreview.uuid">
            {{ questionPreview.title }}
            </RouterLink>
        </div>
        <div class="grey--text subtitle-2" v-if="questionPreview.description">
            {{ shortDesc(questionPreview.description) }}
        </div>
        <div class="d-flex">
            <div :class="{'mr-2': $vuetify.breakpoint.mobile, 'mr-6': !$vuetify.breakpoint.mobile }">
                <CommentsIcon class="mr-1" small />
                <span class="text-caption" v-if="!$vuetify.breakpoint.mobile">
                    {{$t('n条评论', { n: questionPreview.comments_count })}}</span>
                <span class="text-caption" v-else>{{questionPreview.comments_count}}</span>
            </div>
            <div>
                <AnswerIcon class="mr-1" small />
                <span class="text-caption" v-if="!$vuetify.breakpoint.mobile">
                    {{$t('n个回答', { n: questionPreview.answers_count })}}</span>
                <span class="text-caption" v-else>{{questionPreview.answers_count}}</span>
            </div>
        </div>
    </v-card>
</template>

<script lang="ts">
import { IQuestionPreview } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';

import AnswerIcon from '@/components/icons/AnswerIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';

@Component({
    components: { SiteBtn, AnswerIcon, CommentsIcon },
})
export default class QuestionPreview extends Vue {
    @Prop() public readonly questionPreview!: IQuestionPreview;

    public shortDesc(d: string) {
        if (d.length > 60) {
            return d.substring(0, 60) + '..';
        } else {
            return d;
        }
    }
}
</script>
