<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiAccountCircleOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiAccountCircleOutline,
  }),
};
</script>
