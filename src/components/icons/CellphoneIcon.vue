<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiCellphone } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiCellphone,
  }),
};
</script>
