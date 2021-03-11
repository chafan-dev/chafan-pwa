<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiArrowExpandHorizontal } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiArrowExpandHorizontal,
  }),
};
</script>
