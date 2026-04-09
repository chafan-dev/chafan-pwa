<template>
  <v-container :class="{ 'pa-1': !isDesktop }" fluid>
    <user-agreement v-if="userProfile" ref="userAgreement" :user-profile="userProfile" />

    <v-row class="pt-3 pb-10" justify="center">
      <!-- Feed column -->
      <v-col>
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
            :bg-color="theme.home.tabs.backgroundColor"
            height="35"
            hide-slider
          >
            <v-tab value="feed">
              <AppIcon name="Feed" class="mr-1"  />
              信息流
            </v-tab>
            <v-tab value="submissions">
              <AppIcon name="Sharing" class="mr-1"  />
              分享榜
            </v-tab>
            <v-spacer />
            <div class="mr-3">
              <AppIcon name="Refresh" v-if="currentTabItem === 'feed'" @click="refreshFeed"  />
            </div>
          </v-tabs>
          <v-window v-model="currentTabItem">
            <v-window-item eager value="feed">
              <UserFeed ref="userFeed" :user-profile="userProfile" />
            </v-window-item>
            <v-window-item value="submissions">
              <UserSubmissionsRankedFeed />
            </v-window-item>
          </v-window>
        </template>
        <user-logout-welcome v-else />
      </v-col>

      <!-- Side column -->
      <v-col
        v-if="display.mdAndUp"
        class="col-4"
      >
        <HomeSideCard />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ props }">
          <div v-bind="props" class="bottom-btn">
            <AppIcon name="HomeFab"  />
            <span class="ml-1 text-grey">导航</span>
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
import { useDisplay } from 'vuetify';
import { useRoute, useRouter } from 'vue-router';
import NewContentActionBar from '@/components/NewContentActionBar.vue';
import HomeSideCard from '@/components/HomeSideCard.vue';
import { useMainStore } from '@/stores/main';
import UIStyleControllers from '@/components/UIStyleControllers.vue';
import UserAgreement from '@/components/home/UserAgreement.vue';
import UserLogoutWelcome from '@/components/home/UserLogoutWelcome.vue';
import UserFeed from '@/components/home/UserFeed.vue';
import UserSubmissionsRankedFeed from '@/components/home/UserSubmissionsRankedFeed.vue';
import { useAuth, useTheme, useResponsive } from '@/composables';
import AppIcon from '@/components/icons/AppIcon.vue';
const display = useDisplay();

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

const store = useMainStore();
const isNarrowFeedUI = computed(() => store.narrowUI);

function refreshFeed() {
  // UserFeed uses script setup with defineExpose
  (userFeed.value as any)?.loadNewActivities();
}
</script>
