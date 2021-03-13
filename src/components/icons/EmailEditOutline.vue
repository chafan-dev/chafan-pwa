<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiEmailEditOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiEmailEditOutline,
  }),
};
</script>
