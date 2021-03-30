<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiCommentTextMultiple } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiCommentTextMultiple,
  }),
};
</script>
