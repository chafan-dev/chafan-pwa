<template>
  <div>
    <template v-if="compact">
      {{ schoolName }} · {{ levelName }}
      <span v-if="major || enrollYear || graduateYear" class="grey--text">
        (<span v-if="major">{{ major }}, </span
        ><span class="grey--text" v-if="enrollYear || graduateYear"
          ><span v-if="enrollYear">{{ enrollYear }} - </span
          ><span v-if="graduateYear">{{ graduateYear }}</span
          ><span v-else>在读</span> </span
        >)
      </span>
    </template>
    <template v-else>
      <h3>{{ schoolName }}</h3>
      <div>
        {{ levelName }} <span v-if="major"> - {{ major }}</span>
      </div>
      <div class="grey--text" v-if="enrollYear || graduateYear">
        <span v-if="enrollYear">{{ enrollYear }} - </span>
        <span v-if="graduateYear">{{ graduateYear }}</span
        ><span v-else>在读</span>
      </div>
    </template>
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
  @Prop({ default: false }) readonly compact!: boolean;
}
</script>
