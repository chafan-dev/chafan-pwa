<template>
  <div>
    <h3>{{ schoolName }}</h3>
    <div>
      {{ levelName }} <span v-if="major"> - {{ major }}</span>
    </div>
    <div class="grey--text" v-if="enrollYear || graduateYear">
      <span v-if="enrollYear">{{ enrollYear }} - </span>
      <span v-if="graduateYear">{{ graduateYear }}</span
      ><span v-else>在读</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class EduExp extends Vue {
  @Prop() readonly schoolName!: string;
  @Prop() readonly levelName!: string;
  @Prop() readonly major: string | undefined;
  @Prop() readonly enrollYear: string | undefined;
  @Prop() readonly graduateYear: string | undefined;
}
</script>
