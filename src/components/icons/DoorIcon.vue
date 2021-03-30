<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiDoor } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiDoor,
  }),
};
</script>
