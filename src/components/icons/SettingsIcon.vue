<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiCogOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiCogOutline,
  }),
};
</script>
