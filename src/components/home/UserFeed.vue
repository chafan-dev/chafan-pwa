<template>
  <div>
    <user-welcome
      class="mx-4"
      v-if="showExploreSites"
      v-on:on-close-explore-sites="onCloseExploreSites()"
    />
    <div class="mx-4 my-2 text-center" v-if="isRandomActivities">
      信息流预览（关注更多的人或加入更多圈子来定制自己的信息流）
    </div>
    <EmptyPlaceholder v-if="showEmptyPlaceholder" />

    <div>
      <v-expand-transition>
        <div v-show="loadingActivities" class="text-center">
          <v-progress-circular color="primary" indeterminate size="20" />
        </div>
      </v-expand-transition>

      <v-dialog v-model="usersDialog" max-width="600">
        <v-card class="pt-6">
          <v-card-text>
            <v-lazy>
              <UserGrid :users="usersInDialog" />
            </v-lazy>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn depressed primary small @click="usersDialog = false">隐藏</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <div
        v-for="activity in combinedActivities.items"
        :key="activity.id"
        :class="theme.feed.activityCard.classes"
      >
        <DebugSpan>id={{ activity.id }}</DebugSpan>
        <!-- Row for top info -->
        <v-row justify="space-between" no-gutters>
          <!-- Column for subject and verb -->
          <div>
            <ActivitySubject :activity="activity" />
            <span :class="theme.feed.activityCard.verb.classes">
              {{ activityVerbCN(activity.verb) }}
            </span>
          </div>
          <div>
            <span class="text-caption grey--text mr-1">{{ fromNow(activity.created_at) }}</span>
            <v-menu v-if="activity.origins && activity.origins.length" offset-y>
              <template v-slot:activator="{ on, attrs }">
                <DotsIcon v-bind="attrs" v-on="on" small />
              </template>
              <v-list>
                <!-- block origin actions -->
                <template v-if="activity.origins">
                  <v-list-item
                    v-for="(origin, idx) in activity.origins"
                    :key="idx"
                    dense
                    @click="blockOrigin(origin)"
                  >
                    <v-list-item-icon>
                      <CloseIcon />
                    </v-list-item-icon>
                    <v-list-item-content class="text-caption">
                      <span
                        >减少
                        <template v-if="origin.origin_type === 'site'">
                          「<SiteName :subdomain="origin.subdomain" />」圈子
                        </template>
                        的推送
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </v-menu>
          </div>
        </v-row>

        <!-- Row for content preview if any -->
        <div>
          <div v-if="activity.verb === 'follow_user'">
            <template v-if="activity.event.content.users">
              <UserCard
                :compactMode="true"
                :infeed="true"
                :userPreview="activity.event.content.users[0]"
              />
              <a
                class="text-decoration-none"
                @click="showUsersDialogFn(activity.event.content.users)"
              >
                等{{ activity.event.content.users.length }}人
              </a>
            </template>
            <UserCard
              v-else
              :compactMode="true"
              :infeed="true"
              :userPreview="activity.event.content.user"
            />
          </div>

          <div v-if="activity.verb === 'follow_article_column'">
            <ArticleColumnCard
              :articleColumn="activity.event.content.article_column"
              :compactMode="true"
            />
          </div>

          <div v-if="activity.verb === 'upvote_answer'">
            <Answer :answerPreview="activity.event.content.answer" />
          </div>
          <div v-if="activity.verb === 'upvote_question'">
            <QuestionPreview :questionPreview="activity.event.content.question" />
          </div>
          <div v-else-if="activity.verb === 'upvote_submission'">
            <SubmissionPreview :submission="activity.event.content.submission" />
          </div>
          <div v-else-if="activity.verb === 'comment_question'">
            <CommentCard
              :comment="activity.event.content.comment"
              :questionPreview="activity.event.content.question"
            />
          </div>
          <div v-else-if="activity.verb === 'comment_submission'">
            <CommentCard
              :comment="activity.event.content.comment"
              :submission="activity.event.content.submission"
            />
          </div>
          <div v-else-if="activity.verb === 'comment_article'">
            <CommentCard
              :articlePreview="activity.event.content.article"
              :comment="activity.event.content.comment"
            />
          </div>
          <div v-else-if="activity.verb === 'comment_answer'">
            <CommentCard
              :answerPreview="activity.event.content.answer"
              :comment="activity.event.content.comment"
            />
          </div>
          <div v-else-if="activity.verb === 'reply_comment'">
            <CommentCard
              :comment="activity.event.content.reply"
              :parentComment="activity.event.content.parent_comment"
            />
          </div>
          <div v-else-if="activity.verb === 'upvote_article'">
            <ArticlePreview :articlePreview="activity.event.content.article" />
          </div>
          <div v-else-if="activity.verb === 'create_article'">
            <ArticlePreview :articlePreview="activity.event.content.article" />
          </div>
          <div v-else-if="activity.verb === 'answer_question'">
            <Answer
              :answerPreview="activity.event.content.answer"
              :inAnswerQuestionFeedCard="true"
            />
          </div>
          <div v-else-if="activity.verb === 'create_question'">
            <QuestionPreview :questionPreview="activity.event.content.question" />
          </div>
          <div v-else-if="activity.verb === 'create_submission'">
            <SubmissionPreview :submission="activity.event.content.submission" />
          </div>
        </div>
      </div>

      <div class="text-center mt-4">
        <v-progress-circular
          v-if="preloadMoreActivitiesIntermediate"
          color="primary"
          indeterminate
        />
        <span v-if="noMoreNewActivities">没有更多新动态了</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import store from '@/store';
import { useRouter } from 'vue-router/composables';
import { dispatchAddFlag, dispatchCaptureApiError } from '@/store/main/actions';
import { CombinedActivities } from '@/CombinedActivities';
import { IActivity, IOrigin, IUserPreview } from '@/interfaces';
import UserWelcome from '@/components/home/UserWelcome.vue';
import Answer from '@/components/Answer.vue';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import UserCard from '@/components/UserCard.vue';
import ArticleColumnCard from '@/components/ArticleColumnCard.vue';
import CommentCard from '@/components/CommentCard.vue';
import SubmissionPreview from '@/components/SubmissionPreview.vue';
import UserGrid from '@/components/UserGrid.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import { EXPLORE_SITES } from '@/common';
import ActivitySubject from '@/components/ActivitySubject.vue';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import { apiActivity } from '@/api/activity';
import DotsIcon from '@/components/icons/DotsIcon.vue';
import SiteName from '@/components/SiteName.vue';
import { commitAddNotification } from '@/store/main/mutations';
import DebugSpan from '@/components/base/DebugSpan.vue';
import { useAuth, useTheme, useDayjs } from '@/composables';

const props = withDefaults(
  defineProps<{
    enableShowExploreSites?: boolean;
    subjectUserUuid?: number;
  }>(),
  {
    enableShowExploreSites: true,
  }
);

const router = useRouter();
const { token, userProfile } = useAuth();
const { theme } = useTheme();
const dayjs = useDayjs();

function fromNow(date: string) {
  return dayjs(date).fromNow();
}

// Filter converted to function (Vue 3 removes filters)
function activityVerbCN(value: string): string {
  switch (value) {
    case 'follow_user':
      return '关注了用户';
    case 'upvote_answer':
      return '赞了回答';
    case 'upvote_question':
      return '赞了问题';
    case 'upvote_submission':
      return '赞了分享';
    case 'upvote_article':
      return '赞了文章';
    case 'follow_article_column':
      return '关注了专栏';
    case 'comment_question':
      return '评论了问题';
    case 'comment_submission':
      return '评论了分享';
    case 'comment_article':
      return '评论了文章';
    case 'comment_answer':
      return '评论了回答';
    case 'reply_comment':
      return '回复了评论';
    case 'create_article':
      return '发表了文章';
    case 'answer_question':
      return '回答了问题';
    case 'create_question':
      return '提了一个问题';
    case 'create_submission':
      return '添加了分享';
    default:
      return value;
  }
}

const combinedActivities = reactive(new CombinedActivities());
const loadingActivities = ref(true);
const loadingLimit = 12;
const noMoreNewActivities = ref(false);
const preloadMoreActivitiesIntermediate = ref(false);
const showExploreSites = ref(false);
const showEmptyPlaceholder = ref(false);
const usersDialog = ref(false);
const usersInDialog = ref<IUserPreview[]>([]);
const isRandomActivities = ref(false);

async function loadNewActivities() {
  await dispatchCaptureApiError(store, async () => {
    loadingActivities.value = true;
    let before_activity_id: number | undefined = undefined;
    const newActivities: IActivity[] = [];
    let fetching = true;
    while (fetching) {
      const response = await apiActivity.getFeedSequence(token.value, {
        limit: loadingLimit,
        before_activity_id: before_activity_id,
        random: isRandomActivities.value,
      });
      isRandomActivities.value = response.data.random;
      const activities: IActivity[] = response.data.activities;
      if (activities.length === 0) {
        break;
      }
      for (const activity of activities) {
        if (
          combinedActivities.maxActivityId &&
          activity.id <= combinedActivities.maxActivityId
        ) {
          fetching = false;
          break;
        }
        newActivities.push(activity);
      }
      before_activity_id = activities[activities.length - 1]!.id;
    }
    for (const activity of newActivities) {
      combinedActivities.add(activity, 'head');
    }
    loadingActivities.value = false;
  });
}

async function loadActivities() {
  await dispatchCaptureApiError(store, async () => {
    const response = await apiActivity.getFeedSequence(token.value, {
      limit: loadingLimit,
      subjectUserUUID: props.subjectUserUuid,
    });
    isRandomActivities.value = response.data.random;
    for (const activity of response.data.activities) {
      combinedActivities.add(activity, 'tail');
    }
    if (props.enableShowExploreSites) {
      if (userProfile.value!.flag_list.includes(EXPLORE_SITES)) {
        showExploreSites.value = false;
      } else if (combinedActivities.items.length === 0 || isRandomActivities.value) {
        showExploreSites.value = true;
      }
    }
    if (!showExploreSites.value && combinedActivities.items.length === 0) {
      showEmptyPlaceholder.value = true;
    }
    loadingActivities.value = false;
  });

  preloadMoreActivities();
  window.onscroll = () => {
    preloadMoreActivities();
  };
}

onMounted(async () => {
  await loadActivities();
});

async function onCloseExploreSites() {
  showExploreSites.value = false;
  await dispatchAddFlag(store, EXPLORE_SITES);
}

async function preloadMoreActivities() {
  if (preloadMoreActivitiesIntermediate.value) {
    return;
  }
  preloadMoreActivitiesIntermediate.value = true;
  const bottomOfWindow =
    Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) +
      window.innerHeight >=
    document.documentElement.offsetHeight;
  if (!bottomOfWindow || noMoreNewActivities.value) {
    preloadMoreActivitiesIntermediate.value = false;
    return;
  }
  const minActivityId = combinedActivities.minActivityId;
  if (minActivityId !== null) {
    await dispatchCaptureApiError(store, async () => {
      const response = await apiActivity.getFeedSequence(token.value, {
        random: isRandomActivities.value,
        limit: loadingLimit,
        before_activity_id: minActivityId,
        subjectUserUUID: props.subjectUserUuid,
      });
      const activities = response.data.activities;
      if (activities.length === 0) {
        noMoreNewActivities.value = true;
      } else {
        for (const activity of activities) {
          combinedActivities.add(activity, 'tail');
        }
      }
    });
  }
  preloadMoreActivitiesIntermediate.value = false;
}

function showUsersDialogFn(users: IUserPreview[]) {
  usersInDialog.value = users;
  usersDialog.value = true;
}

async function blockOrigin(origin: IOrigin) {
  await apiActivity.updateOrigins(token.value, { action: 'add', origin });
  await commitAddNotification(store, {
    color: 'info',
    content: '过滤规则更新成功，稍后自动生效',
  });
  await router.go(0);
}

defineExpose({
  loadNewActivities,
});
</script>
