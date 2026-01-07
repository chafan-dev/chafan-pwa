<template>
  <div>
    <div class="mb-2">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="headline">
          <div class="headline primary--text">我的圈子</div>
        </div>

        <div class="d-flex mt-1">
          <v-btn depressed small @click="showCreateSiteDialog = true">创建圈子</v-btn>

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
            更多
          </v-btn>
          <v-btn class="mt-1" color="info" depressed outlined small to="/explore?tab=sites">
            所有圈子
          </v-btn>
        </div>
        <v-dialog v-model="showAllSiteProfilesDialog">
          <v-card>
            <v-card-title>我的圈子</v-card-title>
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
      <div class="headline">置顶问题</div>
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
        <a class="text-decoration-none" href="https://status.cha.fan/" target="_blank"
          >茶饭开发日志</a
        >
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
      <div>
        <a class="text-decoration-none" href="https://discord.gg/WaKAZ8dEr9" target="_blank"
          >Discord 闲聊群</a
        >
      </div>
      <div v-if="buildInfo" class="caption grey--text">
        <pre class="cursor-pointer" @click="expandDebugInfo = !expandDebugInfo">
v{{ buildInfo.commitHashShort }}</pre
        >
        <v-expand-transition>
          <div v-show="expandDebugInfo">
            Commited at {{ $dayjs(buildInfo.commitTime).fromNow() }}
          </div>
        </v-expand-transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IQuestionPreview, IUserSiteProfile } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import QuestionLink from '@/components/question/QuestionLink.vue';
import CreateSiteCard from '@/components/CreateSiteCard.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiDiscovery } from '@/api/discovery';
import { apiMe } from '@/api/me';
import MoreIcon from '@/components/icons/MoreIcon.vue';
import { buildInfo } from '@/env';
import { useAuth, useResponsive } from '@/composables';
import store from '@/store';

const { token } = useAuth();
const { isDesktop } = useResponsive();

const siteProfiles = ref<IUserSiteProfile[]>([]);
const visibleSiteProfiles = ref<IUserSiteProfile[]>([]);
const showAllSiteProfilesDialog = ref(false);
const showAllSiteProfilesDialogButton = ref(false);
const loadingPinnedQuestions = ref(true);
const questions = ref<IQuestionPreview[] | null>(null);
const loadingSites = ref(true);
const expandDebugInfo = ref(false);
const showCreateSiteDialog = ref(false);

onMounted(async () => {
  await dispatchCaptureApiError(store, async () => {
    questions.value = (await apiDiscovery.getPinnedQuestions()).data;
    loadingPinnedQuestions.value = false;
    if (token.value) {
      siteProfiles.value = (await apiMe.getUserSiteProfiles(token.value)).data;
      if (!isDesktop.value) {
        visibleSiteProfiles.value = siteProfiles.value.slice(0, 9);
        if (visibleSiteProfiles.value.length < siteProfiles.value.length) {
          showAllSiteProfilesDialogButton.value = true;
        }
      } else {
        visibleSiteProfiles.value = siteProfiles.value;
      }
    }
    loadingSites.value = false;
  });
});
</script>
