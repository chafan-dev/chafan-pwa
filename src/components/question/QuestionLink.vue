<template>
  <router-link :to="'/questions/' + id" class="text-decoration-none">
    {{ title }}
  </router-link>
</template>

<script lang="ts">
import { IQuestionPreview } from '@/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class QuestionLink extends Vue {
  @Prop() public readonly questionPreview!: IQuestionPreview;

  get id() {
    return this.questionPreview.uuid;
  }

  get title() {
    return this.questionPreview.title;
  }
}
</script>
