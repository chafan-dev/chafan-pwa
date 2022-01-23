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
  workingDraft: null,
  topBanner: null,
  showLoginPrompt: false,
  narrowUI: true,
  theme: 'default',
};

export const mainModule = {
  state: defaultState,
  mutations,
  actions,
  getters,
};
