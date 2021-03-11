<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiTranslate } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiTranslate,
  }),
};
</script>
