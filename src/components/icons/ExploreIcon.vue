<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiLightbulbOn } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiLightbulbOn,
  }),
};
</script>
