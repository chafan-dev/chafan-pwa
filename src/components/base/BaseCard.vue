<template>
  <v-sheet>
    <v-card v-bind="$attrs" :class="classes" :flat="flat">
      <slot />
    </v-card>

    <v-divider v-if="divider" class="mt-3" />
  </v-sheet>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { CVue } from '@/common';

@Component({
  name: 'BaseCard',
})
export default class BaseCard extends CVue {
  @Prop({ default: false }) private readonly flat!: boolean;
  @Prop({ default: false }) private readonly divider!: boolean;
  @Prop({ default: false }) private readonly noGutter!: boolean;

  get classes() {
    return { [this.theme.baseCard.classKey]: !this.flat, 'pa-2': !this.noGutter };
  }
}
</script>
