<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiEmoticonHappyOutline } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiEmoticonHappyOutline
    }),
    inheritAttrs: true,
  }
</script>