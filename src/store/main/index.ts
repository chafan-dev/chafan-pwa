import { mutations } from './mutations';
import { getters } from './getters';
import { actions } from './actions';
import { MainState } from './state';

const defaultState: MainState = {
  isLoggedIn: null,
  token: '',
  logInError: false,
  userProfile: null,
  dashboardMiniDrawer: false,
  dashboardShowDrawer: false,
  notifications: [],
  moderated_sites: null,
  userMode: true,
  workingDraft: null,
  topBanner: null,
  showLoginPrompt: false,
  narrowUI: true,
};

export const mainModule = {
  state: defaultState,
  mutations,
  actions,
  getters,
};
