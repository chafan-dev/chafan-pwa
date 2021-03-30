<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiWeb } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiWeb,
  }),
};
</script>
