<template>
  <v-icon v-bind="$attrs" v-on="$listeners" small>{{ svgPath }}</v-icon>
</template>

<script>
import { mdiEarth } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiEarth,
  }),
};
</script>
