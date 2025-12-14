import { computed } from 'vue';
import vuetify from '@/plugins/vuetify';

/**
 * Composable for responsive breakpoint checks.
 * Replaces CVue's isDesktop property.
 *
 * Note: In Vue 2.7 with Vuetify 2, we access the breakpoint through
 * the vuetify instance. In Vue 3 with Vuetify 3, this will use useDisplay().
 */
export function useResponsive() {
  const isDesktop = computed(() => vuetify.framework.breakpoint.mdAndUp);
  const isMobile = computed(() => vuetify.framework.breakpoint.smAndDown);
  const breakpoint = computed(() => vuetify.framework.breakpoint);

  return {
    isDesktop,
    isMobile,
    breakpoint,
  };
}
