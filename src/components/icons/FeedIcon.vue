<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiNewspaperVariant } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiNewspaperVariant
    }),
  }
</script>