<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiDotsHorizontalCircleOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiDotsHorizontalCircleOutline,
  }),
};
</script>
