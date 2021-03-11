<template>
  <v-icon v-on="$listeners" v-bind="$attrs" color="primary">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiBookmarkCheck } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiBookmarkCheck,
  }),
};
</script>
