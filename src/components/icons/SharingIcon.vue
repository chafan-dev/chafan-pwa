<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiForum } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiForum
    }),
  }
</script>