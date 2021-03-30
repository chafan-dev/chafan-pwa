<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiRefresh } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiRefresh,
  }),
};
</script>
