<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiBookshelf } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiBookshelf,
  }),
};
</script>
