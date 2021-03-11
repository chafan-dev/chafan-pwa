<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiOpenInNew } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiOpenInNew,
  }),
};
</script>
