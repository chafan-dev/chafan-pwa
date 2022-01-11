<template>
  <div class="d-flex">
    <div>
      <v-btn class="primary darken-2 mr-1" depressed small @click="showAskActionDialog = true">
        提问
      </v-btn>

      <v-dialog v-model="showAskActionDialog" max-width="500">
        <CreateQuestionForm :showTitle="true" />
      </v-dialog>
    </div>

    <v-btn class="mr-1" depressed small @click="showArticleActionDialog = true">写文章</v-btn>
    <v-dialog v-model="showArticleActionDialog" max-width="500">
      <v-card>
        <v-card-title primary-title>
          <div class="headline primary--text">写文章</div>
          <v-spacer />
          <CloseIcon @click="showArticleActionDialog = false" />
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="newArticleColumnUUID"
            :items="myArticleColumns"
            label="选择专栏"
            item-text="name"
            item-value="uuid"
            hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <CreateArticleColumn
            class="mr-2"
            :on-new-article-column="
              (a) => {
                myArticleColumns.push(a);
                newArticleColumnUUID = a.uuid;
              }
            "
          />
          <v-btn color="primary" depressed small @click="postNewArticle">开始写作</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn class="mr-1" depressed small @click="showAnswerActionDialog = true"> 回答</v-btn>
    <v-dialog v-model="showAnswerActionDialog" max-width="500">
      <v-sheet class="pa-4">
        <RotationList v-slot="{ item }" :items="questionsToAnswer" title="等待回答的问题">
          <QuestionLink :questionPreview="item" />
        </RotationList>
      </v-sheet>
    </v-dialog>

    <v-btn class="mr-1" depressed small @click="showSubmissionActionDialog = true">新分享</v-btn>
    <v-dialog v-model="showSubmissionActionDialog" max-width="500">
      <CreateSubmissionForm :showTitle="true" />
    </v-dialog>

    <v-btn class="mr-1" depressed small to="/explore"> 探索</v-btn>
  </div>
</template>

<script lang="ts">
import { api } from '@/api';
import { apiDiscovery } from '@/api/discovery';
import { IArticleColumn, IQuestionPreview } from '@/interfaces';
import QuestionLink from '@/components/question/QuestionLink.vue';
import CreateSubmissionForm from '@/components/CreateSubmissionForm.vue';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { commitAddNotification } from '@/store/main/mutations';
import { Component } from 'vue-property-decorator';
import RotationList from '@/components/base/RotationList.vue';
import { CVue } from '@/common';
import CreateArticleColumn from '@/views/main/CreateArticleColumn.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';

@Component({
  components: {
    CloseIcon,
    CreateArticleColumn,
    RotationList,
    QuestionLink,
    CreateSubmissionForm,
    CreateQuestionForm,
  },
})
export default class NewContentActionBar extends CVue {
  private questionsToAnswer: IQuestionPreview[] = [];

  private showAskActionDialog = false;
  private showArticleActionDialog = false;
  private showAnswerActionDialog = false;
  private showSubmissionActionDialog = false;

  private myArticleColumns: IArticleColumn[] = [];
  private newArticleColumnUUID: string | null = null;

  public async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.token) {
        this.myArticleColumns = (await api.getMyArticleColumns(this.token)).data;
        this.questionsToAnswer = (await apiDiscovery.getPendingQuestions(this.token)).data;
      }
    });
  }

  private async postNewArticle() {
    if (this.newArticleColumnUUID) {
      await this.$router.push(`/article-editor?articleColumnId=${this.newArticleColumnUUID}`);
    } else {
      commitAddNotification(this.$store, {
        content: '请选择一个专栏发布文章，在「用户中心」中可以创建专栏',
        color: 'info',
      });
    }
  }
}
</script>
