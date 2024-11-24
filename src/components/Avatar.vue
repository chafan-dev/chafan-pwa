<template>
  <v-avatar class="avatar-div" :size="size" :color="color" rounded>
    <v-img :src="url" alt="Avatar" />
  </v-avatar>
</template>

<script lang="ts">
import { IUserPreview } from '@/interfaces';
import { Component, Prop } from 'vue-property-decorator';
import { CVue } from '@/common';

const DEFAULT_URL = '/img/default-avatar.png';

@Component
export default class Avatar extends CVue {
  @Prop() public readonly userPreview: IUserPreview | undefined;
  @Prop() public readonly avatarUrl: string | undefined;
  @Prop({ default: 30 }) public readonly size!: number;
  @Prop() public readonly color: 'primary' | undefined;

  get url() {
    if (this.isDev && !this.isProdDev) {
      return 'https://cdn.jsdelivr.net/npm/programming-languages-logos/src/c/c.png';
    } else if (this.userPreview) {
      return this.userPreview.avatar_url ? this.userPreview.avatar_url : DEFAULT_URL;
    } else if (this.avatarUrl) {
      return this.avatarUrl;
    } else {
      return DEFAULT_URL;
    }
  }
}
</script>
