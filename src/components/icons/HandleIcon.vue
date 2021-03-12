<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiAt } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiAt,
  }),
};
</script>
