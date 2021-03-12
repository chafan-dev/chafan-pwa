<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiHomeCity } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiHomeCity,
  }),
};
</script>
