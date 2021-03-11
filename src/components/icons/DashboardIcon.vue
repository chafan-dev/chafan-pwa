<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiViewDashboard } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiViewDashboard,
  }),
};
</script>
