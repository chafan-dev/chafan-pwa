<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiTwitter } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiTwitter
    }),
  }
</script>