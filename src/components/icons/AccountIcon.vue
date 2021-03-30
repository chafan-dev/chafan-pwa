<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiAccount } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiAccount,
  }),
};
</script>
