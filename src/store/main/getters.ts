import { MainState } from './state';
import { getStoreAccessors } from 'typesafe-vuex';
import { State } from '../state';

export const getters = {
  hasModeratedSites: (state: MainState) => {
    return state.moderated_sites && state.moderated_sites.length > 0;
  },
  loginError: (state: MainState) => state.logInError,
  dashboardShowDrawer: (state: MainState) => state.dashboardShowDrawer,
  dashboardMiniDrawer: (state: MainState) => state.dashboardMiniDrawer,
  userProfile: (state: MainState) => state.userProfile,
  moderatedSites: (state: MainState) => state.moderated_sites,
  token: (state: MainState) => state.token,
  topBanner: (state: MainState) => state.topBanner,
  localePreference: (state: MainState) => state.userProfile?.locale_preference,
  isLoggedIn: (state: MainState) => state.isLoggedIn,
  showLoginPrompt: (state: MainState) => state.showLoginPrompt,
  firstNotification: (state: MainState) => state.notifications.length > 0 && state.notifications[0],
  workingDraft: (state: MainState) => state.workingDraft,
  narrowUI: (state: MainState) => state.narrowUI,
  theme: (state: MainState) => state.theme,
};

const { read } = getStoreAccessors<MainState, State>('');

export const readDashboardMiniDrawer = read(getters.dashboardMiniDrawer);
export const readDashboardShowDrawer = read(getters.dashboardShowDrawer);
export const readHasModeratedSites = read(getters.hasModeratedSites);
export const readIsLoggedIn = read(getters.isLoggedIn);
export const readShowLoginPrompt = read(getters.showLoginPrompt);
export const readLoginError = read(getters.loginError);
export const readToken = read(getters.token);
export const readUserProfile = read(getters.userProfile);
export const readModeratedSites = read(getters.moderatedSites);
export const readFirstNotification = read(getters.firstNotification);
export const readWorkingDraft = read(getters.workingDraft);
export const readNarrowUI = read(getters.narrowUI);
export const readTheme = read(getters.theme);
