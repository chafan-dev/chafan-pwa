<template>
  <div class="pb-2">
    <div class="headline primary--text">问题信息</div>
    <div class="my-2">
      提问者：
      <UserLink :userPreview="question.author"></UserLink>
    </div>
    <div v-if="questionSubscription" class="my-2">
      关注人数：{{ questionSubscription.subscription_count }}
    </div>
    <div v-if="userProfile" class="my-2">
      <v-btn color="primary" depressed small @click="showInviteToAnswerDialog = true">
        邀请回答
      </v-btn>

      <v-dialog v-model="showInviteToAnswerDialog" max-width="500">
        <v-card>
          <v-card-title primary-title>
            <div class="headline primary--text">邀请回答</div>
          </v-card-title>
          <v-card-text>
            <UserSearch v-model="invitedUserId" :return-self="false" />
            <v-slider
              v-model="inviteToAnswerRewardCoinAmount"
              :tick-labels="[0, 1, 2, 3, 4]"
              class="mt-2"
              label="硬币奖励数量"
              max="4"
              min="0"
              step="1"
              thumb-label
              ticks="always"
            />
            <div class="text-caption grey--text">
              当你邀请的用户回答问题后，该用户会收到指定数额的硬币作为奖励，
              这部分硬币会先从你的账户扣除。如果被邀请的用户没有在奖励失效前（一周）回答问题的话，你可以将预扣取的硬币拿回。
              <router-link class="text-decoration-none" to="/dashboard?tab=coins"
                >查看你的收到/发出的所有奖励
              </router-link>
              。
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" depressed small @click="inviteAnswer">确认</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <span v-if="question.view_times" class="text-caption grey--text">
      问题已经被浏览{{ question.view_times }}次
    </span>
    <template v-if="relatedQuestions">
      <v-divider class="my-2" />
      <RotationList v-slot="{ item }" :items="relatedQuestions" title="相关问题">
        <QuestionLink :question-preview="item" />
      </RotationList>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IQuestion, IQuestionPreview, IUserQuestionSubscription } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import UserSearch from '@/components/UserSearch.vue';
import { api } from '@/api';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiSearch } from '@/api/search';
import QuestionLink from '@/components/question/QuestionLink.vue';
import RotationList from '@/components/base/RotationList.vue';
import { useAuth, useNotification } from '@/composables';
import store from '@/store';

const props = defineProps<{
  question: IQuestion;
  questionSubscription: IUserQuestionSubscription;
}>();

const { token, userProfile } = useAuth();
const { expectOkAndCommitMsg } = useNotification();

const showInviteToAnswerDialog = ref(false);
const inviteToAnswerRewardCoinAmount = ref(0);
const invitedUserId = ref<string | null>(null);
const relatedQuestions = ref<IQuestionPreview[] | null>(null);

onMounted(async () => {
  if (userProfile.value) {
    const query = props.question.keywords ? props.question.keywords.join(' ') : props.question.title;
    const qs = (await apiSearch.searchQuestions(token.value, query)).data;
    relatedQuestions.value = qs.filter((q) => {
      return q.uuid !== props.question.uuid;
    });
  }
});

async function inviteAnswer() {
  await dispatchCaptureApiError(store, async () => {
    if (invitedUserId.value !== null) {
      const response = await api.inviteAnswer(token.value, props.question.uuid, invitedUserId.value);
      if (inviteToAnswerRewardCoinAmount.value > 0) {
        await api.createReward(token.value, {
          expired_after_days: 7,
          receiver_uuid: invitedUserId.value,
          coin_amount: inviteToAnswerRewardCoinAmount.value,
          note_to_receiver: '',
          condition: {
            content: {
              condition_type: 'answered_question',
              question_uuid: props.question.uuid,
            },
          },
        });
      }
      expectOkAndCommitMsg(response.data, '已邀请');
      showInviteToAnswerDialog.value = false;
    }
  });
}
</script>
