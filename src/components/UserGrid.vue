<template>
  <div>
    <template v-for="i in Math.floor((users.length - 1) / memberCols) + 1">
      <v-row :key="i">
        <template v-for="j in memberCols">
          <v-col :key="(i - 1) * memberCols + (j - 1)">
            <UserCard
              v-if="(i - 1) * memberCols + (j - 1) < users.length"
              :compactMode="true"
              :userPreview="users[(i - 1) * memberCols + (j - 1)]"
            />
          </v-col>
        </template>
      </v-row>
    </template>
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
