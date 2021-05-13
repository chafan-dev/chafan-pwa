<template>
  <v-sheet>
    <v-card v-bind="$attrs" :class="{ 'c-card': !flat, 'pa-2': !noGutter }" :flat="flat">
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
  @Prop({ default: false }) private readonly flat!: boolean;
  @Prop({ default: false }) private readonly divider!: boolean;
  @Prop({ default: false }) private readonly noGutter!: boolean;
}
</script>
