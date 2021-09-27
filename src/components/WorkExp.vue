<template>
  <div>
    <template v-if="compact"> {{ companyName }} · {{ positionName }} </template>
    <template v-else>
      <h3>{{ companyName }}</h3>
      <div>{{ positionName }}</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class WorkExp extends Vue {
  @Prop() readonly companyName!: string;
  @Prop() readonly positionName!: string;
  @Prop({ default: false }) readonly compact!: boolean;
}
</script>
