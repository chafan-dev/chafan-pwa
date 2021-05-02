<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiShare } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiShare,
  }),
};
</script>
