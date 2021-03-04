<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiLink } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiLink
    }),
  }
</script>