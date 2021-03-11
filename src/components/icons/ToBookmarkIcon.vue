<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiBookmarkPlusOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiBookmarkPlusOutline,
  }),
};
</script>
