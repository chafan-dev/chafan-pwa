<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiHistory } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiHistory
    }),
  }
</script>