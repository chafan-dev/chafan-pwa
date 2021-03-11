<template>
  <v-menu
    :open-on-hover="!$vuetify.breakpoint.mobile"
    bottom
    right
    offset-y
    v-if="clickable"
    open-delay="400"
  >
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <a
          class="text-decoration-none grey--text text--darken-2"
          v-if="userPreview"
          :href="'/users/' + userPreview.handle"
        >
          <Avatar :userPreview="userPreview" v-if="showAvatar" />
          {{ name }}
        </a>
      </span>
    </template>
    <v-lazy>
      <UserCard :userPreview="userPreview" :compactMode="true" :hoverMode="true" />
    </v-lazy>
  </v-menu>
  <span v-else> <Avatar :userPreview="userPreview" v-if="showAvatar" /> {{ name }} </span>
</template>

<script lang="ts">
import { IUserPreview } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';
import Avatar from '@/components/Avatar.vue';
import UserCard from '@/components/UserCard.vue';

@Component({
  name: 'UserLink',
  components: { Avatar, UserCard },
})
export default class UserLink extends Vue {
  @Prop() public readonly userPreview!: IUserPreview;
  @Prop({ default: false }) public readonly showAvatar!: boolean;
  @Prop({ default: true }) public readonly clickable!: boolean;
  get name() {
    if (this.userPreview.full_name) {
      return this.userPreview.full_name;
    }
    return `@${this.userPreview.handle}`;
  }
}
</script>
