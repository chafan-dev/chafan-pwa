<template>
  <v-icon v-on="$listeners" v-bind="$attrs" color="primary">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiBellSleep } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiBellSleep,
  }),
};
</script>
