<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiKey } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiKey,
  }),
};
</script>
