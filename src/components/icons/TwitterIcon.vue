<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiTwitter } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiTwitter,
  }),
};
</script>
