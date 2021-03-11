<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiInformationOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiInformationOutline,
  }),
};
</script>
