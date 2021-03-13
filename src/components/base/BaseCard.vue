<template>
  <v-sheet>
    <v-card v-bind="$attrs" :class="{ 'c-card': !embedded }" :flat="embedded">
      <slot />
    </v-card>

    <v-divider v-if="divider" class="mt-3" />
  </v-sheet>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'BaseCard',
})
export default class BaseCard extends Vue {
  @Prop({ default: false }) private readonly embedded!: boolean;
  @Prop({ default: false }) private readonly divider!: boolean;
}
</script>

<style scoped>
.c-card {
  box-shadow: 0 5px 10px -10px rgba(85, 85, 85, 0.08), 0 10px 20px 0 rgba(85, 85, 85, 0.06),
    0 15px 30px 0 rgba(85, 85, 85, 0.03) !important;
}
</style>
