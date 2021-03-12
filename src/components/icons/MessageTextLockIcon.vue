<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiMessageTextLock } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiMessageTextLock,
  }),
};
</script>
