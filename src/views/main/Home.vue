<template>
  <v-container :class="{ 'pa-1': !$vuetify.breakpoint.mdAndUp }" fluid>
    <user-agreement ref="userAgreement" />

    <v-row class="pa-3" justify="center">
      <!-- Feed column -->
      <v-col :class="{ 'fixed-narrow-col': isNarrowFeedUI }" fluid>
        <div v-if="userProfile" class="d-flex justify-space-between mb-3">
          <NewContentActionBar />
          <v-spacer />
          <div class="d-flex align-center">
            <SharingIcon v-if="!showSharing" class="mr-2" @click="toggleSharing" color="primary" />
            <FeedIcon v-else class="mr-2" @click="toggleSharing" color="primary" />

            <router-link to="/explore" class="mr-2 mb-1"
              ><ExploreIcon color="yellow darken-3"
            /></router-link>
            <UIStyleControllers />
          </div>
        </div>

        <template v-if="userProfile">
          <UserSubmissionsRankedFeed v-if="showSharing" />
          <UserFeed :user-profile="userProfile" v-else />
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
      <v-bottom-sheet v-else class="bottom-info-panel">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            bottom
            class="fab"
            color="primary"
            fab
            fixed
            right
            @click="onFabClicked"
          >
            <HomeFabIcon />
          </v-btn>
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
import CloseIcon from '@/components/icons/CloseIcon.vue';
import FeedIcon from '@/components/icons/FeedIcon.vue';
import { readNarrowUI, readUserProfile } from '@/store/main/getters';
import { dispatchAddFlag } from '@/store/main/actions';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import UIStyleControllers from '@/components/UIStyleControllers.vue';
import UserAgreement from '@/components/home/UserAgreement.vue';
import UserWelcome from '@/components/home/UserWelcome.vue';
import UserLogoutWelcome from '@/components/home/UserLogoutWelcome.vue';
import { FAB_FLAG } from '@/common';
import UserFeed from '@/components/home/UserFeed.vue';
import SharingIcon from '@/components/icons/SharingIcon.vue';
import UserSubmissionsRankedFeed from '@/components/home/UserSubmissionsRankedFeed.vue';

@Component({
  components: {
    UserSubmissionsRankedFeed,
    SharingIcon,
    UserFeed,
    UserLogoutWelcome,
    UserWelcome,
    UserAgreement,
    CreateQuestionForm,
    UIStyleControllers,
    HomeSideCard,
    HomeFabIcon,
    ExploreIcon,
    NewContentActionBar,
    FeedIcon,
    CloseIcon,
  },
})
export default class Home extends Vue {
  private showSharing = false;

  get isNarrowFeedUI() {
    return readNarrowUI(this.$store);
  }

  get userProfile() {
    return readUserProfile(this.$store);
  }

  private async onFabClicked() {
    (this.$refs.userAgreement as UserAgreement).overlay = false;
    await dispatchAddFlag(this.$store, FAB_FLAG);
  }

  private async toggleSharing() {
    this.showSharing = !this.showSharing;
  }
}
</script>

<style scoped>
.bottom-info-panel,
.fab {
  z-index: 30;
}

.fixed-narrow-col {
  max-width: 800px;
  padding-left: 0;
  padding-right: 0;
}

.fixed-narrow-sidecol {
  max-width: 400px;
}
</style>
