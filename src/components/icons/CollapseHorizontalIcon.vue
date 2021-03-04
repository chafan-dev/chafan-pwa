<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiArrowCollapseHorizontal } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiArrowCollapseHorizontal
    }),
  }
</script>