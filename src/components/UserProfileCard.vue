<template>
  <div :class="theme.baseCard.classKey" class="pa-3">
    <template v-if="isDesktop">
      <v-row>
        <v-col class="col-auto pb-4 px-4">
          <div v-if="avatarURL" class="pa-3 text-center">
            <router-link :to="`/users/${userPreview.handle}`">
              <Avatar :avatar-url="avatarURL" size="120" />
            </router-link>
          </div>
          <div v-if="follows" class="text-center">
            <div>
              <a
                v-if="loggedIn && follows.followers_count > 0"
                class="text-decoration-none"
                @click="showFollowers"
              >
                有{{ follows.followers_count }}个关注者
                <v-dialog v-model="showFollowersDialog" max-width="800">
                  <v-card class="pt-6">
                    <v-card-title
                      >关注TA的人
                      <v-spacer />
                      <CloseIcon @click="showFollowersDialog = false" />
                    </v-card-title>
                    <v-card-text>
                      <DynamicItemList
                        :load-items="loadFollowers"
                        v-slot="{ item }"
                        emptyItemsText="暂无"
                        nullItemText=""
                      >
                        <UserCard :compactMode="true" :userPreview="item" />
                      </DynamicItemList>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </a>
              <span v-else> 有{{ follows.followers_count }}个关注者 </span>
            </div>

            <div>
              <a
                v-if="loggedIn && follows.followed_count > 0"
                class="text-decoration-none"
                @click="showFollowed"
              >
                关注了{{ follows.followed_count }}个人
                <v-dialog v-model="showFollowedDialog" max-width="800">
                  <v-card class="pt-6">
                    <v-card-title
                      >TA关注的人
                      <v-spacer />
                      <CloseIcon @click="showFollowedDialog = false" />
                    </v-card-title>
                    <v-card-text>
                      <DynamicItemList
                        :load-items="loadFollowed"
                        v-slot="{ item }"
                        emptyItemsText="暂无"
                        nullItemText=""
                      >
                        <UserCard :compactMode="true" :userPreview="item" />
                      </DynamicItemList>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </a>
              <span v-else> 关注了{{ follows.followed_count }}个人 </span>
            </div>
            <div>
              <span>Karma：{{ userPreview.karma }}</span>
            </div>
            <div class="pt-2" v-if="userPreview.uuid !== currentUserId">
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
            </div>
          </div>
          <v-skeleton-loader type="list-item-three-line" v-else />
        </v-col>
        <v-col class="align-self-center">
          <UserNameHeadline :user-preview="userPreview" />

          <UserProfileDetails v-if="userPublic" :user-public="userPublic" />

          <div class="d-flex">
            <v-spacer />
            <span class="text-caption grey--text mt-2" v-if="userPublic.profile_view_times">
              这个主页被浏览了{{ userPublic.profile_view_times }}次
            </span>
          </div>
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <div class="pb-4">
        <div v-if="avatarURL" class="pa-3 text-center">
          <router-link :to="`/users/${userPreview.handle}`">
            <Avatar :avatar-url="avatarURL" size="140" />
          </router-link>
        </div>
        <UserNameHeadline :user-preview="userPreview" class="text-center" />
        <div v-if="follows" class="text-center">
          <div>
            <a
              v-if="loggedIn && follows.followers_count > 0"
              class="text-decoration-none"
              @click="showFollowers"
            >
              有{{ follows.followers_count }}个关注者
              <v-dialog v-model="showFollowersDialog" max-width="800">
                <v-card class="pt-6">
                  <v-card-title
                    >关注TA的人
                    <v-spacer />
                    <CloseIcon @click="showFollowersDialog = false" />
                  </v-card-title>
                  <v-card-text>
                    <DynamicItemList
                      :load-items="loadFollowers"
                      v-slot="{ item }"
                      emptyItemsText="暂无"
                      nullItemText=""
                    >
                      <UserCard :compactMode="true" :userPreview="item" />
                    </DynamicItemList>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </a>
            <span v-else> 有{{ follows.followers_count }}个关注者 </span>
          </div>

          <div>
            <a
              v-if="loggedIn && follows.followed_count > 0"
              class="text-decoration-none"
              @click="showFollowed"
            >
              关注了{{ follows.followed_count }}个人
              <v-dialog v-model="showFollowedDialog" max-width="800">
                <v-card class="pt-6">
                  <v-card-title
                    >TA关注的人
                    <v-spacer />
                    <CloseIcon @click="showFollowedDialog = false" />
                  </v-card-title>
                  <v-card-text>
                    <DynamicItemList
                      :load-items="loadFollowed"
                      v-slot="{ item }"
                      emptyItemsText="暂无"
                      nullItemText=""
                    >
                      <UserCard :compactMode="true" :userPreview="item" />
                    </DynamicItemList>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </a>
            <span v-else> 关注了{{ follows.followed_count }}个人 </span>
          </div>
          <div>
            <span>Karma：{{ userPreview.karma }}</span>
          </div>
          <div class="pt-2" v-if="userPreview.uuid !== currentUserId">
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
          </div>
        </div>
        <v-skeleton-loader type="list-item-three-line" v-else />
      </div>
      <div class="align-self-center">
        <UserProfileDetails v-if="userPublic" :user-public="userPublic" />

        <div class="d-flex">
          <v-spacer />
          <span class="text-caption grey--text mt-2" v-if="userPublic.profile_view_times">
            这个主页被浏览了{{ userPublic.profile_view_times }}次
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import store from '@/store';
import { useRouter } from '@/router';
import { IUserFollows, IUserPreview, IUserPublic } from '@/interfaces';
import { api } from '@/api';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import { commitSetShowLoginPrompt } from '@/store/main/mutations';
import UserProfileDetails from '@/components/UserProfileDetails.vue';
import UserNameHeadline from '@/components/UserNameHeadline.vue';
import UserGrid from '@/components/UserGrid.vue';
import { apiPeople } from '@/api/people';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import Avatar from '@/components/Avatar.vue';
import DynamicItemList from '@/components/DynamicItemList.vue';
import UserCard from '@/components/UserCard.vue';
import { useAuth, useResponsive, useTheme } from '@/composables';

const props = defineProps<{
  userPreview: IUserPreview;
  userPublic?: IUserPublic;
  siteKarmas?: number;
}>();

const router = useRouter();
const { token, loggedIn } = useAuth();
const { isDesktop } = useResponsive();
const { theme } = useTheme();

const currentUserId = useAuth().userProfile.value?.uuid;

const loading = ref(true);
const follows = ref<IUserFollows | null>(null);
const followIntermediate = ref(false);
const cancelFollowIntermediate = ref(false);
const privateMessageIntermediate = ref(false);
const avatarURL = ref<string | null>(null);
const showFollowersDialog = ref(false);
const showFollowedDialog = ref(false);

function shortIntro(intro: string) {
  if (!intro) {
    return intro;
  }
  if (intro.length > 25) {
    return intro.substring(0, 25) + '...';
  }
  return intro;
}

onMounted(async () => {
  if (props.userPublic && props.userPublic.gif_avatar_url) {
    avatarURL.value = props.userPublic.gif_avatar_url;
  } else if (props.userPreview.avatar_url) {
    avatarURL.value = props.userPreview.avatar_url;
  } else {
    avatarURL.value = '/img/default-avatar.png';
  }
  if (props.userPublic?.follows) {
    follows.value = props.userPublic.follows;
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

async function showFollowers() {
  showFollowersDialog.value = true;
}

async function showFollowed() {
  showFollowedDialog.value = true;
}

async function loadFollowed(skip: number, limit: number) {
  console.log('loadFollowed...');
  return (await apiPeople.getUserFollowed(token.value, props.userPreview.uuid, skip, limit)).data;
}

async function loadFollowers(skip: number, limit: number) {
  console.log('loadFollowers...');
  return (await apiPeople.getUserFollowers(token.value, props.userPreview.uuid, skip, limit)).data;
}
</script>
