<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiBroadcast } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiBroadcast,
  }),
};
</script>
