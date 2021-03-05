<template>
    <div class="d-flex d-none">
      <div>
        <v-btn small depressed class="primary darken-2 mr-1" @click="showAskActionDialog = true">
          {{$t('提问')}}
        </v-btn>

        <v-dialog max-width="500" v-model="showAskActionDialog">
          <CreateQuestionForm :showTitle="true" />
        </v-dialog>
      </div>

        <v-btn small depressed class="mr-1" @click="showArticleActionDialog = true">{{$t('写文章')}}</v-btn>
        <v-dialog max-width="500" v-model="showArticleActionDialog">
            <v-card>
                <v-card-title primary-title>
                    <div class="headline primary--text">{{$t('写文章')}}</div>
                </v-card-title>
            <div class="ma-4 pa-2">
                <v-select :label="$t('专栏')" :items="myArticleColumns"
                          item-text="name" item-value="uuid" v-model="newArticleColumnUUID" />
            </div>
            <v-card-text>
                {{$t('在「用户中心」中可以创建专栏')}}
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="postNewArticle">{{$t('创建文章')}}</v-btn>
            </v-card-actions>
            </v-card>
        </v-dialog>

        <v-btn small depressed class="mr-1" @click="showAnswerActionDialog = true">{{$t('回答')}}</v-btn>
        <v-dialog max-width="500" v-model="showAnswerActionDialog">
            <v-card>
                <v-card-title primary-title>
                    <div class="headline primary--text">{{$t('等待回答的问题')}}</div>
                </v-card-title>
                <v-card-text>
                    <ul>
                        <li v-for="question in questionsToAnswer" :key="question.uuid">
                            <QuestionLink :questionPreview="question" />
                        </li>
                    </ul>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-btn small depressed class="mr-1" @click="showSubmissionActionDialog = true">{{$t('Share')}}</v-btn>
        <v-dialog max-width="500" v-model="showSubmissionActionDialog">
            <CreateSubmissionForm :showTitle="true" />
        </v-dialog>
    </div>
</template>


<script lang="ts">
import { api } from '@/api';
import { apiMe } from '@/api/me';
import { IArticleColumn, IQuestionPreview, IUserSiteProfile } from '@/interfaces';
import QuestionLink from '@/components/QuestionLink.vue';
import CreateSubmissionForm from '@/components/CreateSubmissionForm.vue';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { commitAddNotification } from '@/store/main/mutations';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: { QuestionLink, CreateSubmissionForm, CreateQuestionForm },
})
export default class NewContentActionBar extends Vue {
    private questionsToAnswer: IQuestionPreview[] = [];

    private showAskActionDialog = false;
    private showArticleActionDialog = false;
    private showAnswerActionDialog = false;
    private showSubmissionActionDialog = false;

    private myArticleColumns: IArticleColumn[] = [];
    private newArticleColumnUUID: string | null = null;
    private siteProfiles: IUserSiteProfile[] = [];

    public async mounted() {
        await dispatchCaptureApiError(this.$store, async () => {
            const token = this.$store.state.main.token;
            if (token) {
                this.siteProfiles = (await apiMe.getUserSiteProfiles(token)).data;
                this.myArticleColumns = (await api.getMyArticleColumns(token)).data;
            }
            this.questionsToAnswer = (await apiMe.getPendingQuestions(token)).data;
        });
    }

    private async postNewArticle() {
        if (this.newArticleColumnUUID) {
            this.$router.push(`/article-focus?articleColumnId=${this.newArticleColumnUUID}`);
        } else {
            commitAddNotification(this.$store, {
                content: this.$t('请选择一个专栏发布文章').toString() + ', ' + this.$t('在「用户中心」中可以创建专栏').toString(),
                color: 'info',
            });
        }
    }
}
</script>
<style scoped>
.slim-btn {
    padding: 3 0 !important;
}
</style>