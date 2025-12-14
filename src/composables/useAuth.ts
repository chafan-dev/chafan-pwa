import { computed } from 'vue';
import { readToken, readUserProfile, readIsLoggedIn } from '@/store/main/getters';
import store from '@/store';

/**
 * Composable for authentication-related state.
 * Replaces CVue's token, loggedIn, currentUserId, and userProfile properties.
 */
export function useAuth() {
  const token = computed(() => readToken(store));
  const loggedIn = computed(() => readIsLoggedIn(store));
  const currentUserId = computed(() => readUserProfile(store)?.uuid);
  const userProfile = computed(() => readUserProfile(store));

  return {
    token,
    loggedIn,
    currentUserId,
    userProfile,
  };
}
