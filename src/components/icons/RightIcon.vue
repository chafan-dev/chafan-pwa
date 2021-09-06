<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiChevronRight } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiChevronRight,
  }),
};
</script>
