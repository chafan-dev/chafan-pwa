<template>
  <div>
    <v-navigation-drawer
      temporary
      :mini-variant="miniDrawer"
      v-model="showDrawer"
      fixed
      app
      v-if="userProfile"
    >
      <v-layout column fill-height>
        <v-list>
          <v-subheader>
            {{ $t('Main menu') }}
          </v-subheader>
          <v-list-item to="/">
            <v-list-item-action>
              <HomeIcon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t('Home') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/dashboard">
            <v-list-item-action>
              <DashboardIcon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t('Dashboard') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/profile/edit">
            <v-list-item-action>
              <EditIcon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t('Edit Profile') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/security">
            <v-list-item-action>
              <PasswordIcon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t('Security') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider />

        <v-list subheader v-show="hasModeratedSites">
          <v-subheader>Moderation</v-subheader>
          <v-list-item to="/moderation">
            <v-list-item-content>
              <v-list-item-title>圈子管理</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <div v-if="isModerator" class="ma-2">
          <v-switch :label="$t('普通用户模式')" @change="switchUseMode" v-model="userMode" />
        </div>

        <v-spacer />
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-action>
              <LogoutIcon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t('Logout') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-layout>
    </v-navigation-drawer>
    <v-app-bar dark color="primary">
      <div class="d-flex justify-space-between app-bar-inner">
        <div class="d-flex align-center">
          <v-app-bar-nav-icon
            @click="switchShowDrawer"
            :class="{ 'thin-btn': !$vuetify.breakpoint.mdAndUp }"
            v-if="userProfile"
          />
          <div v-if="$vuetify.breakpoint.mdAndUp">
            <router-link class="white--text title text-decoration-none" to="/">{{
              appName
            }}</router-link>
          </div>

          <v-btn icon v-else to="/" active-class="opacity-none">
            <HomeIcon />
          </v-btn>
        </div>

        <div class="d-flex align-center search-box" v-if="userProfile">
          <SearchBox />
        </div>

        <div>
          <LangPicker />

          <!-- Notifications -->
          <v-menu
            :close-on-content-click="false"
            left
            :max-width="Math.min($vuetify.breakpoint.width * 0.9, 600)"
            :min-width="Math.min($vuetify.breakpoint.width * 0.9, 600)"
            v-if="userProfile"
            offset-y
            transition="slide-x-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                icon
                v-bind="attrs"
                v-on="on"
                :class="{ 'thin-btn': !$vuetify.breakpoint.mdAndUp }"
              >
                <v-badge
                  color="green"
                  :content="unreadNotifications.length"
                  v-if="unreadNotifications.length > 0"
                >
                  <NotificationIcon />
                </v-badge>
                <NotificationIcon v-else />
              </v-btn>
            </template>

            <v-card>
              <v-sheet
                class="h-sticky d-flex align-center justify-space-between elevation-1 rounded-t mb-1"
              >
                <v-subheader class="font-weight-bold">
                  {{ $t('未读通知') }}
                </v-subheader>

                <div class="mr-1">
                  <v-btn depressed small @click="readAllNotifs"
                    ><MuteNotificationIcon /> {{ $t('Read all') }}</v-btn
                  >
                </div>
              </v-sheet>

              <div style="max-height: 300px; overflow: auto">
                <v-list>
                  <template v-for="(notif, idx) in unreadNotifications">
                    <v-divider :key="'divider-' + notif.id" class="ma-1" v-if="idx" />

                    <v-list-item :key="notif.id">
                      <Event :event="notif.event" v-if="notif.event" />
                      <v-spacer />
                      <MuteNotificationIcon class="ml-2" @click="readNotif(notif)" />
                    </v-list-item>
                  </template>
                  <div class="text-center mt-2">
                    <v-btn
                      small
                      depressed
                      :disabled="readNotificationsIntermediate"
                      @click="expandReadNotifications"
                    >
                      {{ $t('已读通知') }}
                    </v-btn>
                  </div>
                </v-list>
              </div>
            </v-card>
          </v-menu>

          <v-dialog v-model="showReadNotifications">
            <v-list>
              <v-card-title primary-title>
                <div class="headline primary--text">{{ $t('已读通知') }}</div>
              </v-card-title>
              <v-list-item v-for="notif in readNotifications" :key="notif.id">
                <Event :event="notif.event" v-if="notif.event" />
              </v-list-item>
            </v-list>
          </v-dialog>

          <template v-if="!userProfile">
            <FeedbackIcon @click="prepareFeedbackForm" class="ml-1" />
            <v-btn @click="showLoginPrompt" depressed outlined class="ml-2">
              {{ $t('Login') }}
            </v-btn>
          </template>

          <v-dialog v-model="showFeedbackForm" max-width="500">
            <ValidationObserver v-slot="{ handleSubmit, valid, reset }">
              <v-card>
                <v-card-title>
                  {{ $t('你的反馈会让 Chafan 变得更好') }}
                </v-card-title>
                <v-card-text>
                  <div>
                    <div v-if="feedbackScreenshotUrl">
                      <ValidationProvider name="description" rules="required" v-slot="{ errors }">
                        <v-textarea label="问题/建议描述（必填）" v-model="feedbackText" rows="3" />
                        <span class="error--text">{{ errors[0] }}</span>
                      </ValidationProvider>
                      <template v-if="userProfile === null">
                        <ValidationProvider name="email" rules="required|email" v-slot="{ errors }">
                          <v-text-field label="Email（必填）" v-model="feedbackEmail" />
                          <span class="error--text">{{ errors[0] }}</span>
                        </ValidationProvider>
                      </template>
                      <v-switch label="包含截图？" v-model="feedbackIncludesScreenshot" />
                      <v-btn
                        small
                        depressed
                        info
                        outlined
                        @click="showFeedbackScreenshot = !showFeedbackScreenshot"
                      >
                        {{ $t('截图预览') }}
                      </v-btn>
                      <v-expand-transition>
                        <v-img
                          :src="feedbackScreenshotUrl"
                          v-show="showFeedbackScreenshot"
                          class="ma-2"
                        />
                      </v-expand-transition>
                    </div>
                    <span v-else>
                      {{ $t('生成截图中...') }}
                      <v-progress-circular size="20" indeterminate />
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
                  <v-btn small depressed @click="cancelFeedbackForm(reset)">
                    {{ $t('取消') }}
                  </v-btn>
                  <v-btn
                    small
                    depressed
                    color="primary"
                    @click="handleSubmit(submitFeedbackForm)"
                    :disabled="!valid || sendingFeedback"
                  >
                    {{ $t('提交') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </ValidationObserver>
          </v-dialog>

          <!-- ... menu -->
          <v-menu
            left
            v-if="userProfile"
            offset-y
            transition="slide-x-transition"
            v-model="showTopMenu"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :class="{ 'thin-btn': !$vuetify.breakpoint.mdAndUp }"
                icon
              >
                <Avatar v-if="userProfile && userProfile.avatar_url" :userPreview="userProfile" />
                <AccountIcon v-else />
              </v-btn>
            </template>

            <v-list dense min-width="48" nav>
              <v-list-item
                v-for="item in accountItems"
                :key="item.text"
                :href="item.hrefRequiresUserProfile ? item.href(userProfile) : item.href"
                :to="item.to"
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
                  <FeedbackIcon />
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('问题反馈') }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-divider />

              <v-list-item @click="logout">
                <v-list-item-icon>
                  <LogoutIcon />
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title> {{ $t('Logout') }}</v-list-item-title>
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
import { Vue, Component } from 'vue-property-decorator';

import { appName, wsUrl } from '@/env';
import {
  readDashboardMiniDrawer,
  readHasModeratedSites,
  readDashboardShowDrawer,
  readUserProfile,
  readModeratedSites,
  readUserMode,
} from '@/store/main/getters';
import {
  commitSetDashboardShowDrawer,
  commitSetDashboardMiniDrawer,
  commitSetUserMode,
  commitSetShowLoginPrompt,
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
import LangPicker from '@/components/LangPicker.vue';
import Event from '@/components/Event.vue';
import SearchBox from '@/components/SearchBox.vue';
import { INotification, IUserProfile, IWsUserMsg } from '@/interfaces';
import { api } from '@/api';
import { api2 } from '@/api2';
import { dispatchCaptureApiError } from '@/store/main/actions';
import AccountIcon from '@/components/icons/AccountIcon.vue';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import html2canvas from 'html2canvas';
import FeedbackIcon from '@/components/icons/FeedbackIcon.vue';

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
    FeedbackIcon,
    BaseCard,
    CreateQuestionForm,
    AccountIcon,
    LangPicker,
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
export default class Main extends Vue {
  get miniDrawer() {
    return readDashboardMiniDrawer(this.$store);
  }

  get showDrawer() {
    return readDashboardShowDrawer(this.$store);
  }

  set showDrawer(value) {
    commitSetDashboardShowDrawer(this.$store, value);
  }

  private get hasModeratedSites() {
    return readHasModeratedSites(this.$store);
  }
  private appName = appName;
  private unreadNotifications: INotification[] = [];
  private wsConnection: WebSocket | null = null;

  private readNotifIntermediate = false;

  private readNotificationsIntermediate = false;
  private showReadNotifications = false;
  private readNotifications: INotification[] | null = null;
  get userProfile() {
    return readUserProfile(this.$store);
  }
  get isModerator() {
    const sites = readModeratedSites(this.$store);
    return sites !== null && sites.length > 0;
  }
  get userMode() {
    return readUserMode(this.$store);
  }
  private showLoginPrompt() {
    commitSetShowLoginPrompt(this.$store, true);
  }

  private async mounted() {
    if (this.userProfile) {
      await dispatchCaptureApiError(this.$store, async () => {
        const notifs = (await api.getUnreadNotifications(this.$store.state.main.token)).data;
        if (notifs) {
          notifs.forEach((notif) => {
            if (notif !== null) {
              this.unreadNotifications.push(notif);
            }
          });
        }
        const wsToken = (await api2.getWsToken(this.$store.state.main.token)).data.msg;
        this.wsConnection = new WebSocket(wsUrl + '/api/v1/ws?token=' + wsToken);
        this.wsConnection.onmessage = (message) => {
          const wsMsg = JSON.parse(message.data) as IWsUserMsg;
          this.handleWsMsg(wsMsg);
        };
        if (process.env.NODE_ENV === 'development') {
          this.wsConnection.onerror = (err) => {
            console.log('ws err: ' + err);
          };
          this.wsConnection.onopen = () => {
            console.log('ws opened');
          };
          this.wsConnection.onclose = () => {
            console.log('ws closed');
          };
        }
      });
    }
  }

  private handleWsMsg(msg: IWsUserMsg) {
    if (msg.type === 'notification') {
      if (!this.unreadNotifications.find((notif) => notif.id === msg.data.id)) {
        this.unreadNotifications.unshift(msg.data);
      }
    }
  }
  private async readNotif(notif: INotification) {
    this.readNotifIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      await api.updateNotification(this.$store.state.main.token, notif.id, {
        is_read: true,
      });
      this.unreadNotifications.splice(this.unreadNotifications.indexOf(notif), 1);
      this.readNotifIntermediate = false;
    });
  }
  private async readAllNotifs() {
    this.unreadNotifications.forEach((notif) => {
      this.readNotif(notif);
    });
  }
  private async expandReadNotifications() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.readNotifications === null) {
        this.readNotificationsIntermediate = true;
        this.readNotifications = (
          await api2.getReadNotifications(this.$store.state.main.token)
        ).data;
        this.readNotificationsIntermediate = false;
      }
      this.showReadNotifications = !this.showReadNotifications;
    });
  }

  private beforeRouteEnter(to, from, next) {
    routeGuardMain(to, from, next);
  }

  private beforeRouteUpdate(to, from, next) {
    routeGuardMain(to, from, next);
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

  private readonly accountItems = [
    {
      icon: 'DashboardIcon',
      text: this.$t('Dashboard'),
      to: '/dashboard',
    },
    {
      icon: 'ProfileIcon',
      text: this.$t('个人资料'),
      hrefRequiresUserProfile: true,
      href: (userProfile: IUserProfile) => `/users/${userProfile.handle}`,
    },
  ];

  private showTopMenu = false;
  private showFeedbackForm = false;
  private feedbackScreenshotUrl: string | null = null;
  private feedbackIncludesScreenshot = true;
  private showFeedbackScreenshot = false;
  private feedbackText = '';
  private feedbackEmail = '';

  private prepareFeedbackForm() {
    this.showTopMenu = false;
    setTimeout(() => {
      html2canvas(document.body).then((canvas) => {
        this.showFeedbackForm = !this.showFeedbackForm;
        this.feedbackScreenshotUrl = canvas.toDataURL('image/jpeg', 0.5);
      });
    }, 100);
  }

  private sendingFeedback = false;
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
    await api2.uploadFeedback(this.$store.state.main.token, formData);
    this.sendingFeedback = false;
    this.showFeedbackForm = false;
  }

  private cancelFeedbackForm(reset) {
    this.showFeedbackForm = false;
    reset();
  }
}
</script>

<style>
.search-box {
  min-width: 20%;
  max-width: 40%;
}

.slim-btn {
  padding: 0 8px !important;
}

.thin-btn {
  max-width: 35px !important;
}

.app-bar-inner {
  width: 100%;
}

.opacity-none:before {
  opacity: 0 !important;
}

.v-list-item__action:first-child,
.v-list-item__icon:first-child {
  margin-right: 14px !important;
}
</style>
