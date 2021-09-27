<template>
  <div>
    <h3>{{ companyName }}</h3>
    <div>{{ positionName }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class WorkExp extends Vue {
  @Prop() readonly companyName!: string;
  @Prop() readonly positionName!: string;
}
</script>
