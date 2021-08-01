<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiChevronUp } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiChevronUp,
  }),
};
</script>
