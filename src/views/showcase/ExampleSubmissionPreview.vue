<template>
  <v-card>
    <v-card-text>
      <SubmissionPreview
        :submission="mockData.exampleSubmission"
        :upvotes-placeholder="mockData.exampleSubmissionUpvotes"
        :disabled-placeholder="submissionPreviewDisabled"
      />
    </v-card-text>
    <v-card-actions>
      <v-switch label="upvoted" v-model="mockData.exampleSubmissionUpvotes.upvoted" />
      <v-switch class="ml-4" label="disabled" v-model="submissionPreviewDisabled" />
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SubmissionPreview from '@/components/SubmissionPreview.vue';
import * as mockData from '@/mock/data';

@Component({
  components: { SubmissionPreview },
})
export default class ExampleSubmissionPreview extends Vue {
  private mockData = mockData;
  private submissionPreviewDisabled = false;
}
</script>
