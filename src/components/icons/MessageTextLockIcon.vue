<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiMessageTextLock } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiMessageTextLock,
  }),
};
</script>
