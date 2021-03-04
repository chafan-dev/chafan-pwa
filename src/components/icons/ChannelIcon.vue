<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiAccountGroup } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiAccountGroup
    }),
  }
</script>