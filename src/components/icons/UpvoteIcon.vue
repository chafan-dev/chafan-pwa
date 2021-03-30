<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiArrowUpBold } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiArrowUpBold,
  }),
};
</script>
