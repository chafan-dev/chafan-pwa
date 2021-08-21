import { IRichEditorState, ISite, ITopBanner, IUserProfile, ThemeType } from '@/interfaces';
import { AppNotification, MainState } from './state';
import { getStoreAccessors } from 'typesafe-vuex';
import { State } from '../state';

export const mutations = {
  setToken(state: MainState, payload: string) {
    state.token = payload;
  },
  setUserMode(state: MainState, payload: boolean) {
    state.userMode = payload;
  },
  setLoggedIn(state: MainState, payload: boolean) {
    state.isLoggedIn = payload;
  },
  setShowLoginPrompt(state: MainState, payload: boolean) {
    state.showLoginPrompt = payload;
  },
  setLogInError(state: MainState, payload: boolean) {
    state.logInError = payload;
  },
  setUserProfile(state: MainState, payload: IUserProfile) {
    state.userProfile = payload;
  },
  setWorkingDraft(state: MainState, payload: IRichEditorState) {
    state.workingDraft = payload;
  },
  setNarrowUI(state: MainState, payload: boolean) {
    state.narrowUI = payload;
  },
  setModeratedSites(state: MainState, payload: ISite[]) {
    state.moderated_sites = payload;
  },
  setTopBanner(state: MainState, payload: ITopBanner) {
    state.topBanner = payload;
  },
  setDashboardMiniDrawer(state: MainState, payload: boolean) {
    state.dashboardMiniDrawer = payload;
  },
  setDashboardShowDrawer(state: MainState, payload: boolean) {
    state.dashboardShowDrawer = payload;
  },
  addNotification(state: MainState, payload: AppNotification) {
    state.notifications.push(payload);
  },
  removeNotification(state: MainState, payload: AppNotification) {
    state.notifications = state.notifications.filter((notification) => notification !== payload);
  },
  setTheme(state: MainState, theme: ThemeType) {
    state.theme = theme;
  },
};

const { commit } = getStoreAccessors<MainState | any, State>('');

export const commitSetDashboardMiniDrawer = commit(mutations.setDashboardMiniDrawer);
export const commitSetDashboardShowDrawer = commit(mutations.setDashboardShowDrawer);
export const commitSetLoggedIn = commit(mutations.setLoggedIn);
export const commitSetShowLoginPrompt = commit(mutations.setShowLoginPrompt);
export const commitSetLogInError = commit(mutations.setLogInError);
export const commitSetUserMode = commit(mutations.setUserMode);
export const commitSetToken = commit(mutations.setToken);
export const commitSetTopBanner = commit(mutations.setTopBanner);
export const commitSetUserProfile = commit(mutations.setUserProfile);
export const commitSetModeratedSites = commit(mutations.setModeratedSites);
export const commitAddNotification = commit(mutations.addNotification);
export const commitRemoveNotification = commit(mutations.removeNotification);
export const commitSetWorkingDraft = commit(mutations.setWorkingDraft);
export const commitSetNarrowUI = commit(mutations.setNarrowUI);
export const commitSetTheme = commit(mutations.setTheme);
