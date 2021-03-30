<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiInformationOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiInformationOutline,
  }),
};
</script>
