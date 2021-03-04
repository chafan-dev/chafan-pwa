<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiHome } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiHome
    }),
  }
</script>