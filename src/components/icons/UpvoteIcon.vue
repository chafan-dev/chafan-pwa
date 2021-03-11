<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiArrowUpBold } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiArrowUpBold,
  }),
};
</script>
