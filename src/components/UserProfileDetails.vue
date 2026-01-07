<template>
  <div>
    <template>
      <div v-if="userPublic.about_content">
        <span class="subheading secondary--text text--lighten-3">关于我：</span>
        <Viewer :content="userPublic.about_content" />
      </div>

      <div
        v-if="
          userPublic.homepage_url ||
          userPublic.github_username ||
          userPublic.twitter_username ||
          userPublic.linkedin_url ||
          userPublic.zhihu_url
        "
        class="my-3"
      >
        <span class="subheading secondary--text text--lighten-3"> 链接： </span>
        <a
          v-if="userPublic.homepage_url"
          :href="userPublic.homepage_url"
          class="text-decoration-none"
          target="_blank"
        >
          <WebIcon />
          个人主页
        </a>
        <a
          v-if="userPublic.github_username"
          :href="canonicalURLfromUsername(userPublic.github_username, 'github.com')"
          class="text-decoration-none"
          target="_blank"
        >
          <GithubIcon />
          Github
        </a>
        <a
          v-if="userPublic.twitter_username"
          :href="canonicalURLfromUsername(userPublic.twitter_username, 'twitter.com')"
          class="text-decoration-none"
          target="_blank"
        >
          <TwitterIcon />
          Twitter
        </a>
        <a
          v-if="userPublic.linkedin_url"
          :href="userPublic.linkedin_url"
          class="text-decoration-none"
          target="_blank"
        >
          <LinkedinIcon />
          Linkedin
        </a>
        <a
          v-if="userPublic.zhihu_url"
          :href="userPublic.zhihu_url"
          class="text-decoration-none"
          target="_blank"
        >
          <ZhihuIcon />
          知乎
        </a>
      </div>

      <template v-if="userPublic.profession_topics && userPublic.profession_topics.length > 0">
        <div class="my-3">
          <div class="subheading secondary--text text--lighten-3">所在行业</div>
          <div>
            <v-chip-group :column="!isDesktop">
              <TopicChip
                v-for="topic in userPublic.profession_topics"
                :topic="topic"
                :key="topic.uuid"
              />
            </v-chip-group>
          </div>
        </div>
      </template>

      <template v-if="eduExps && eduExps.length > 0">
        <div class="my-3">
          <div class="subheading secondary--text text--lighten-3">教育经历</div>
          <EduExp
            v-for="(eduExp, index) in eduExps"
            :key="'edu-' + index"
            :compact="true"
            :major="eduExp.major"
            :graduate-year="eduExp.graduate_year"
            :enroll-year="eduExp.enroll_year"
            :level-name="eduExp.level"
            :school-name="eduExp.school_topic.name"
          />
        </div>
      </template>
      <v-skeleton-loader v-else-if="eduExps === null && loggedIn" type="text" />

      <template v-if="workExps && workExps.length > 0">
        <div class="my-3">
          <div class="subheading secondary--text text--lighten-3">工作经历</div>
          <WorkExp
            v-for="(workExp, index) in workExps"
            :key="'work-' + index"
            :compact="true"
            :position-name="workExp.position_topic.name"
            :company-name="workExp.company_topic.name"
          />
        </div>
      </template>
      <v-skeleton-loader v-else-if="workExps === null && loggedIn" type="text" />

      <div
        v-if="userPublic.residency_topics && userPublic.residency_topics.length > 0"
        class="my-3"
      >
        <div class="subheading secondary--text text--lighten-3">居住过的地方</div>
        <div>
          <v-chip-group :column="!isDesktop">
            <TopicChip
              v-for="topic in userPublic.residency_topics"
              :topic="topic"
              :key="topic.uuid"
            />
          </v-chip-group>
        </div>
      </div>

      <template v-if="sites !== null">
        <div v-if="sites.length > 0" class="my-3">
          <div>
            <div class="subheading secondary--text text--lighten-3 mr-2">加入的圈子：</div>
            <SiteBtn v-for="site in sites" :key="site.uuid" :site="site" />
          </div>
        </div>
      </template>
      <v-skeleton-loader v-else-if="loggedIn" type="text" />

      <div
        v-if="userPublic.subscribed_topics && userPublic.subscribed_topics.length > 0"
        class="my-3"
      >
        <div class="subheading secondary--text text--lighten-3">关注的话题：</div>
        <v-chip-group>
          <TopicChip
            v-for="topic in userPublic.subscribed_topics"
            :topic="topic"
            :key="topic.uuid"
            more-margin
          />
        </v-chip-group>
      </div>

      <div class="pt-2">
        <span class="subheading secondary--text text--lighten-3">加入茶饭的日子：</span>
        <span>{{ $dayjs.utc(userPublic.created_at).local().format('YYYY-MM-DD') }}</span>
      </div>
      <div class="my-2" v-if="userPublic.contributions && userPublic.contributions.length > 0">
        <ContribGraphs :data="userPublic.contributions" />
      </div>
    </template>

    <div
      :class="{
        'd-flex': isDesktop,
        'text-center': !isDesktop,
      }"
      class="mt-1"
    >
      <v-spacer :class="{ 'mb-3': !isDesktop }" />
      <v-btn
        v-if="currentUserId === userPublic.uuid"
        color="primary"
        depressed
        small
        to="/profile/edit"
      >
        编辑
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  ISite,
  IUserEducationExperience,
  IUserPublic,
  IUserWorkExperience,
} from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import TwitterIcon from '@/components/icons/TwitterIcon.vue';
import WebIcon from '@/components/icons/WebIcon.vue';
import GithubIcon from '@/components/icons/GithubIcon.vue';
import LinkedinIcon from '@/components/icons/LinkedinIcon.vue';
import { apiPeople } from '@/api/people';
import EduExp from '@/components/EduExp.vue';
import WorkExp from '@/components/WorkExp.vue';
import ZhihuIcon from '@/components/icons/ZhihuIcon.vue';
import TopicChip from '@/components/widgets/TopicChip.vue';
import ContribGraphs from '@/components/widgets/ContribGraphs.vue';
import Viewer from '@/components/Viewer.vue';
import { useAuth, useResponsive } from '@/composables';

const props = defineProps<{
  userPublic: IUserPublic;
}>();

const { token, loggedIn } = useAuth();
const { isDesktop } = useResponsive();

const currentUserId = useAuth().userProfile.value?.uuid;

const eduExps = ref<IUserEducationExperience[] | null>(null);
const workExps = ref<IUserWorkExperience[] | null>(null);
const sites = ref<ISite[] | null>(null);

onMounted(async () => {
  if (loggedIn.value) {
    eduExps.value = props.userPublic.edu_exps
      ? props.userPublic.edu_exps
      : (await apiPeople.getUserEducationExperiences(token.value, props.userPublic.uuid)).data;
    workExps.value = props.userPublic.work_exps
      ? props.userPublic.work_exps
      : (await apiPeople.getUserWorkExperiences(token.value, props.userPublic.uuid)).data;
    let userSiteProfiles = (await apiPeople.getUserSiteProfiles(token.value, props.userPublic.uuid))
      .data;
    sites.value = await Promise.all(userSiteProfiles.map((p) => p.site));
  }
});

function canonicalURLfromUsername(username: string, domain: string) {
  if (username.startsWith(domain)) {
    return 'https://' + username;
  } else if (username.includes(domain)) {
    return username;
  } else {
    return 'https://' + domain + '/' + username;
  }
}
</script>
