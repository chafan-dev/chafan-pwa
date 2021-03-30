<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiArrowExpandHorizontal } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiArrowExpandHorizontal,
  }),
};
</script>
