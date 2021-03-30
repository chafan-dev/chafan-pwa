<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiKey } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiKey,
  }),
};
</script>
