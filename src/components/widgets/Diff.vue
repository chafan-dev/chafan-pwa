<template>
  <span>
    <span v-for="(diff, idx) in diffs" :key="idx">
      <span v-if="diff.added" class="green--text text--darken-2">{{ diff.value }}</span>
      <span v-if="diff.removed" class="red--text text--darken-2">{{ diff.value }}</span>
      ...
    </span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import * as diff from 'diff';

@Component
export default class Diff extends Vue {
  @Prop() readonly s1!: string;
  @Prop() readonly s2!: string;

  get diffs() {
    return diff.diffLines(this.s1, this.s2, {
      newlineIsToken: true,
    });
  }
}
</script>
