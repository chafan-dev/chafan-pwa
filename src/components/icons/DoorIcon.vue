<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiDoor } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiDoor
    }),
  }
</script>