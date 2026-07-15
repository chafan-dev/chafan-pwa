import { computed } from 'vue';
import { useUiStore } from '@/stores/ui';
import { themeDefs } from '@/common';

/**
 * Composable for theme-related state.
 */
export function useTheme() {
  const store = useUiStore();
  const themeType = computed(() => store.theme);
  const theme = computed(() => themeDefs[themeType.value]);

  return {
    themeType,
    theme,
  };
}
