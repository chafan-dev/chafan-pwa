<template>
  <div>
    <v-lazy v-for="user in users" :key="user.uuid" class="my-2">
      <UserCard :compactMode="true" :userPreview="user" />
    </v-lazy>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserCard from '@/components/UserCard.vue';
import { IUserPreview } from '@/interfaces';

@Component({
  name: 'UserGrid',
  components: { UserCard },
})
export default class UserGrid extends Vue {
  @Prop() private readonly users!: IUserPreview[];
  private readonly memberCols = this.$vuetify.breakpoint.mdAndUp ? 3 : 2;
}
</script>
