<template>
  <v-container :class="{ 'pa-1': !this.isDesktop }" fluid>
    <user-agreement v-if="userProfile" ref="userAgreement" :user-profile="userProfile" />

    <v-row class="pt-3 pb-10" justify="center">
      <!-- Feed column -->
      <v-col :class="{ 'fixed-narrow-col': isNarrowFeedUI }">
        <template v-if="userProfile">
          <div class="d-flex justify-space-between mb-3 mx-4">
            <NewContentActionBar />
            <v-spacer />
            <div class="d-flex align-center">
              <UIStyleControllers />
            </div>
          </div>

          <v-tabs
            v-model="currentTabItem"
            :background-color="theme.home.tabs.backgroundColor"
            height="35"
            hide-slider
          >
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
              <RefreshIcon v-if="currentTabItem === 'feed'" @click="refreshFeed" />
            </div>

            <v-tab-item eager value="feed">
              <UserFeed ref="userFeed" :user-profile="userProfile" />
            </v-tab-item>
            <v-tab-item value="submissions">
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
          <div v-bind="attrs" v-on="on" class="bottom-btn">
            <HomeFabIcon />
            <span class="ml-1 grey--text">导航</span>
          </div>
        </template>
        <v-sheet class="pa-2">
          <HomeSideCard />
        </v-sheet>
      </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import store from '@/store';
import { useRoute, useRouter } from '@/router';
import NewContentActionBar from '@/components/NewContentActionBar.vue';
import HomeSideCard from '@/components/HomeSideCard.vue';
import HomeFabIcon from '@/components/icons/HomeFabIcon.vue';
import FeedIcon from '@/components/icons/FeedIcon.vue';
import { readNarrowUI } from '@/store/main/getters';
import UIStyleControllers from '@/components/UIStyleControllers.vue';
import UserAgreement from '@/components/home/UserAgreement.vue';
import UserLogoutWelcome from '@/components/home/UserLogoutWelcome.vue';
import UserFeed from '@/components/home/UserFeed.vue';
import SharingIcon from '@/components/icons/SharingIcon.vue';
import UserSubmissionsRankedFeed from '@/components/home/UserSubmissionsRankedFeed.vue';
import RefreshIcon from '@/components/icons/RefreshIcon.vue';
import { useAuth, useTheme, useResponsive } from '@/composables';

const route = useRoute();
const router = useRouter();
const { userProfile } = useAuth();
const { theme } = useTheme();
const { isDesktop } = useResponsive();

const userFeed = ref<InstanceType<typeof UserFeed> | null>(null);

const currentTabItem = computed({
  get() {
    return route.query.tab ? route.query.tab : 'feed';
  },
  set(tab) {
    if (tab !== 'feed') {
      router.replace({ query: { ...route.query, tab: tab as string } });
    } else {
      router.replace({ query: { ...route.query, tab: undefined } });
    }
  },
});

const isNarrowFeedUI = computed(() => readNarrowUI(store));

function refreshFeed() {
  // UserFeed uses script setup with defineExpose
  (userFeed.value as any)?.loadNewActivities();
}
</script>
