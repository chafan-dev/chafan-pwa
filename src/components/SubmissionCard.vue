<template>
    <!-- TODO: c-card -->
    <v-card class="pa-2">
        <div class="title" style="word-break: normal">
            <RouterLink class="text-decoration-none" :to="'/submissions/' + submission.uuid">
                {{ submission.title }}
            </RouterLink>
        </div>
        <div class="d-flex align-center">
            <RouterLink class="mr-4 d-flex align-center black--text text-caption text-decoration-none"
               :to="'/submissions/' + submission.uuid">
                <UpvoteIcon :color="submission.upvoted ? 'primary' : undefined" small />
                {{ submission.upvotes_count }}
            </RouterLink>
            <RouterLink class="d-flex align-center black--text text-caption text-decoration-none"
               :to="'/submissions/' + submission.uuid">
                <CommentsIcon small class="mr-1 mt-1" />
                {{ submission.comments.length }}
            </RouterLink>
            <v-spacer />
            <div v-if="submission.url">
                <LinkIcon small />
                <RouterLink class="text-decoration-none text-caption" :to="submission.url" target="_blank">
                    {{ shortUrl(submission.url) }}
                </RouterLink>
            </div>
        </div>
        <div class="grey--text subtitle-2" v-if="submission.description">
            {{ shortDesc(submission.description) }}
        </div>
    </v-card>
</template>

<script lang="ts">
import { ISubmission } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import UpvoteIcon from '@/components/icons/UpvoteIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
    components: { SiteBtn, LinkIcon, UpvoteIcon, CommentsIcon },
})
export default class submission extends Vue {
    @Prop() private readonly submission!: ISubmission;

    private shortDesc(d: string) {
        if (d.length > 60) {
            return d.substring(0, 60) + '..';
        } else {
            return d;
        }
    }

    private shortUrl(d: string) {
        if (this.$vuetify.breakpoint.mdAndUp) {
            if (d.length > 40) {
                return d.substring(0, 40) + '..';
            } else {
                return d;
            }
        } else {
            const url = new URL(d);
            return url.protocol + '//' + url.host;
        }
    }
}
</script>
