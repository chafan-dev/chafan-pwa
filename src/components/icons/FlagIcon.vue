<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiFlag } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiFlag,
  }),
};
</script>
