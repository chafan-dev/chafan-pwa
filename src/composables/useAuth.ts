import { computed } from 'vue';
import { useMainStore } from '@/stores/main';

/**
 * Composable for authentication-related state.
 */
export function useAuth() {
  const store = useMainStore();
  const token = computed(() => store.token);
  const loggedIn = computed(() => store.isLoggedIn);
  const currentUserId = computed(() => store.userProfile?.uuid);
  const userProfile = computed(() => store.userProfile);

  return {
    token,
    loggedIn,
    currentUserId,
    userProfile,
  };
}
