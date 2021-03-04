<template>
  <v-icon v-on="$listeners" v-bind="$attrs" :small="!$vuetify.breakpoint.mdAndUp">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiShieldCheck } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiShieldCheck
    }),
  }
</script>