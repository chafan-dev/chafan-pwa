<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiShareAll } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiShareAll,
  }),
};
</script>
