<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiBookmarkPlusOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiBookmarkPlusOutline,
  }),
};
</script>
