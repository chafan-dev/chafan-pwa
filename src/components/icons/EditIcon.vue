<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiPencil } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiPencil,
  }),
};
</script>
