import { computed } from 'vue';
import { readTheme } from '@/store/main/getters';
import { themeDefs } from '@/common';
import store from '@/store';

/**
 * Composable for theme-related state.
 * Replaces CVue's theme property.
 *
 * Returns the full theme definition object based on current theme setting.
 */
export function useTheme() {
  const themeType = computed(() => readTheme(store));
  const theme = computed(() => themeDefs[themeType.value]);

  return {
    themeType,
    theme,
  };
}
