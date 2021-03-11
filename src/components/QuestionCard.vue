<template>
  <div>
    <v-card-title primary-title>
      <div class="headline primary--text">{{ $t('问题信息') }}</div>
    </v-card-title>
    <v-row class="ml-1" v-if="question">
      <v-col>
        <div class="ma-2">
          {{ $t('提问者：') }}
          <UserLink :userPreview="question.author"></UserLink>
        </div>
        <div class="ma-2" v-if="questionSubscription">
          {{ $t('关注人数：') }} {{ questionSubscription.subscription_count }}
        </div>
        <v-row class="ma-2" v-if="myToken">
          <v-btn depressed small color="primary" @click="showInviteToAnswerDialog = true">{{
            $t('邀请回答')
          }}</v-btn>

          <v-dialog max-width="500" v-model="showInviteToAnswerDialog">
            <v-card>
              <v-card-title primary-title>
                <div class="headline primary--text">{{ $t('邀请回答') }}</div>
              </v-card-title>
              <v-card-text>
                <UserSearch :token="myToken" v-model="invitedUserId" />
                <v-slider
                  :label="$t('Reward')"
                  v-model="inviteToAnswerRewardCoinAmount"
                  class="mt-2"
                  :tick-labels="[0, 1, 2, 3, 4]"
                  step="1"
                  min="0"
                  max="4"
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
                <v-btn depressed small @click="inviteAnswer" color="primary">{{
                  $t('提交')
                }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
        <span class="text-caption grey--text ml-2" v-if="question.view_times">
          {{ $t('问题已经被浏览n次', { times: question.view_times }) }}
        </span>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { IQuestion, ISite, IUserQuestionSubscription } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import UserSearch from '@/components/UserSearch.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { commitAddNotification } from '@/store/main/mutations';
import { api } from '@/api';
import { dispatchCaptureApiError } from '@/store/main/actions';

@Component({
  components: { UserLink, UserSearch },
})
export default class QuestionCard extends Vue {
  @Prop() public readonly site!: ISite;
  @Prop() public readonly question!: IQuestion;
  @Prop() public readonly questionSubscription!: IUserQuestionSubscription;

  private showInviteToAnswerDialog = false;
  private inviteToAnswerRewardCoinAmount = 0;

  private invitedUserId: string | null = null;
  private myToken: string | null = null;
  public async mounted() {
    this.myToken = this.$store.state.main.token;
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
