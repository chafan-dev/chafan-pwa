<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables';

const props = withDefaults(defineProps<{
  flat?: boolean;
  divider?: boolean;
  noGutter?: boolean;
}>(), {
  flat: false,
  divider: false,
  noGutter: false,
});

const { theme } = useTheme();

const classes = computed(() => ({
  [theme.value.baseCard.classKey]: !props.flat,
  'pa-2': !props.noGutter,
}));
</script>

<template>
  <v-sheet>
    <v-card v-bind="$attrs" :class="classes" :flat="flat">
      <slot />
    </v-card>

    <v-divider v-if="divider" class="mt-3" />
  </v-sheet>
</template>
