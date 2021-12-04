<template>
  <div :class="theme.baseCard.classKey" class="pa-3">
    <div class="row">
      <div :class="{ 'col-12': !$vuetify.breakpoint.mdAndUp }" class="pb-4">
        <div v-if="avatarURL" :class="{ 'text-center': !$vuetify.breakpoint.mdAndUp }" class="pa-3">
          <router-link :to="`/users/${userPreview.handle}`">
            <Avatar :avatar-url="avatarURL" size="140" />
          </router-link>
        </div>
        <UserNameHeadline
          v-if="!$vuetify.breakpoint.mdAndUp"
          :user-preview="userPreview"
          class="text-center"
        />
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
                    <v-btn depressed primary small @click="showFollowersDialog = false">
                      <CloseIcon />
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-lazy v-if="followers">
                      <UserGrid :users="followers" />
                    </v-lazy>
                    <div class="text-center" v-else>
                      <v-progress-circular indeterminate size="25" color="primary" />
                    </div>
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
                    <v-btn depressed primary small @click="showFollowedDialog = false">
                      <CloseIcon />
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-lazy v-if="followed">
                      <UserGrid :users="followed" />
                    </v-lazy>
                    <div class="text-center" v-else>
                      <v-progress-circular indeterminate size="25" color="primary" />
                    </div>
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
      </div>
      <div class="col align-self-center">
        <UserNameHeadline v-if="$vuetify.breakpoint.mdAndUp" :user-preview="userPreview" />
        <v-divider v-if="$vuetify.breakpoint.mdAndUp" class="my-2" />
        <UserProfileDetails v-if="userPublic" :user-public="userPublic" />

        <div class="d-flex">
          <v-spacer />
          <span class="text-caption grey--text mt-2" v-if="userPublic.profile_view_times">
            这个主页被浏览了{{ userPublic.profile_view_times }}次
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IUserFollows, IUserPreview, IUserPublic } from '@/interfaces';
import { api } from '@/api';
import { Component, Prop } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import { commitSetShowLoginPrompt } from '@/store/main/mutations';
import UserProfileDetails from '@/components/UserProfileDetails.vue';
import UserNameHeadline from '@/components/UserNameHeadline.vue';
import UserGrid from '@/components/UserGrid.vue';
import { apiPeople } from '@/api/people';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import { CVue } from '@/common';
import Avatar from '@/components/Avatar.vue';

@Component({
  components: { Avatar, CloseIcon, UserGrid, UserNameHeadline, UserProfileDetails },
})
export default class UserProfileCard extends CVue {
  @Prop() public readonly userPreview!: IUserPreview;
  @Prop() public readonly userPublic: IUserPublic | undefined;
  @Prop() private readonly siteKarmas: number | undefined;
  private loading = true;
  private follows: IUserFollows | null = null;
  private followIntermediate = false;
  private cancelFollowIntermediate = false;
  private privateMessageIntermediate = false;
  private avatarURL: string | null = null;
  private followers: IUserPreview[] | null = null;
  private followed: IUserPreview[] | null = null;
  private showFollowersDialog = false;
  private showFollowedDialog = false;

  private shortIntro(intro: string) {
    if (!intro) {
      return intro;
    }
    if (intro.length > 25) {
      return intro.substring(0, 25) + '...';
    }
    return intro;
  }

  private async mounted() {
    if (this.userPublic && this.userPublic.gif_avatar_url) {
      this.avatarURL = this.userPublic.gif_avatar_url;
    } else if (this.userPreview.avatar_url) {
      this.avatarURL = this.userPreview.avatar_url;
    } else {
      this.avatarURL = '/img/default-avatar.png';
    }
    await dispatchCaptureApiError(this.$store, async () => {
      this.follows = (await apiMe.getUserFollows(this.token, this.userPreview.uuid)).data;
    });
    this.loading = false;
  }

  private async follow() {
    if (!this.currentUserId) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    this.followIntermediate = true;
    if (this.userPreview !== null) {
      this.follows = (await apiMe.followUser(this.token, this.userPreview.uuid)).data;
      this.followIntermediate = false;
    }
  }

  private async cancelFollow() {
    if (this.userPreview !== null) {
      this.cancelFollowIntermediate = true;
      await dispatchCaptureApiError(this.$store, async () => {
        this.follows = (await apiMe.cancelFollowUser(this.token, this.userPreview.uuid)).data;
        this.cancelFollowIntermediate = false;
      });
    }
  }

  private async privateMessage() {
    if (!this.currentUserId) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    this.privateMessageIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      const r0 = await api.createChannel(this.token, {
        private_with_user_uuid: this.userPreview.uuid,
      });
      const channelId = r0.data.id;
      await this.$router.push(`/channels/${channelId}`);
    });
  }

  private async showFollowers() {
    this.showFollowersDialog = true;
    this.followers = (await apiPeople.getUserFollowers(this.token, this.userPreview.uuid)).data;
  }

  private async showFollowed() {
    this.showFollowedDialog = true;
    this.followed = (await apiPeople.getUserFollowed(this.token, this.userPreview.uuid)).data;
  }
}
</script>
