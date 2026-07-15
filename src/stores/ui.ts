import { defineStore } from 'pinia';
import { IRichEditorState, ITopBanner, ThemeType } from '@/interfaces';

/**
 * UI chrome / presentation state (drawers, theme, drafts, prompts).
 * Kept separate from auth/session in the main store.
 */
export const useUiStore = defineStore('ui', {
  state: () => ({
    dashboardMiniDrawer: false as boolean,
    dashboardShowDrawer: false as boolean,
    workingDraft: null as IRichEditorState | null,
    topBanner: null as ITopBanner | null,
    showLoginPrompt: false as boolean,
    narrowUI: true as boolean,
    theme: 'default' as ThemeType,
  }),

  actions: {
    setTheme(theme: ThemeType) {
      this.theme = theme;
    },
    toggleShowDrawer() {
      this.dashboardShowDrawer = !this.dashboardShowDrawer;
    },
    toggleMiniDrawer() {
      this.dashboardMiniDrawer = !this.dashboardMiniDrawer;
    },
    openLoginPrompt() {
      this.showLoginPrompt = true;
    },
    closeLoginPrompt() {
      this.showLoginPrompt = false;
    },
  },
});
