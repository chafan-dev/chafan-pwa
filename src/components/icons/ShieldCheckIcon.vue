<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiShieldCheck } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiShieldCheck,
  }),
};
</script>
