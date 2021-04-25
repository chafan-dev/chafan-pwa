<template>
  <div>
    <div class="mb-2">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="headline">
          <div class="headline primary--text">{{ $t('My Circles') }}</div>
        </div>

        <div class="d-flex mt-1">
          <v-btn depressed small @click="showCreateSiteDialog = true">{{ $t('创建圈子') }}</v-btn>

          <v-dialog v-model="showCreateSiteDialog" max-width="500">
            <CreateSiteCard />
          </v-dialog>
        </div>
      </div>

      <v-skeleton-loader v-if="loadingSites" type="paragraph" />
      <div v-else>
        <!-- TODO: rank/compute recently used sites. -->
        <div>
          <SiteBtn
            v-for="profile in visibleSiteProfiles"
            :key="profile.site.uuid"
            :site="profile.site"
          />
          <v-btn
            v-if="showAllSiteProfilesDialogButton"
            class="mt-1 mr-1"
            color="info"
            depressed
            small
            @click="showAllSiteProfilesDialog = true"
          >
            <MoreIcon />
            {{ $t('More') }}
          </v-btn>
          <v-btn class="mt-1" color="info" depressed outlined small to="/explore?tab=sites">
            {{ $t('所有圈子') }}
          </v-btn>
        </div>
        <v-dialog v-model="showAllSiteProfilesDialog">
          <v-card>
            <v-card-title>{{ $t('My Circles') }}</v-card-title>
            <v-card-text>
              <SiteBtn
                v-for="profile in siteProfiles"
                :key="profile.site.uuid"
                :site="profile.site"
              />
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>
    </div>

    <v-divider />
    <div class="my-3">
      <div class="headline">{{ $t('Pinned questions') }}</div>
      <v-skeleton-loader v-if="loadingPinnedQuestions" type="paragraph" />
      <ul v-else class="my-3">
        <li v-for="question in questions" :key="question.uuid">
          <QuestionLink :questionPreview="question" />
        </li>
      </ul>
    </div>

    <v-divider />
    <div class="py-3">
      <div>
        <a class="text-decoration-none" href="https://about.cha.fan" target="_blank">关于茶饭</a>
      </div>
      <div>
        <a
          class="text-decoration-none"
          href="https://about.cha.fan/docs/code-of-conduct"
          target="_blank"
          >社区行为守则 (Code of Conduct)</a
        >
      </div>
      <div>
        <a class="text-decoration-none" href="https://about.cha.fan/docs/report" target="_blank"
          >如何举报不符合规范的内容</a
        >
      </div>
      <div v-if="loggedIn">
        <a class="text-decoration-none" href="https://discord.gg/yFt5QP3zU7" target="_blank"
          >Discord 闲聊群</a
        >
      </div>
      <div v-if="buildInfo" class="caption grey--text">
        <pre style="cursor: pointer" @click="expandDebugInfo = !expandDebugInfo">
v{{ buildInfo.commitHashShort }}</pre
        >
        <v-expand-transition>
          <div v-show="expandDebugInfo">
            Commit:
            <a
              :href="'https://github.com/chafan-dev/chafan-frontend/tree/' + buildInfo.commitHash"
              class="grey--text text-decoration-none"
              target="blank"
              ><code>{{ buildInfo.commitHashShort }}</code></a
            >
            <br />
            Branch:
            <a
              :href="'https://github.com/chafan-dev/chafan-frontend/tree/' + buildInfo.branch"
              class="grey--text text-decoration-none"
              >{{ buildInfo.branch }}</a
            >
            <br />
            Commited at {{ $dayjs(buildInfo.commitTime).fromNow() }}
          </div>
        </v-expand-transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IQuestionPreview, IUserSiteProfile } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import QuestionLink from '@/components/question/QuestionLink.vue';
import CreateSiteCard from '@/components/CreateSiteCard.vue';
import { Component, Vue } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiDiscovery } from '@/api/discovery';
import { apiMe } from '@/api/me';
import { readIsLoggedIn, readToken } from '@/store/main/getters';

import MoreIcon from '@/components/icons/MoreIcon.vue';
import { buildInfo } from '@/env';

@Component({
  components: { SiteBtn, QuestionLink, CreateSiteCard, MoreIcon },
})
export default class HomeSideCard extends Vue {
  private siteProfiles: IUserSiteProfile[] = [];
  private visibleSiteProfiles: IUserSiteProfile[] = [];
  private showAllSiteProfilesDialog = false;
  private showAllSiteProfilesDialogButton = false;
  private loadingPinnedQuestions = true;
  private questions: IQuestionPreview[] | null = null;
  private loadingSites = true;
  private expandDebugInfo = false;

  private showCreateSiteDialog = false;

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  get buildInfo() {
    return buildInfo;
  }

  public async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.questions = (await apiDiscovery.getPinnedQuestions()).data;
      this.loadingPinnedQuestions = false;
      const token = readToken(this.$store);
      if (token) {
        this.siteProfiles = (await apiMe.getUserSiteProfiles(token)).data;
        if (!this.$vuetify.breakpoint.mdAndUp) {
          this.visibleSiteProfiles = this.siteProfiles.slice(0, 9);
          if (this.visibleSiteProfiles.length < this.siteProfiles.length) {
            this.showAllSiteProfilesDialogButton = true;
          }
        } else {
          this.visibleSiteProfiles = this.siteProfiles;
        }
      }
      this.loadingSites = false;
    });
  }
}
</script>
