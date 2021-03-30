<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script>
import { mdiEmoticonHappyOutline } from '@mdi/js';

export default {
  data: () => ({
    svgPath: mdiEmoticonHappyOutline,
  }),
  inheritAttrs: true,
};
</script>
