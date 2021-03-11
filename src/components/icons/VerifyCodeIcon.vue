<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiLockClock } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiLockClock,
  }),
};
</script>
