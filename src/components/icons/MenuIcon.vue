<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiDotsVertical } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiDotsVertical,
  }),
};
</script>
