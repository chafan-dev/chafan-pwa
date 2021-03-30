<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiTranslate } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiTranslate,
  }),
};
</script>
