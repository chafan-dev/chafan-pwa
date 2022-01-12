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
      <v-layout column fill-height>
        <v-list>
          <v-subheader> 主菜单 </v-subheader>
          <v-list-item to="/">
            <v-list-item-action>
              <HomeIcon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>首页</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/dashboard">
            <v-list-item-action>
              <DashboardIcon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>用户中心</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/profile/edit">
            <v-list-item-action>
              <EditIcon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>编辑我的主页</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/security">
            <v-list-item-action>
              <PasswordIcon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>安全中心</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider />

        <v-list v-show="hasModeratedSites" subheader>
          <v-subheader>管理</v-subheader>
          <v-list-item to="/moderation">
            <v-list-item-content>
              <v-list-item-title>圈子管理</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <div v-if="isModerator" class="ma-2">
          <v-switch v-model="userMode" label="普通用户模式" @change="switchUseMode" />
        </div>

        <v-spacer />
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-action>
              <LogoutIcon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>登出</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-layout>
    </v-navigation-drawer>
    <v-app-bar color="primary" dark height="55">
      <div class="d-flex justify-space-between app-bar-inner">
        <div class="d-flex align-center">
          <v-app-bar-nav-icon
            v-if="userProfile"
            :class="{ 'thin-btn': !$vuetify.breakpoint.mdAndUp }"
            @click="switchShowDrawer"
          />
          <div v-if="$vuetify.breakpoint.mdAndUp">
            <router-link class="white--text title text-decoration-none" to="/"
              >{{ appName }}
            </router-link>
          </div>

          <v-btn v-else active-class="opacity-none" icon to="/">
            <HomeIcon />
          </v-btn>
        </div>

        <div v-if="userProfile" class="d-flex align-center search-box">
          <SearchBox />
        </div>

        <div>
          <Notifications v-if="userProfile" :user-profile="userProfile" />

          <template v-if="!userProfile">
            <FeedbackIcon class="ml-1" @click="prepareFeedbackForm" />
            <v-btn class="ml-2" depressed outlined @click="showLoginPrompt"> 登录</v-btn>
          </template>

          <v-dialog v-model="showFeedbackForm" max-width="500">
            <ValidationObserver v-slot="{ handleSubmit, valid, reset }">
              <v-card>
                <v-card-title> 你的反馈会让「茶饭」变得更好！</v-card-title>
                <v-card-text>
                  <div>
                    <div v-if="feedbackScreenshotUrl">
                      <ValidationProvider v-slot="{ errors }" name="description" rules="required">
                        <v-textarea v-model="feedbackText" label="问题/建议描述（必填）" rows="3" />
                        <span class="error--text">{{ errors[0] }}</span>
                      </ValidationProvider>
                      <template v-if="userProfile === null">
                        <ValidationProvider v-slot="{ errors }" name="email" rules="required|email">
                          <v-text-field v-model="feedbackEmail" label="Email（必填）" />
                          <span class="error--text">{{ errors[0] }}</span>
                        </ValidationProvider>
                      </template>
                      <v-switch v-model="feedbackIncludesScreenshot" label="包含截图？" />
                      <v-btn
                        depressed
                        info
                        outlined
                        small
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
                  <v-btn depressed small @click="cancelFeedbackForm(reset)"> 取消</v-btn>
                  <v-btn
                    :disabled="!valid || sendingFeedback"
                    color="primary"
                    depressed
                    small
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
            </ValidationObserver>
          </v-dialog>

          <v-menu
            v-if="userProfile"
            v-model="showTopMenu"
            left
            offset-y
            transition="slide-x-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                id="main-menu-avatar-btn"
                v-bind="attrs"
                v-on="on"
                :class="{ 'thin-btn': !$vuetify.breakpoint.mdAndUp }"
                icon
              >
                <Avatar
                  v-if="userProfile && (userProfile.avatar_url || isDev)"
                  :userPreview="userProfile"
                  color="primary"
                />
                <AccountIcon v-else />
              </v-btn>
            </template>

            <v-list dense min-width="48" nav id="main-menu">
              <v-list-item
                v-for="item in accountItems"
                :key="item.text"
                :to="item.toRequiresUserProfile ? item.to(userProfile) : item.to"
                link
              >
                <v-list-item-icon>
                  <component v-bind:is="item.icon" />
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item @click="prepareFeedbackForm">
                <v-list-item-icon>
                  <v-progress-circular
                    size="20"
                    v-if="prepareFeedbackFormIntermediate"
                    color="primary"
                    indeterminate
                  />
                  <FeedbackIcon v-else />
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title> 问题反馈 </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-divider />

              <v-list-item @click="logout">
                <v-list-item-icon>
                  <LogoutIcon />
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>登出</v-list-item-title>
                </v-list-item-content>
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

<script lang="ts">
import { Component } from 'vue-property-decorator';

import { appName } from '@/env';
import {
  readDashboardMiniDrawer,
  readDashboardShowDrawer,
  readHasModeratedSites,
  readModeratedSites,
  readUserMode,
} from '@/store/main/getters';
import {
  commitAddNotification,
  commitSetDashboardMiniDrawer,
  commitSetDashboardShowDrawer,
  commitSetShowLoginPrompt,
  commitSetUserMode,
} from '@/store/main/mutations';
import { dispatchUserLogOut } from '@/store/main/actions';

import ProfileIcon from '@/components/icons/ProfileIcon.vue';
import MenuIcon from '@/components/icons/MenuIcon.vue';
import MuteNotificationIcon from '@/components/icons/MuteNotificationIcon.vue';
import NotificationIcon from '@/components/icons/NotificationIcon.vue';
import EmailIcon from '@/components/icons/EmailIcon.vue';
import LogoutIcon from '@/components/icons/LogoutIcon.vue';
import DashboardIcon from '@/components/icons/DashboardIcon.vue';
import HomeIcon from '@/components/icons/HomeIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import PasswordIcon from '@/components/icons/PasswordIcon.vue';

import Avatar from '@/components/Avatar.vue';
import Event from '@/components/Event.vue';
import SearchBox from '@/components/SearchBox.vue';
import { IUserProfile } from '@/interfaces';
import { api2 } from '@/api2';
import AccountIcon from '@/components/icons/AccountIcon.vue';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import html2canvas from 'html2canvas';
import FeedbackIcon from '@/components/icons/FeedbackIcon.vue';
import Notifications from '@/components/Notifications.vue';
import { CVue } from '@/common';

const routeGuardMain = async (to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  } else if (process.env.VUE_APP_NAME) {
    document.title = process.env.VUE_APP_NAME;
  }
  next();
};

@Component({
  components: {
    Notifications,
    FeedbackIcon,
    BaseCard,
    CreateQuestionForm,
    AccountIcon,
    SearchBox,
    Event,
    Avatar,
    EditIcon,
    PasswordIcon,
    EmailIcon,
    ProfileIcon,
    MenuIcon,
    MuteNotificationIcon,
    NotificationIcon,
    LogoutIcon,
    DashboardIcon,
    HomeIcon,
  },
})
export default class Main extends CVue {
  private appName = appName;

  private readonly accountItems = [
    {
      icon: 'DashboardIcon',
      text: '个人中心',
      to: '/dashboard',
    },
    {
      icon: 'ProfileIcon',
      text: '我的主页',
      toRequiresUserProfile: true,
      to: (userProfile: IUserProfile) => `/users/${userProfile.handle}`,
    },
  ];
  private showTopMenu = false;
  private showFeedbackForm = false;
  private feedbackScreenshotUrl: string | null = null;
  private feedbackIncludesScreenshot = true;
  private showFeedbackScreenshot = false;
  private feedbackText = '';
  private feedbackEmail = '';
  private sendingFeedback = false;

  get miniDrawer() {
    return readDashboardMiniDrawer(this.$store);
  }

  get showDrawer() {
    return readDashboardShowDrawer(this.$store);
  }

  set showDrawer(value) {
    commitSetDashboardShowDrawer(this.$store, value);
  }

  get isModerator() {
    const sites = readModeratedSites(this.$store);
    return sites !== null && sites.length > 0;
  }

  get userMode() {
    return readUserMode(this.$store);
  }

  private get hasModeratedSites() {
    return readHasModeratedSites(this.$store);
  }

  public beforeRouteEnter(to, from, next) {
    routeGuardMain(to, from, next);
  }

  public beforeRouteUpdate(to, from, next) {
    routeGuardMain(to, from, next);
  }

  private showLoginPrompt() {
    commitSetShowLoginPrompt(this.$store, true);
  }

  private switchShowDrawer() {
    commitSetDashboardShowDrawer(this.$store, !readDashboardShowDrawer(this.$store));
  }

  private switchMiniDrawer() {
    commitSetDashboardMiniDrawer(this.$store, !readDashboardMiniDrawer(this.$store));
  }

  private async logout() {
    this.showDrawer = false;
    await dispatchUserLogOut(this.$store);
    this.$router.go(0);
  }

  private switchUseMode() {
    commitSetUserMode(this.$store, this.userMode);
  }

  private prepareFeedbackFormIntermediate = false;
  private prepareFeedbackForm() {
    this.prepareFeedbackFormIntermediate = true;
    this.showTopMenu = false;
    setTimeout(() => {
      html2canvas(document.body).then((canvas) => {
        this.showFeedbackForm = true;
        this.feedbackScreenshotUrl = canvas.toDataURL('image/jpeg', 0.5);
        this.prepareFeedbackFormIntermediate = false;
      });
    }, 100);
  }

  private async submitFeedbackForm() {
    this.sendingFeedback = true;
    const formData = new FormData();
    formData.append('description', this.feedbackText);
    if (this.feedbackIncludesScreenshot) {
      const blob = await (await fetch(this.feedbackScreenshotUrl!)).blob();
      formData.append('file', blob);
    }
    if (!this.userProfile) {
      formData.append('email', this.feedbackEmail);
    }
    formData.append('location_url', this.$route.fullPath);
    await api2.uploadFeedback(this.token, formData);
    commitAddNotification(this.$store, {
      color: 'success',
      content: '反馈已成功提交',
    });
    this.sendingFeedback = false;
    this.showFeedbackForm = false;
  }

  private cancelFeedbackForm(reset) {
    this.showFeedbackForm = false;
    reset();
  }
}
</script>
