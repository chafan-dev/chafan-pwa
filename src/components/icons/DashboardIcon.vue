<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiViewDashboard } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiViewDashboard,
  }),
};
</script>
