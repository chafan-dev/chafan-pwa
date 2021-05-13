<template>
  <div class="d-flex d-none">
    <div>
      <v-btn class="primary darken-2 mr-1" depressed small @click="showAskActionDialog = true">
        {{ $t('提问') }}
      </v-btn>

      <v-dialog v-model="showAskActionDialog" max-width="500">
        <CreateQuestionForm :showTitle="true" />
      </v-dialog>
    </div>

    <v-btn class="mr-1" depressed small @click="showArticleActionDialog = true"
      >{{ $t('写文章') }}
    </v-btn>
    <v-dialog v-model="showArticleActionDialog" max-width="500">
      <v-card>
        <v-card-title primary-title>
          <div class="headline primary--text">{{ $t('写文章') }}</div>
        </v-card-title>
        <div class="ma-4 pa-2">
          <v-select
            v-model="newArticleColumnUUID"
            :items="myArticleColumns"
            :label="$t('专栏')"
            item-text="name"
            item-value="uuid"
          />
        </div>
        <v-card-text>
          {{ $t('在「用户中心」中可以创建专栏') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="postNewArticle">{{ $t('创建文章') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn class="mr-1" depressed small @click="showAnswerActionDialog = true"
      >{{ $t('回答') }}
    </v-btn>
    <v-dialog v-model="showAnswerActionDialog" max-width="500">
      <v-sheet class="pa-4">
        <RotationList v-slot="{ item }" :items="questionsToAnswer" :title="$t('等待回答的问题')">
          <QuestionLink :questionPreview="item" />
        </RotationList>
      </v-sheet>
    </v-dialog>

    <v-btn class="mr-1" depressed small @click="showSubmissionActionDialog = true"
      >{{ $t('Share') }}
    </v-btn>
    <v-dialog v-model="showSubmissionActionDialog" max-width="500">
      <CreateSubmissionForm :showTitle="true" />
    </v-dialog>

    <v-btn class="mr-1" depressed small to="/explore">
      {{ $t('探索') }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import { api } from '@/api';
import { apiMe } from '@/api/me';
import { apiDiscovery } from '@/api/discovery';
import { IArticleColumn, IQuestionPreview, IUserSiteProfile } from '@/interfaces';
import QuestionLink from '@/components/question/QuestionLink.vue';
import CreateSubmissionForm from '@/components/CreateSubmissionForm.vue';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { commitAddNotification } from '@/store/main/mutations';
import { Component, Vue } from 'vue-property-decorator';
import RotationList from '@/components/base/RotationList.vue';
import { readToken } from '@/store/main/getters';

@Component({
  components: { RotationList, QuestionLink, CreateSubmissionForm, CreateQuestionForm },
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
      const token = readToken(this.$store);
      if (token) {
        this.siteProfiles = (await apiMe.getUserSiteProfiles(token)).data;
        this.myArticleColumns = (await api.getMyArticleColumns(token)).data;
      }
      this.questionsToAnswer = (await apiDiscovery.getPendingQuestions(token)).data;
    });
  }

  private async postNewArticle() {
    if (this.newArticleColumnUUID) {
      this.$router.push(`/article-editor?articleColumnId=${this.newArticleColumnUUID}`);
    } else {
      commitAddNotification(this.$store, {
        content:
          this.$t('请选择一个专栏发布文章').toString() +
          ', ' +
          this.$t('在「用户中心」中可以创建专栏').toString(),
        color: 'info',
      });
    }
  }
}
</script>
