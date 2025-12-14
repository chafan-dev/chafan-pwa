<template>
  <v-menu
    v-if="clickable"
    :disabled="!enablePopup"
    :open-on-hover="!breakpoint.mobile"
    bottom
    offset-y
    open-delay="400"
    right
  >
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <router-link
          v-if="userPreview"
          :class="theme.userLink.link.classes"
          :to="'/users/' + userPreview.handle"
        >
          <Avatar v-if="showAvatar" :userPreview="userPreview" size="25" />
          <span class="ml-1">{{ name }}</span>
        </router-link>
      </span>
    </template>
    <v-lazy>
      <UserCard :compactMode="true" :hoverMode="true" :userPreview="userPreview" />
    </v-lazy>
  </v-menu>
  <span v-else> <Avatar v-if="showAvatar" :userPreview="userPreview" /> {{ name }} </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IUserPreview } from '@/interfaces';
import Avatar from '@/components/Avatar.vue';
import UserCard from '@/components/UserCard.vue';
import { useTheme, useResponsive } from '@/composables';

const props = withDefaults(defineProps<{
  userPreview: IUserPreview;
  showAvatar?: boolean;
  clickable?: boolean;
  enablePopup?: boolean;
}>(), {
  showAvatar: false,
  clickable: true,
  enablePopup: true,
});

const { theme } = useTheme();
const { breakpoint } = useResponsive();

const name = computed(() => {
  if (props.userPreview.full_name) {
    return props.userPreview.full_name;
  }
  return `@${props.userPreview.handle}`;
});
</script>
