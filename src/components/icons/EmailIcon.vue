<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiEmail } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiEmail
    }),
  }
</script>