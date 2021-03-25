<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiMessageAlertOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiMessageAlertOutline,
  }),
};
</script>
