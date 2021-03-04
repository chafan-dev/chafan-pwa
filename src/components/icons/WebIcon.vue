<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiWeb } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiWeb
    }),
  }
</script>