import { computed } from 'vue';
import { useMainStore } from '@/stores/main';
import { themeDefs } from '@/common';

/**
 * Composable for theme-related state.
 */
export function useTheme() {
  const store = useMainStore();
  const themeType = computed(() => store.theme);
  const theme = computed(() => themeDefs[themeType.value]);

  return {
    themeType,
    theme,
  };
}
