<template>
  <div>
    <v-navigation-drawer
      v-if="userProfile"
      v-model="showDrawer"
      :mini-variant="miniDrawer"
      app
      fixed
      temporary
    >
      <v-row class="d-flex flex-column fill-height">
        <v-list>
          <v-list-subheader> 主菜单 </v-list-subheader>
          <v-list-item to="/">
            <template v-slot:prepend>
              <AppIcon name="Home"  />
            </template>
            <v-list-item-title>首页</v-list-item-title>
          </v-list-item>
          <v-list-item to="/dashboard">
            <template v-slot:prepend>
              <AppIcon name="Dashboard"  />
            </template>
            <v-list-item-title>用户中心</v-list-item-title>
          </v-list-item>
          <v-list-item to="/profile/edit">
            <template v-slot:prepend>
              <AppIcon name="Edit"  />
            </template>
            <v-list-item-title>编辑我的主页</v-list-item-title>
          </v-list-item>
          <v-list-item to="/security">
            <template v-slot:prepend>
              <AppIcon name="Password"  />
            </template>
            <v-list-item-title>安全中心</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-divider />

        <v-list v-show="hasModeratedSites">
          <v-list-subheader>管理</v-list-subheader>
          <v-list-item to="/moderation">
            <v-list-item-title>圈子管理</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-spacer />
        <v-list>
          <v-list-item @click="logout">
            <template v-slot:prepend>
              <AppIcon name="Logout"  />
            </template>
            <v-list-item-title>登出</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-row>
    </v-navigation-drawer>
    <v-app-bar color="primary" dark height="55">
      <div class="d-flex justify-space-between app-bar-inner">
        <div class="d-flex align-center">
          <v-app-bar-nav-icon
            v-if="userProfile"
            :class="{ 'thin-btn': !display.mdAndUp }"
            @click="switchShowDrawer"
          />
          <div v-if="display.mdAndUp">
            <router-link class="text-white text-h6 text-decoration-none" to="/"
              >{{ appName }}
            </router-link>
          </div>

          <v-btn v-else active-class="opacity-none" icon to="/">
            <AppIcon name="Home"  />
          </v-btn>
        </div>

        <div v-if="userProfile" class="d-flex align-center search-box">
          <SearchBox />
        </div>

        <div>
          <Notifications v-if="userProfile" :user-profile="userProfile" />

          <template v-if="!userProfile">
            <AppIcon name="Feedback" class="ml-1" @click="prepareFeedbackForm"  />
            <v-btn class="ml-2" variant="outlined" @click="showLoginPrompt"> 登录</v-btn>
          </template>

          <v-dialog v-model="showFeedbackForm" max-width="500">
            <Form v-slot="{ handleSubmit, meta, resetForm }">
              <v-card>
                <v-card-title> 你的反馈会让「茶饭」变得更好！</v-card-title>
                <v-card-text>
                  <div>
                    <div v-if="feedbackScreenshotUrl">
                      <Field v-slot="{ errors }" name="description" rules="required" v-model="feedbackText">
                        <v-textarea v-model="feedbackText" label="问题/建议描述（必填）" rows="3" :error-messages="errors" />
                      </Field>
                      <template v-if="userProfile === null">
                        <Field v-slot="{ errors }" name="email" rules="required|email" v-model="feedbackEmail">
                          <v-text-field v-model="feedbackEmail" label="Email（必填）" :error-messages="errors" />
                        </Field>
                      </template>
                      <v-switch v-model="feedbackIncludesScreenshot" label="包含截图？" />
                      <v-btn
                        color="info"
                        variant="outlined"
                        size="small"
                        @click="showFeedbackScreenshot = !showFeedbackScreenshot"
                      >
                        截图预览
                      </v-btn>
                      <v-expand-transition>
                        <v-img
                          v-show="showFeedbackScreenshot"
                          :src="feedbackScreenshotUrl"
                          class="ma-2"
                        />
                      </v-expand-transition>
                    </div>
                    <span v-else>
                      生成截图中...
                      <v-progress-circular indeterminate size="20" />
                    </span>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <a
                    class="text-decoration-none"
                    href="https://about.cha.fan/docs/troubleshooting/"
                    target="_blank"
                  >
                    常见问题及解决方法
                  </a>
                  <v-spacer />
                  <v-btn variant="tonal" size="small" @click="cancelFeedbackForm(resetForm)"> 取消</v-btn>
                  <v-btn
                    :disabled="!meta.valid || sendingFeedback"
                    color="primary"
                    variant="flat"
                    size="small"
                    @click="handleSubmit(submitFeedbackForm)"
                  >
                    提交
                    <v-progress-circular
                      size="20"
                      color="primary"
                      v-if="sendingFeedback"
                      indeterminate
                    />
                  </v-btn>
                </v-card-actions>
              </v-card>
            </Form>
          </v-dialog>

          <v-menu location="start"
            v-if="userProfile"
            v-model="showTopMenu"
            transition="slide-x-transition"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                id="main-menu-avatar-btn"
                v-bind="props"
                :class="{ 'thin-btn': !display.mdAndUp }"
                icon
              >
                <Avatar
                  v-if="userProfile && (userProfile.avatar_url || isDev)"
                  :userPreview="userProfile"
                  color="primary"
                />
                <AppIcon name="Account" v-else  />
              </v-btn>
            </template>

            <v-list density="compact" min-width="48" nav id="main-menu">
              <v-list-item
                v-for="item in accountItems"
                :key="item.text"
                :to="item.toRequiresUserProfile ? item.to(userProfile) : item.to"
                link
              >
                <template v-slot:prepend>
                  <component v-bind:is="item.icon" />
                </template>
                <v-list-item-title>
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item>

              <v-list-item @click="prepareFeedbackForm">
                <template v-slot:prepend>
                  <v-progress-circular
                    size="20"
                    v-if="prepareFeedbackFormIntermediate"
                    color="primary"
                    indeterminate
                  />
                  <AppIcon name="Feedback" v-else  />
                </template>
                <v-list-item-title> 问题反馈 </v-list-item-title>
              </v-list-item>

              <v-divider />

              <v-list-item @click="logout">
                <template v-slot:prepend>
                  <AppIcon name="Logout"  />
                </template>
                <v-list-item-title>登出</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Form, Field } from 'vee-validate';
import { useDisplay } from 'vuetify';
import { useRoute, useRouter } from 'vue-router';

import { appName } from '@/env';
import { isDev } from '@/utils';
import { useMainStore } from '@/stores/main';
import { useUiStore } from '@/stores/ui';

import Avatar from '@/components/Avatar.vue';
import Event from '@/components/Event.vue';
import SearchBox from '@/components/SearchBox.vue';
import { IUserProfile } from '@/interfaces';
import { api2 } from '@/api2';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import html2canvas from 'html2canvas';
import Notifications from '@/components/Notifications.vue';
import { useAuth } from '@/composables';
import AppIcon from '@/components/icons/AppIcon.vue';
import { useNotificationStore } from '@/stores/notifications';
const display = useDisplay();
const store = useMainStore();
const ui = useUiStore();

const route = useRoute();
const router = useRouter();
const { token, userProfile } = useAuth();

const accountItems = [
  {
    icon: 'DashboardIcon',
    text: '个人中心',
    to: '/dashboard',
  },
  {
    icon: 'ProfileIcon',
    text: '我的主页',
    toRequiresUserProfile: true,
    to: (up: IUserProfile) => `/users/${up.handle}`,
  },
];

const showTopMenu = ref(false);
const showFeedbackForm = ref(false);
const feedbackScreenshotUrl = ref<string | null>(null);
const feedbackIncludesScreenshot = ref(true);
const showFeedbackScreenshot = ref(false);
const feedbackText = ref('');
const feedbackEmail = ref('');
const sendingFeedback = ref(false);
const prepareFeedbackFormIntermediate = ref(false);

const miniDrawer = computed(() => ui.dashboardMiniDrawer);

const showDrawer = computed({
  get() {
    return ui.dashboardShowDrawer;
  },
  set(value: boolean) {
    ui.dashboardShowDrawer = value;
  },
});

const hasModeratedSites = computed(() => store.hasModeratedSites);

// Watch for route changes to update title
watch(
  () => route.fullPath,
  () => {
    if (route.meta && route.meta.title) {
      document.title = route.meta.title as string;
    } else if (import.meta.env.VITE_APP_NAME) {
      document.title = import.meta.env.VITE_APP_NAME;
    }
  },
  { immediate: true }
);

function showLoginPrompt() {
  ui.showLoginPrompt = true;
}

function switchShowDrawer() {
  ui.dashboardShowDrawer = !ui.dashboardShowDrawer;
}

function switchMiniDrawer() {
  ui.dashboardMiniDrawer = !ui.dashboardMiniDrawer;
}

async function logout() {
  showDrawer.value = false;
  await store.userLogOut();
  router.go(0);
}

function prepareFeedbackForm() {
  prepareFeedbackFormIntermediate.value = true;
  showTopMenu.value = false;
  setTimeout(() => {
    html2canvas(document.body).then((canvas) => {
      showFeedbackForm.value = true;
      feedbackScreenshotUrl.value = canvas.toDataURL('image/jpeg', 0.5);
      prepareFeedbackFormIntermediate.value = false;
    });
  }, 100);
}

async function submitFeedbackForm() {
  sendingFeedback.value = true;
  const formData = new FormData();
  formData.append('description', feedbackText.value);
  if (feedbackIncludesScreenshot.value) {
    const blob = await (await fetch(feedbackScreenshotUrl.value!)).blob();
    formData.append('file', blob);
  }
  if (!userProfile.value) {
    formData.append('email', feedbackEmail.value);
  }
  formData.append('location_url', route.fullPath);
  await api2.uploadFeedback(token.value, formData);
  useNotificationStore().push({
    color: 'success',
    content: '反馈已成功提交',
  });
  sendingFeedback.value = false;
  showFeedbackForm.value = false;
}

function cancelFeedbackForm(resetForm: () => void) {
  showFeedbackForm.value = false;
  resetForm();
}
</script>
