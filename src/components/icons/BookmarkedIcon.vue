<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiBookmarkCheck } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiBookmarkCheck,
  }),
};
</script>
