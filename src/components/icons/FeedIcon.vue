<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiNewspaperVariant } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiNewspaperVariant,
  }),
};
</script>
