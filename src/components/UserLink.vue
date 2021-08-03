<template>
  <v-menu
    v-if="clickable"
    :open-on-hover="!$vuetify.breakpoint.mobile"
    bottom
    :disabled="!enablePopup"
    offset-y
    open-delay="400"
    right
  >
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <router-link
          v-if="userPreview"
          :to="'/users/' + userPreview.handle"
          class="text-decoration-none"
        >
          <Avatar v-if="showAvatar" size="25" :userPreview="userPreview" />
          <span class="ml-1">{{ name }}</span>
        </router-link>
      </span>
    </template>
    <v-lazy>
      <UserCard :compactMode="true" :hoverMode="true" :userPreview="userPreview" />
    </v-lazy>
  </v-menu>
  <span v-else> <Avatar v-if="showAvatar" :userPreview="userPreview" /> {{ name }} </span>
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
  @Prop({ default: true }) public readonly enablePopup!: boolean;

  get name() {
    if (this.userPreview.full_name) {
      return this.userPreview.full_name;
    }
    return `@${this.userPreview.handle}`;
  }
}
</script>
