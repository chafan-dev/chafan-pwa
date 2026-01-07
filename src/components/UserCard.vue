<template>
  <v-card
    :class="!infeed && !hoverMode ? theme.baseCard.classKey : ''"
    :flat="infeed"
    :max-width="hoverMode ? 400 : undefined"
    class="pa-3"
  >
    <v-row justify="center">
      <v-col v-if="avatarURL" align-self="center" style="max-width: 100px">
        <router-link :to="`/users/${userPreview.handle}`">
          <Avatar :avatar-url="avatarURL" size="85" />
        </router-link>
      </v-col>
      <v-col align-self="center">
        <div class="mb-1 mt-1" style="min-width: 100px">
          <router-link :to="'/users/' + userPreview.handle" class="text-decoration-none">
            <span v-if="userPreview.full_name">
              {{ shortName(userPreview.full_name) }}
            </span>
            <span v-else> @{{ shortName(userPreview.handle) }} </span>
          </router-link>
        </div>

        <div v-if="userPreview.personal_introduction" class="secondary--text text-caption">
          <span>{{ shortIntro(userPreview.personal_introduction) }}</span>
        </div>

        <div v-if="follows">
          <v-row class="compact-row">
            <v-col class="compact-col">
              <span v-if="follows.followers_count" class="text-caption mr-2 grey--text"
                >{{ follows.followers_count }}关注者
              </span>
            </v-col>
          </v-row>

          <v-row class="compact-row" v-if="userPreview.social_annotations.follow_follows">
            <v-col class="compact-col text-caption">
              <v-chip color="green lighten-5" x-small label>
                我关注的人中有{{ userPreview.social_annotations.follow_follows }}人也关注了TA
              </v-chip>
            </v-col>
          </v-row>

          <v-row class="compact-row">
            <v-col v-if="currentUserId !== userPreview.uuid" class="compact-col">
              <v-btn
                v-if="follows.followed_by_me"
                :disabled="cancelFollowIntermediate"
                class="mt-1 mr-1"
                depressed
                small
                @click="cancelFollow"
              >
                取消关注
                <v-progress-circular v-show="cancelFollowIntermediate" :size="20" indeterminate />
              </v-btn>
              <v-btn
                v-else
                :disabled="followIntermediate"
                class="mt-1 mr-1"
                color="primary"
                depressed
                small
                @click="follow"
              >
                关注
                <v-progress-circular
                  v-show="followIntermediate"
                  :size="20"
                  color="primary"
                  indeterminate
                />
              </v-btn>

              <v-btn
                :disabled="privateMessageIntermediate"
                class="mt-1 mr-1"
                depressed
                small
                @click="privateMessage"
              >
                私信
              </v-btn>
            </v-col>
            <div v-else class="mb-2" />
          </v-row>
        </div>
        <v-skeleton-loader v-else type="text" />
      </v-col>
    </v-row>
    <v-expand-transition>
      <div v-if="recommendedUsers.length > 0">
        <v-divider class="my-2" />
        <div class="d-flex">
          <span>关注更多类似用户：</span>
          <v-spacer />
          <CloseIcon @click="recommendedUsers = []" />
        </div>
        <v-row class="mt-1">
          <v-col v-if="recommendedUsers[0]">
            <UserCard :compactMode="true" :userPreview="recommendedUsers[0]" />
          </v-col>
          <v-col>
            <UserCard
              v-if="recommendedUsers[1]"
              :compactMode="true"
              :userPreview="recommendedUsers[1]"
            />
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from '@/router';
import { IUserFollows, IUserPreview } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import { commitSetShowLoginPrompt } from '@/store/main/mutations';
import { apiPeople } from '@/api/people';
import { api } from '@/api';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import Avatar from '@/components/Avatar.vue';
import { useAuth, useTheme } from '@/composables';

const props = withDefaults(
  defineProps<{
    userPreview: IUserPreview;
    hoverMode?: boolean;
    infeed?: boolean;
    siteKarmas?: number;
  }>(),
  {
    hoverMode: false,
    infeed: false,
  }
);

const store = useStore();
const router = useRouter();
const { token, userProfile } = useAuth();
const { theme } = useTheme();

const currentUserId = userProfile.value?.uuid;

const loading = ref(true);
const follows = ref<IUserFollows | null>(null);
const followIntermediate = ref(false);
const cancelFollowIntermediate = ref(false);
const privateMessageIntermediate = ref(false);
const avatarURL = ref<string | null>(null);
const recommendedUsers = ref<IUserPreview[]>([]);

function shortText(text: string, limit: number) {
  if (!text) {
    return text;
  }
  if (text.length > limit) {
    return text.substring(0, limit) + '...';
  }
  return text;
}

function shortIntro(s: string) {
  return shortText(s, 100);
}

function shortName(s: string) {
  return shortText(s, 60);
}

onMounted(async () => {
  if (props.userPreview.avatar_url) {
    avatarURL.value = props.userPreview.avatar_url;
  } else {
    avatarURL.value = '/img/default-avatar.png';
  }
  if (props.userPreview.follows) {
    follows.value = props.userPreview.follows;
  } else {
    await dispatchCaptureApiError(store, async () => {
      follows.value = (await apiMe.getUserFollows(token.value, props.userPreview.uuid)).data;
    });
  }
  loading.value = false;
});

async function follow() {
  if (!currentUserId) {
    commitSetShowLoginPrompt(store, true);
    return;
  }
  followIntermediate.value = true;
  follows.value = (await apiMe.followUser(token.value, props.userPreview.uuid)).data;
  followIntermediate.value = false;

  recommendedUsers.value = (
    await apiPeople.getRelatedUsers(token.value, props.userPreview.uuid)
  ).data.filter((u) => u.uuid !== userProfile.value?.uuid);
}

async function cancelFollow() {
  cancelFollowIntermediate.value = true;
  await dispatchCaptureApiError(store, async () => {
    follows.value = (await apiMe.cancelFollowUser(token.value, props.userPreview.uuid)).data;
    cancelFollowIntermediate.value = false;
  });
}

async function privateMessage() {
  if (!currentUserId) {
    commitSetShowLoginPrompt(store, true);
    return;
  }
  privateMessageIntermediate.value = true;
  await dispatchCaptureApiError(store, async () => {
    const r0 = await api.createChannel(token.value, {
      private_with_user_uuid: props.userPreview.uuid,
    });
    const channelId = r0.data.id;
    await router.push(`/channels/${channelId}`);
  });
}
</script>
