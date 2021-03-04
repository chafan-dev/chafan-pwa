<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiDeleteForever } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiDeleteForever
    }),
  }
</script>