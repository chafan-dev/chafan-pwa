<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiTransferRight } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiTransferRight,
  }),
};
</script>
