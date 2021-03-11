<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiAccountCircle } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiAccountCircle,
  }),
};
</script>
