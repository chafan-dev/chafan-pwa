<template>
  <v-icon v-bind="$attrs" v-on="$listeners" color="primary">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiBellSleep } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiBellSleep,
  }),
};
</script>
