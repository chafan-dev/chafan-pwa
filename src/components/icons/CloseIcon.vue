<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiClose } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiClose
    }),
  }
</script>