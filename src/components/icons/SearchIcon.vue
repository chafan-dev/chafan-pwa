<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiMagnify } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiMagnify,
  }),
};
</script>
