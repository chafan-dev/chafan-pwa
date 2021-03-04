<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiGithub } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiGithub
    }),
  }
</script>