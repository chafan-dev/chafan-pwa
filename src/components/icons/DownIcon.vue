<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiChevronDown } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiChevronDown,
  }),
};
</script>
