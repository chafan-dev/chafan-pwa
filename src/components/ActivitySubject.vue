<template>
  <span>
    <template v-if="activity.event.content.subjects">
      <UserLink :userPreview="activity.event.content.subjects[0]" />
      <a
        class="text-decoration-none grey--text text--darken-2"
        @click="showSubjects(activity.event.content.subjects)"
      >
        {{
          $t('等x人', {
            n: activity.event.content.subjects.length,
          })
        }}
      </a>
    </template>
    <UserLink v-else :userPreview="activity.event.content.subject" />

    <v-dialog v-model="showSubjectDialog" max-width="600">
      <v-card class="pt-6">
        <v-card-text>
          <UserGrid :users="subjectsInDialog" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showSubjectDialog = false">{{ $t('隐藏') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { IActivity, IUserPreview } from '@/interfaces';
import UserGrid from '@/components/UserGrid.vue';
import UserLink from '@/components/UserLink.vue';

@Component({
  components: { UserLink, UserGrid },
})
export default class EtcPeople extends Vue {
  @Prop() public readonly activity!: IActivity;
  private showSubjectDialog = false;
  private subjectsInDialog: IUserPreview[] = [];

  private showSubjects(subjects: IUserPreview[]) {
    this.showSubjectDialog = true;
    this.subjectsInDialog = subjects;
  }
}
</script>
