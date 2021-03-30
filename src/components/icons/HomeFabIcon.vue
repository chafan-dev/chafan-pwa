<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiCompass } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiCompass,
  }),
};
</script>
