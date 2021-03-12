<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiShieldCheck } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiShieldCheck,
  }),
};
</script>
