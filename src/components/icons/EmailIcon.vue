<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiEmail } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiEmail,
  }),
};
</script>
