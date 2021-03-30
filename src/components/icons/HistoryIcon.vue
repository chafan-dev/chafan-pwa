<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiHistory } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiHistory,
  }),
};
</script>
