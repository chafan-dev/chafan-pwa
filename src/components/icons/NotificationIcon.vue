<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiBell } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiBell
    }),
  }
</script>