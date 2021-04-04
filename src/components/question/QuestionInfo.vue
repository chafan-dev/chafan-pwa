<template>
  <div class="pb-2">
    <div class="headline primary--text">{{ $t('问题信息') }}</div>
    <div class="my-2">
      {{ $t('提问者：') }}
      <UserLink :userPreview="question.author"></UserLink>
    </div>
    <div v-if="questionSubscription" class="my-2">
      {{ $t('关注人数：') }} {{ questionSubscription.subscription_count }}
    </div>
    <div v-if="userProfile" class="my-2">
      <v-btn color="primary" depressed small @click="showInviteToAnswerDialog = true"
        >{{ $t('邀请回答') }}
      </v-btn>

      <v-dialog v-model="showInviteToAnswerDialog" max-width="500">
        <v-card>
          <v-card-title primary-title>
            <div class="headline primary--text">{{ $t('邀请回答') }}</div>
          </v-card-title>
          <v-card-text>
            <UserSearch v-model="invitedUserId" />
            <v-slider
              v-model="inviteToAnswerRewardCoinAmount"
              :label="$t('Reward')"
              :tick-labels="[0, 1, 2, 3, 4]"
              class="mt-2"
              max="4"
              min="0"
              step="1"
              thumb-label
              ticks="always"
            />
            <div class="text-caption grey--text">
              {{
                $t(
                  'Reward is the amount of coins rewarded to the invited user when the user published an answer.'
                )
              }}
              {{
                $t(
                  "The coins will be first deducted from your account, and you can reclaim it after the reward expired (if the user doens't post an answer in one week)."
                )
              }}
              {{ $t('You can check all your rewards in ') + $t('Dashboard') }}.
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" depressed small @click="inviteAnswer">{{ $t('提交') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <span v-if="question.view_times" class="text-caption grey--text">
      {{ $t('问题已经被浏览n次', { times: question.view_times }) }}
    </span>
    <template v-if="relatedQuestions">
      <v-divider class="my-2" />
      <RotationList v-slot="{ item }" :items="relatedQuestions" :title="$t('相关问题')">
        <QuestionLink :question-preview="item" />
      </RotationList>
    </template>
  </div>
</template>

<script lang="ts">
import { IQuestion, IQuestionPreview, IUserQuestionSubscription } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import UserSearch from '@/components/UserSearch.vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { commitAddNotification } from '@/store/main/mutations';
import { api } from '@/api';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiSearch } from '@/api/search';
import QuestionLink from '@/components/question/QuestionLink.vue';
import RefreshIcon from '@/components/icons/RefreshIcon.vue';
import RotationList from '@/components/base/RotationList.vue';
import { readUserProfile } from '@/store/main/getters';

@Component({
  components: { RotationList, RefreshIcon, QuestionLink, UserLink, UserSearch },
})
export default class QuestionInfo extends Vue {
  @Prop() public readonly question!: IQuestion;
  @Prop() public readonly questionSubscription!: IUserQuestionSubscription;

  private showInviteToAnswerDialog = false;
  private inviteToAnswerRewardCoinAmount = 0;

  private invitedUserId: string | null = null;
  private relatedQuestions: IQuestionPreview[] | null = null;

  get userProfile() {
    return readUserProfile(this.$store);
  }

  public async mounted() {
    if (this.question.keywords && this.userProfile) {
      this.relatedQuestions = (
        await apiSearch.searchQuestions(
          this.$store.state.main.token,
          this.question.keywords.join(' ')
        )
      ).data;
      const i = this.relatedQuestions?.findIndex((questionPreview) => {
        return questionPreview.uuid === this.question.uuid;
      });
      if (i >= 0) {
        this.relatedQuestions.splice(i, 1);
      }
    }
  }

  public async inviteAnswer() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.invitedUserId !== null) {
        const response = await api.inviteAnswer(
          this.$store.state.main.token,
          this.question.uuid,
          this.invitedUserId
        );
        if (this.inviteToAnswerRewardCoinAmount > 0) {
          await api.createReward(this.$store.state.main.token, {
            expired_after_days: 7,
            receiver_uuid: this.invitedUserId,
            coin_amount: this.inviteToAnswerRewardCoinAmount,
            note_to_receiver: '',
            condition: {
              content: {
                condition_type: 'answered_question',
                question_uuid: this.question.uuid,
              },
            },
          });
        }
        commitAddNotification(this.$store, {
          content: this.$t(response.data.msg).toString(),
          color: 'success',
        });
        this.showInviteToAnswerDialog = false;
      }
    });
  }
}
</script>
