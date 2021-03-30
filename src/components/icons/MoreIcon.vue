<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiDotsHorizontalCircleOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiDotsHorizontalCircleOutline,
  }),
};
</script>
