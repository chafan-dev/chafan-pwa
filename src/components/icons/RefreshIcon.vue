<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiRefresh } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiRefresh,
  }),
};
</script>
