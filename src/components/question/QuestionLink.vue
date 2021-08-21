<template>
  <router-link :to="'/questions/' + id" :class="theme.questionLink.link.classes">
    {{ title }}
  </router-link>
</template>

<script lang="ts">
import { IQuestionPreview } from '@/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { CVue } from '@/common';

@Component
export default class QuestionLink extends CVue {
  @Prop() public readonly questionPreview!: IQuestionPreview;

  get id() {
    return this.questionPreview.uuid;
  }

  get title() {
    return this.questionPreview.title;
  }
}
</script>
