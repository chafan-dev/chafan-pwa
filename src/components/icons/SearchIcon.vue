<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiMagnify } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiMagnify
    }),
  }
</script>