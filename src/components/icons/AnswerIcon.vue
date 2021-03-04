<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiText } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiText
    }),
  }
</script>