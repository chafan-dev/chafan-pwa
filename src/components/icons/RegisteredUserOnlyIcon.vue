<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiLock } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiLock,
  }),
};
</script>
