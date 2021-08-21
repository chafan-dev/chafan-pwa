<template>
  <span>
    <template v-if="activity.event.content.subjects">
      <UserLink :userPreview="activity.event.content.subjects[0]" />
      <a class="text-decoration-none grey--text text--darken-2" @click="showUsersDialog">
        等{{ activity.event.content.subjects.length }}人
      </a>
    </template>
    <UserLink v-else :userPreview="activity.event.content.subject" />
  </span>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { IActivity } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';

@Component({
  components: { UserLink },
})
export default class EtcPeople extends Vue {
  @Prop() public readonly activity!: IActivity;

  @Emit('show-users-dialog')
  private showUsersDialog() {
    return (this.activity.event.content as any).subjects;
  }
}
</script>
