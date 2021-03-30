<template>
  <v-card
    :class="{ 'c-card': !embedded && !hoverMode }"
    :flat="embedded"
    :max-width="hoverMode ? 400 : undefined"
    class="pa-3"
  >
    <div v-if="!compactMode && avatarURL" class="mb-1 text-center mt-2">
      <router-link :to="`/users/${userPreview.handle}`">
        <v-avatar class="avatarDiv" size="100" tile>
          <v-img :src="avatarURL" alt="Avatar" />
        </v-avatar>
      </router-link>
    </div>
    <v-row justify="center">
      <v-col v-if="compactMode && avatarURL" align-self="center" style="max-width: 110px">
        <router-link :to="`/users/${userPreview.handle}`">
          <v-avatar class="avatarDiv" size="100" tile>
            <v-img :src="avatarURL" alt="Avatar" />
          </v-avatar>
        </router-link>
      </v-col>
      <v-col align-self="center">
        <div :class="{ headline: !compactMode, 'text-center': !compactMode }" class="mb-1 mt-1">
          <router-link :to="'/users/' + userPreview.handle" class="text-decoration-none">
            <span v-if="userPreview.full_name">
              {{ userPreview.full_name }}
            </span>
            <span v-else> @{{ userPreview.handle }} </span>
          </router-link>

          <span v-if="userPreview.full_name" class="grey--text"> (@{{ userPreview.handle }}) </span>
        </div>

        <div
          v-if="userPreview.personal_introduction"
          :class="{ 'text-center': !compactMode, 'text-caption': compactMode }"
          class="secondary--text"
        >
          <span v-if="hoverMode">{{ shortIntro(userPreview.personal_introduction) }}</span>
          <span v-else>{{ userPreview.personal_introduction }}</span>
        </div>

        <template v-if="follows">
          <v-row v-if="compactMode">
            <v-col>
              <router-link
                v-if="loggedIn && !compactMode"
                :to="`/users/${userPreview.handle}?tab=followers`"
                class="text-decoration-none text-caption mr-2"
              >
                {{ $t('有n个关注者', { count: follows.followers_count }) }}
              </router-link>
              <span v-else class="text-caption mr-2">
                {{ $t('有n个关注者', { count: follows.followers_count }) }}
              </span>

              <router-link
                v-if="loggedIn && !compactMode"
                :to="`/users/${userPreview.handle}?tab=followed`"
                class="text-decoration-none text-caption mr-2"
              >
                {{ $t('关注了n个人', { count: follows.followed_count }) }}
              </router-link>
              <span v-else class="text-caption mr-2">
                {{ $t('关注了n个人', { count: follows.followed_count }) }}
              </span>

              <template v-if="siteKarmas !== undefined">
                <span class="text-caption"> {{ $t('Circle') }} Karma: {{ siteKarmas }} </span>
              </template>
            </v-col>
          </v-row>
          <v-row v-else class="mt-3">
            <v-col class="text-center">
              <router-link
                v-if="loggedIn"
                :to="`/users/${userPreview.handle}?tab=followers`"
                class="text-decoration-none"
              >
                {{ $t('有n个关注者', { count: follows.followers_count }) }}
              </router-link>
              <span v-else>
                {{ $t('有n个关注者', { count: follows.followers_count }) }}
              </span>
            </v-col>
            <v-col class="text-center">
              <router-link
                v-if="loggedIn"
                :to="`/users/${userPreview.handle}?tab=followed`"
                class="text-decoration-none"
              >
                {{ $t('关注了n个人', { count: follows.followed_count }) }}
              </router-link>
              <span v-else>
                {{ $t('关注了n个人', { count: follows.followed_count }) }}
              </span>
            </v-col>
            <v-col class="text-center">
              <span> {{ $t('Karma') }}: {{ userPreview.karma }} </span>
            </v-col>
          </v-row>

          <v-row class="compact-row">
            <v-col
              v-if="currentUserId != userPreview.uuid"
              :class="{
                'text-center': !compactMode,
                'compact-col': compactMode,
              }"
            >
              <v-btn
                v-if="follows.followed_by_me"
                :disabled="cancelFollowIntermediate"
                class="mt-1 mr-1"
                depressed
                small
                @click="cancelFollow"
              >
                {{ $t('取消关注') }}
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
                {{ $t('关注') }}
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
                {{ $t('私信') }}
              </v-btn>
            </v-col>
            <div v-else class="mb-2" />
          </v-row>
        </template>
        <v-skeleton-loader v-else type="text" />
      </v-col>
    </v-row>
    <div v-if="userPublic && userPublic.profile_view_times" class="text-center mt-5">
      <span class="text-caption grey--text ma-2">
        {{ $t('这个主页被浏览了n次', { times: userPublic.profile_view_times }) }}
      </span>
    </div>
  </v-card>
</template>

<script lang="ts">
import { IUserFollows, IUserPreview, IUserPublic } from '@/interfaces';
import { api } from '@/api';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import { commitSetShowLoginPrompt } from '@/store/main/mutations';
import { readIsLoggedIn } from '@/store/main/getters';

@Component({
  name: 'UserCard',
})
export default class UserCard extends Vue {
  @Prop() public readonly userPreview!: IUserPreview;
  @Prop() public readonly userPublic: IUserPublic | undefined;
  @Prop({ default: false }) public readonly compactMode!: boolean;
  @Prop({ default: false }) public readonly hoverMode!: boolean;
  @Prop({ default: false }) private readonly embedded!: false;
  @Prop() private readonly siteKarmas: number | undefined;
  private loading = true;
  private follows: IUserFollows | null = null;
  private followIntermediate = false;
  private cancelFollowIntermediate = false;
  private privateMessageIntermediate = false;
  private avatarURL: string | null = null;

  get currentUserId() {
    if (!this.$store.state.main.userProfile) {
      return null;
    }
    return this.$store.state.main.userProfile.uuid;
  }

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

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
      this.follows = (
        await apiMe.getUserFollows(this.$store.state.main.token, this.userPreview.uuid)
      ).data;
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
      this.follows = (
        await apiMe.followUser(this.$store.state.main.token, this.userPreview.uuid)
      ).data;
      this.followIntermediate = false;
    }
  }

  private async cancelFollow() {
    if (this.userPreview !== null) {
      this.cancelFollowIntermediate = true;
      await dispatchCaptureApiError(this.$store, async () => {
        this.follows = (
          await apiMe.cancelFollowUser(this.$store.state.main.token, this.userPreview.uuid)
        ).data;
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
      const r0 = await api.createChannel(this.$store.state.main.token, {
        private_with_user_uuid: this.userPreview.uuid,
      });
      const channelId = r0.data.id;
      this.$router.push(`/channels/${channelId}`);
    });
  }
}
</script>

<style scoped>
.compact-row {
  margin-top: 0 !important;
}

.compact-col {
  padding-top: 0 !important;
}
</style>

<style scoped>
/* FIXME: code duplicate: Home.vue */
.c-card {
  box-shadow: 0 5px 10px -10px rgba(85, 85, 85, 0.08), 0 10px 20px 0 rgba(85, 85, 85, 0.06),
    0 15px 30px 0 rgba(85, 85, 85, 0.03) !important;
}
</style>
