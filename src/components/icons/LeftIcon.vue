<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiChevronLeft } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiChevronLeft,
  }),
};
</script>
