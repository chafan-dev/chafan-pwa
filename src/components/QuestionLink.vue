<template>
    <RouterLink class="text-decoration-none" :to="'/questions/' + id">
        {{ title }}
    </RouterLink>
</template>

<script lang="ts">
import { IQuestionPreview } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';
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
