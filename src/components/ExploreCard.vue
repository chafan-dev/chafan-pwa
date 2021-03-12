<template>
  <div>
    <div class="mb-2">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="headline">
          <div class="headline primary--text">{{ $t('My Circles') }}</div>
        </div>

        <div class="d-flex mt-1">
          <!-- NOTE: /sites is a list of all circles, is not same as my circles for now -->
          <v-btn small depressed class="primary mr-1" to="/sites">
            {{ $t('查看所有圈子') }}
          </v-btn>
          <v-btn small depressed @click="showCreateSiteDialog = true">{{ $t('创建圈子') }}</v-btn>

          <v-dialog max-width="500" v-model="showCreateSiteDialog">
            <CreateSiteCard />
          </v-dialog>
        </div>
      </div>

      <v-skeleton-loader type="paragraph" v-if="loadingSites" />
      <div v-else>
        <!-- TODO: rank/compute recently used sites. -->
        <SiteBtn
          :site="profile.site"
          v-for="profile in visibleSiteProfiles"
          :key="profile.site.uuid"
        />
        <v-btn
          small
          color="info"
          depressed
          class="mt-1"
          v-if="showAllSiteProfilesDialogButton"
          @click="showAllSiteProfilesDialog = true"
        >
          <MoreIcon class="mr-1" />{{ $t('More') }}
        </v-btn>
        <v-dialog v-model="showAllSiteProfilesDialog">
          <v-card>
            <v-card-title>{{ $t('My Circles') }}</v-card-title>
            <v-card-text>
              <SiteBtn
                :site="profile.site"
                v-for="profile in siteProfiles"
                :key="profile.site.uuid"
              />
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>
    </div>

    <v-divider />
    <div class="my-3">
      <div class="headline">{{ $t('Pinned questions') }}</div>
      <v-skeleton-loader type="paragraph" v-if="questions === null" />
      <ul v-else class="my-3">
        <li v-for="question in questions" :key="question.uuid">
          <QuestionLink :questionPreview="question" />
        </li>
      </ul>
    </div>

    <v-divider />
    <div class="py-3">
      <div>
        <a class="text-decoration-none" href="https://about.cha.fan" target="_blank">关于 Chafan</a>
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
      <div class="caption grey--text" v-if="buildInfo">
        基于提交
        <a
          class="grey--text text-decoration-none"
          :href="'https://github.com/chafan-dev/chafan-frontend/tree/' + buildInfo.commitHash"
          target="blank"
          ><code>{{ buildInfo.commitHashShort }}</code></a
        >构建
        <br />
        位于分支
        <a
          class="grey--text text-decoration-none"
          :href="'https://github.com/chafan-dev/chafan-frontend/tree/' + buildInfo.branch"
          >{{ buildInfo.branch }}</a
        >
        <br />
        提交于 {{ buildInfo.commitTime }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IQuestionPreview, IUserSiteProfile } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import QuestionLink from '@/components/QuestionLink.vue';
import CreateSiteCard from '@/components/CreateSiteCard.vue';
import { Component, Vue } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { api2 } from '@/api2';
import { apiMe } from '@/api/me';
import { readIsLoggedIn } from '@/store/main/getters';

import MoreIcon from '@/components/icons/MoreIcon.vue';
import { buildInfo } from '@/env';

@Component({
  components: { SiteBtn, QuestionLink, CreateSiteCard, MoreIcon },
})
export default class ExploreCard extends Vue {
  private siteProfiles: IUserSiteProfile[] = [];
  private visibleSiteProfiles: IUserSiteProfile[] = [];
  private showAllSiteProfilesDialog = false;
  private showAllSiteProfilesDialogButton = false;
  private questions: IQuestionPreview[] | null = null;
  private loadingSites = true;

  private showCreateSiteDialog = false;

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  get buildInfo() {
    return buildInfo;
  }

  public async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.questions = (await api2.getQuestionsAtHome()).data;
      if (this.$store.state.main.token) {
        this.siteProfiles = (await apiMe.getUserSiteProfiles(this.$store.state.main.token)).data;
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
