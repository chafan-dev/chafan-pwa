import { useDisplay } from 'vuetify';

/**
 * Composable for responsive breakpoint checks.
 * Uses Vuetify 3's useDisplay() composable.
 */
export function useResponsive() {
  const display = useDisplay();

  return {
    isDesktop: display.mdAndUp,
    isMobile: display.smAndDown,
    breakpoint: display,
  };
}
