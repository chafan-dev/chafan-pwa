<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiAccount } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiAccount,
  }),
};
</script>
