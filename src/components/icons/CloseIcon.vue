<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiClose } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiClose,
  }),
};
</script>
