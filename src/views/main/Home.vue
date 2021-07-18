<template>
  <v-container :class="{ 'pa-1': !$vuetify.breakpoint.mdAndUp }" fluid>
    <user-agreement v-if="userProfile" ref="userAgreement" :user-profile="userProfile" />

    <v-row class="pt-3 pb-10" justify="center">
      <!-- Feed column -->
      <v-col :class="{ 'fixed-narrow-col': isNarrowFeedUI }" fluid>
        <template v-if="userProfile">
          <div class="d-flex justify-space-between mb-3 mx-4">
            <NewContentActionBar />
            <v-spacer />
            <div class="d-flex align-center">
              <UIStyleControllers />
            </div>
          </div>

          <v-tabs v-model="currentTabItem" height="35" hide-slider>
            <v-tab :href="'#feed'">
              <FeedIcon class="mr-1" />
              信息流
            </v-tab>
            <v-tab :href="'#submissions'">
              <SharingIcon class="mr-1" />
              分享榜
            </v-tab>
            <v-spacer />
            <div class="mr-3">
              <RefreshIcon @click="refreshFeed" v-if="currentTabItem === 'feed'" />
            </div>

            <v-tab-item value="feed" eager>
              <UserFeed ref="userFeed" :user-profile="userProfile" />
            </v-tab-item>
            <v-tab-item value="submissions" eager>
              <UserSubmissionsRankedFeed />
            </v-tab-item>
          </v-tabs>
        </template>
        <user-logout-welcome v-else />
      </v-col>

      <!-- Side column -->
      <v-col
        v-if="$vuetify.breakpoint.mdAndUp"
        :class="isNarrowFeedUI ? 'fixed-narrow-sidecol' : 'col-4'"
      >
        <HomeSideCard />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on" class="bottom-btn" @click="onFabClicked">
            <HomeFabIcon /><span class="ml-1 grey--text">导航</span>
          </div>
        </template>
        <v-sheet class="pa-2">
          <HomeSideCard />
        </v-sheet>
      </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NewContentActionBar from '@/components/NewContentActionBar.vue';
import HomeSideCard from '@/components/HomeSideCard.vue';
import ExploreIcon from '@/components/icons/ExploreIcon.vue';
import HomeFabIcon from '@/components/icons/HomeFabIcon.vue';
import FeedIcon from '@/components/icons/FeedIcon.vue';
import { readNarrowUI, readUserProfile } from '@/store/main/getters';
import { dispatchAddFlag } from '@/store/main/actions';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import UIStyleControllers from '@/components/UIStyleControllers.vue';
import UserAgreement from '@/components/home/UserAgreement.vue';
import UserLogoutWelcome from '@/components/home/UserLogoutWelcome.vue';
import { FAB_FLAG } from '@/common';
import UserFeed from '@/components/home/UserFeed.vue';
import SharingIcon from '@/components/icons/SharingIcon.vue';
import UserSubmissionsRankedFeed from '@/components/home/UserSubmissionsRankedFeed.vue';
import RefreshIcon from '@/components/icons/RefreshIcon.vue';

@Component({
  components: {
    RefreshIcon,
    UserSubmissionsRankedFeed,
    SharingIcon,
    UserFeed,
    UserLogoutWelcome,
    UserAgreement,
    CreateQuestionForm,
    UIStyleControllers,
    HomeSideCard,
    HomeFabIcon,
    ExploreIcon,
    NewContentActionBar,
    FeedIcon,
  },
})
export default class Home extends Vue {
  get currentTabItem() {
    return this.$route.query.tab ? this.$route.query.tab : 'feed';
  }

  set currentTabItem(tab) {
    if (tab !== 'feed') {
      this.$router.replace({ query: { ...this.$route.query, tab } });
    } else {
      this.$router.replace({ query: { ...this.$route.query, tab: undefined } });
    }
  }

  get isNarrowFeedUI() {
    return readNarrowUI(this.$store);
  }

  get userProfile() {
    return readUserProfile(this.$store);
  }

  private refreshFeed() {
    (this.$refs.userFeed as UserFeed).loadNewActivities();
  }

  private async onFabClicked() {
    if (this.userProfile) {
      (this.$refs.userAgreement as UserAgreement).overlay = false;
      await dispatchAddFlag(this.$store, FAB_FLAG);
    }
  }
}
</script>
