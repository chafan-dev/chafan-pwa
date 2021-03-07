<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-row justify="center" v-else >
        <v-col :class="{'col-6': $vuetify.breakpoint.mdAndUp }" fluid>
            <v-tabs v-model="currentTabItem" show-arrows>
                <v-tabs-slider />
                <v-tab v-for="item in tabItems" :key="item.code" :href="'#' + item.code">
                    {{ item.text }}
                    <span v-if="item.tabExtraCount && site" class="ml-1">
                        ({{item.tabExtraCount(site)}})
                    </span>
                </v-tab>
            </v-tabs>

            <v-tabs-items v-model="currentTabItem" class="pa-2">
                <div v-if="currentTabItem === 'questions'">
                    <div v-if="questions !== null && questions.length > 0">
                        <QuestionPreview v-for="question in questions" :key="question.uuid"
                                         class="ma-2" :questionPreview="question" />
                    </div>
                    <div v-else-if="questions !== null">
                        {{ $t('No questions for now') }}
                    </div>
                    <div v-else>
                        {{ $t('Only site members can view its content.') }}
                    </div>
                    <div v-if="!userProfile" class="text-center grey--text">
                        {{ $t('登录后查看更多') }}
                    </div>
                </div>
                <div v-if="currentTabItem === 'submissions'">
                    <div v-if="submissions !== null && submissions.length > 0">
                        <SubmissionCard v-for="submission in submissions" :key="submission.uuid"
                                        class="ma-2" :submission="submission" />
                    </div>
                    <div v-else-if="submissions !== null">
                        {{ $t('No submissions for now') }}
                    </div>
                    <div v-else>
                        {{ $t('Only site members can view its content.') }}
                    </div>
                    <div v-if="!userProfile" class="text-center grey--text">
                        {{ $t('登录后查看更多') }}
                    </div>
                </div>
                <div v-if="currentTabItem === 'members'">
                    <div v-if="siteProfiles !== null">
                        <template v-for="i in Math.floor((this.siteProfiles.length - 1) / memberCols) + 1">
                            <v-row :key="i">
                                <template v-for="j in memberCols">
                                    <v-col :key="(i - 1) * memberCols + (j - 1)">
                                        <v-card class="pa-2" v-if="(i - 1) * memberCols + (j - 1) < siteProfiles.length">
                                            <UserLink :userPreview="siteProfiles[(i - 1) * memberCols + (j - 1)].owner"
                                                      :showAvatar="true" />
                                            <div class="text-caption grey--text mt-1">
                                                {{$t('Circle')}} Karma: {{ siteProfiles[(i - 1) * memberCols + (j - 1)].karma }}
                                            </div>
                                        </v-card>
                                    </v-col>
                                </template>
                            </v-row>
                        </template>
                    </div>
                    <div v-else>
                        {{ $t('Only site members can view its content.') }}
                    </div>
                </div>
            </v-tabs-items>
        </v-col>

        <v-col class="col-4" v-if="$vuetify.breakpoint.mdAndUp">
            <SiteCard :site="site"
                      :isMember="siteProfile !== null"
                      :showQuestionEditor="showQuestionEditor"
                      :showSubmissionEditor="showSubmissionEditor" />
        </v-col>
        <v-bottom-sheet v-else>
            <template v-slot:activator="{ on, attrs }">
                <v-btn fab fixed right bottom v-bind="attrs" v-on="on"><InfoIcon /></v-btn>
            </template>
            <v-sheet>
                <SiteCard :site="site"
                          :isMember="siteProfile !== null"
                          :showQuestionEditor="showQuestionEditor"
                          :showSubmissionEditor="showSubmissionEditor" />
            </v-sheet>
        </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { api } from '@/api';
import { IUserProfile, ISite, IUserSiteProfile, IQuestionPreview, ISubmission } from '@/interfaces';

import SiteCard from '@/components/SiteCard.vue';
import UserLink from '@/components/UserLink.vue';
import QuestionPreview from '@/components/QuestionPreview.vue';
import SubmissionCard from '@/components/SubmissionCard.vue';

import InfoIcon from '@/components/icons/InfoIcon.vue';

import { readUserProfile } from '@/store/main/getters';
import { dispatchCaptureApiError } from '@/store/main/actions';

@Component({
    components: { QuestionPreview, SiteCard, UserLink, InfoIcon, SubmissionCard },
})
export default class Site extends Vue {
    private questions: IQuestionPreview[] | null = null;
    private readonly memberCols = this.$vuetify.breakpoint.mdAndUp ? 3 : 2;

    private showComments: boolean = false;
    private site: ISite | null = null;
    private userProfile: IUserProfile | null = null;
    private siteProfile: IUserSiteProfile | null = null;
    private siteProfiles: IUserSiteProfile[] | null = null;
    private submissions: ISubmission[] | null = [];
    private showQuestionEditor = false;
    private showSubmissionEditor = false;

    private tabItems = [
        {
            code: 'questions',
            text: this.$t('Questions'),
            tabExtraCount: (site: ISite) => site.questions_count,
        },
        {
            code: 'submissions',
            text: this.$t('Sharings'),
            tabExtraCount: (site: ISite) => site.submissions_count,
        },
        {
            code: 'members',
            text: this.$t('Members'),
            tabExtraCount: (site: ISite) => site.members_count,
        },
    ];

    get currentTabItem() {
        return this.$route.query.tab ? this.$route.query.tab : 'questions';
    }

    set currentTabItem(tab) {
        if (tab !== 'questions') {
            this.$router.replace({ query: { ...this.$route.query, tab }});
        } else {
            this.$router.replace({ query: { ...this.$route.query, tab: undefined }});
        }
    }

    private loading = true;

    get token() { return this.$store.state.main.token; }

    public async mounted() {
        await dispatchCaptureApiError(this.$store, async () => {
            this.userProfile = readUserProfile(this.$store);
            this.site = (await api.getSite(this.token, this.$router.currentRoute.params.subdomain)).data;

            if (this.userProfile) {
                this.siteProfile = (await api.getUserSiteProfile(
                    this.token, this.site.uuid, this.userProfile.uuid)).data;
            }

            if (this.siteProfile !== null || this.site.public_readable) {
                const response = await api.getSiteQuestions(this.token, this.site.uuid);
                if (response) {
                    this.questions = response.data.sort((a, b) => {
                        if (a.is_placed_at_site_top) {
                            return -1;
                        }
                        if (b.is_placed_at_site_top) {
                            return 1;
                        }
                        if (this.$dayjs.utc(a.created_at) > this.$dayjs.utc(b.created_at)) {
                            return -1;
                        } else {
                            return 1;
                        }
                    });
                }
                if (this.siteProfile) {
                    this.siteProfiles = (await api.getSiteProfiles(this.token, this.site.uuid)).data.sort((a, b) => {
                        if (a.karma > b.karma) {
                            return -1;
                        }
                        return 1;
                    });
                }
                this.submissions = (await api.getSiteSubmissions(this.token, this.site.uuid)).data;
            }
            if (this.siteProfile !== null || this.site.public_writable_question) {
                this.showQuestionEditor = true;
            }
            if (this.siteProfile !== null || this.site.public_writable_submission) {
                this.showSubmissionEditor = true;
            }
            this.loading = false;
        });
    }
}
</script>
