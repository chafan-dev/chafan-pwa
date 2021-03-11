<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiLinkedin } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiLinkedin,
  }),
};
</script>
