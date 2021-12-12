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

        <template v-if="follows">
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
        </template>
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

<script lang="ts">
import { IUserFollows, IUserPreview } from '@/interfaces';
import { Component, Prop } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import { commitSetShowLoginPrompt } from '@/store/main/mutations';
import { CVue } from '@/common';
import { apiPeople } from '@/api/people';
import { api } from '@/api';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import Avatar from '@/components/Avatar.vue';

@Component({
  name: 'UserCard',
  components: { Avatar, CloseIcon },
})
export default class UserCard extends CVue {
  @Prop() public readonly userPreview!: IUserPreview;
  @Prop({ default: false }) public readonly hoverMode!: boolean;
  @Prop({ default: false }) private readonly infeed!: false;
  @Prop() private readonly siteKarmas: number | undefined;
  private loading = true;
  private follows: IUserFollows | null = null;
  private followIntermediate = false;
  private cancelFollowIntermediate = false;
  private privateMessageIntermediate = false;
  private avatarURL: string | null = null;
  private recommendedUsers: IUserPreview[] = [];

  shortText(text: string, limit: number) {
    if (!text) {
      return text;
    }
    if (text.length > limit) {
      return text.substring(0, limit) + '...';
    }
    return text;
  }

  shortIntro(s) {
    return this.shortText(s, 100);
  }

  shortName(s) {
    return this.shortText(s, 60);
  }

  async mounted() {
    if (this.userPreview.avatar_url) {
      this.avatarURL = this.userPreview.avatar_url;
    } else {
      this.avatarURL = '/img/default-avatar.png';
    }
    if (this.userPreview.follows) {
      this.follows = this.userPreview.follows;
    } else {
      await dispatchCaptureApiError(this.$store, async () => {
        this.follows = (await apiMe.getUserFollows(this.token, this.userPreview.uuid)).data;
      });
    }
    this.loading = false;
  }

  private async follow() {
    if (!this.currentUserId) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    this.followIntermediate = true;
    this.follows = (await apiMe.followUser(this.token, this.userPreview.uuid)).data;
    this.followIntermediate = false;

    // TODO: rotate grid
    if (this.infeed) {
      this.recommendedUsers = (
        await apiPeople.getRelatedUsers(this.token, this.userPreview.uuid)
      ).data.filter((u) => u.uuid !== this.userProfile?.uuid);
    }
  }

  private async cancelFollow() {
    this.cancelFollowIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      this.follows = (await apiMe.cancelFollowUser(this.token, this.userPreview.uuid)).data;
      this.cancelFollowIntermediate = false;
    });
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
}
</script>
