<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiArrowCollapseHorizontal } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiArrowCollapseHorizontal,
  }),
};
</script>
