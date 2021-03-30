<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiMessageAlertOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiMessageAlertOutline,
  }),
};
</script>
