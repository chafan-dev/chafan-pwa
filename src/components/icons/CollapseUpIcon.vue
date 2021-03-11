<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiArrowCollapseUp } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiArrowCollapseUp,
  }),
};
</script>
