<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiCompass } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiCompass,
  }),
};
</script>
