<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiCommentTextMultiple } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiCommentTextMultiple,
  }),
};
</script>
