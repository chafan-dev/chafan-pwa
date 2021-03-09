<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-row justify="center" v-else>
        <v-col :class="{'col-8': $vuetify.breakpoint.mdAndUp, 'fixed-narrow-col': isNarrowFeedUI,
                        'less-left-right-padding': !$vuetify.breakpoint.mdAndUp }"  class="mb-12" fluid>
            <v-tabs v-model="currentTabItem" show-arrows
                    :align-with-title="$vuetify.breakpoint.mdAndUp"
                    :fixed-tabs="$vuetify.breakpoint.mdAndUp">
                <v-tabs-slider />
                <v-tab v-for="item in tabItems" :key="item.code" :href="'#' + item.code">
                    {{ item.text }}
                    <span v-if="item.tabExtraCount && site" class="ml-1">
                        ({{item.tabExtraCount(site)}})
                    </span>
                </v-tab>

                <v-tab-item value="questions">
                    <div v-if="questions !== null && questions.length > 0">
                        <QuestionPreview v-for="question in questions" :key="question.uuid"
                                         class="ma-3" :questionPreview="question" />
                    </div>
                    <div class="ma-3 text-center" v-else-if="questions !== null">
                        {{ $t('No questions for now') }}
                    </div>
                    <div class="ma-3 text-center" v-else>
                        {{ $t('Only site members can view its content.') }}
                    </div>
                    <div class="ma-3 text-center" v-if="!userProfile">
                        {{ $t('登录后查看更多') }}
                    </div>
                </v-tab-item>
                <v-tab-item value="submissions">
                    <div v-if="submissions !== null && submissions.length > 0">
                        <SubmissionCard v-for="submission in submissions" :key="submission.uuid"
                                        class="ma-3" :submission="submission" />
                    </div>
                    <div class="ma-3 text-center" v-else-if="submissions !== null">
                        {{ $t('No submissions for now') }}
                    </div>
                    <div class="ma-3 text-center" v-else>
                        {{ $t('Only site members can view its content.') }}
                    </div>
                    <div class="ma-3 text-center" v-if="!userProfile">
                        {{ $t('登录后查看更多') }}
                    </div>
                </v-tab-item>
                <v-tab-item value="members">
                    <div v-if="siteProfiles !== null" class="ma-3">
                        <template v-for="i in Math.floor((this.siteProfiles.length - 1) / memberCols) + 1">
                            <v-row :key="i">
                                <template v-for="j in memberCols">
                                    <v-col :key="(i - 1) * memberCols + (j - 1)">
                                        <UserCard :userPreview="siteProfiles[(i - 1) * memberCols + (j - 1)].owner"
                                                    :compactMode="true"
                                                    v-if="(i - 1) * memberCols + (j - 1) < siteProfiles.length" />
                                        <!-- <div class="text-caption grey--text mt-1">
                                            {{$t('Circle')}} Karma: {{ siteProfiles[(i - 1) * memberCols + (j - 1)].karma }}
                                        </div> -->
                                    </v-col>
                                </template>
                            </v-row>
                        </template>
                    </div>
                    <div class="ma-3 text-center" v-else>
                        {{ $t('Only site members can view its content.') }}
                    </div>
                </v-tab-item>
            </v-tabs>
        </v-col>

        <v-col :class="isNarrowFeedUI ? 'fixed-narrow-sidecol' : 'col-4'" v-if="$vuetify.breakpoint.mdAndUp">
            <SiteCard :site="site"
                      :isMember="siteProfile !== null"
                      :showQuestionEditor="showQuestionEditor"
                      :showSubmissionEditor="showSubmissionEditor" />
        </v-col>
        <v-bottom-sheet v-else>
            <template v-slot:activator="{ on, attrs }">
                <v-btn fab fixed right bottom v-bind="attrs" v-on="on"><InfoIcon /></v-btn>
            </template>
            <v-sheet class="pa-2">
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
import UserCard from '@/components/UserCard.vue';
import QuestionPreview from '@/components/QuestionPreview.vue';
import SubmissionCard from '@/components/SubmissionCard.vue';

import InfoIcon from '@/components/icons/InfoIcon.vue';

import { readNarrowUI, readUserProfile } from '@/store/main/getters';
import { dispatchCaptureApiError } from '@/store/main/actions';

@Component({
    components: { QuestionPreview, SiteCard, UserCard, InfoIcon, SubmissionCard },
})
export default class Site extends Vue {
    get isNarrowFeedUI() {
      return readNarrowUI(this.$store);
    }

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

<style scoped>
.less-left-right-padding {
    padding-left: 6px !important;
    padding-right: 6px !important;
}

/* FIXME: Potential code duplication with Home.vue */
.fixed-narrow-col {
    max-width: 800px;
    padding-left: 0;
    padding-right: 0;
}

.fixed-narrow-sidecol {
    max-width: 400px;
}
</style>