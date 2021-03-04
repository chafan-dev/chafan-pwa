<template>
  <v-icon v-on="$listeners" v-bind="$attrs" small>{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiLock } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiLock
    }),
  }
</script>