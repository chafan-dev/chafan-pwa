<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiOpenInNew } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiOpenInNew,
  }),
};
</script>
