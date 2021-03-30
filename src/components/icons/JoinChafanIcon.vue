<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiGamepadVariant } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiGamepadVariant,
  }),
};
</script>
