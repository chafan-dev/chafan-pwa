<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiPencil } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiPencil,
  }),
};
</script>
