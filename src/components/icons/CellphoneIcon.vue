<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiCellphone } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiCellphone
    }),
  }
</script>